import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { buildCoverInstructionEmbeddingPrefixWithMeta } from "@/lib/agent/instruction-embeddings";
import {
  combineClientInstructionsForModel,
  resolveSystemInstructionsWithEmbeddings,
  buildPrompt,
  type ClientContext,
  type PostContext,
} from "@/lib/agent/instructions";
import { buildCoverPrompt, truncateCoverImageSubject } from "@/lib/agent/cover-prompt";
import { loadCoverReferenceImageParts } from "@/lib/agent/cover-reference-images";
import { requireCoverReferenceVisionBrief } from "@/lib/agent/cover-reference-vision";
import { generateCoverImageBufferWithEmbedFallback } from "@/lib/agent/gemini-cover-image";
import { resolveClientBrandColors } from "@/lib/agent/resolve-client-brand-colors";
import { clampMetaDescription, clampSeoTitle } from "@/lib/agent/clamp-seo-fields";
import { improvePostTo90 } from "@/lib/agent/improve-to-90";
import { seoScoreAverage, seoScoreMeetsPublishBar } from "@/lib/agent/score-post";
import {
  appendAuthorBlock,
  contentMdHasEmbeddedAuthorBlock,
  extractAuthorFieldsFromContentMd,
  sanitizeInternalMarkdownLinks,
  sanitizeRelativeMarkdownLinks,
  convertInternalLinksToRelative,
} from "@/lib/agent/internal-link";
import { getCandidateSiteUrls, enrichWithTitles } from "@/lib/agent/site-urls";
import { buildRevalidationPayload, buildWebhookHeaders, resolveWebhookEvent } from "@/lib/cms-api/webhooks";
import type { Locale } from "@/lib/types/db";
import { FREQUENCY_INTERVAL_MS } from "@/lib/scheduler/next-post";
import { verifyTrafficSchedulerInternalRequest } from "@/lib/scheduler/traffic-internal-auth";
import { pickRandomBylineAuthorId, resolveAuthorForByline } from "@/lib/data/blog-authors";

const MODEL = "gemini-3.1-flash-lite-preview";

/**
 * POST /api/scheduler/run
 *
 * Triggered by GET /api/scheduler/trigger (called on app traffic, rate-limited) or by manual POST with CRON_SECRET.
 * When run, it checks last_post_generated_at + frequency per client and only processes clients who are due.
 * With auto_publish + webhook, due clients get generated; posts publish only when SEO avg (SEO+AEO+GEO) ≥ 90, else status stays review. No cron required.
 *
 * For each client whose frequency interval has elapsed since last_post_generated_at,
 * this route:
 *   1. Creates a new draft post row
 *   2. Generates content with Gemini (same pipeline as manual "Generate with AI")
 *   3. Generates a cover image with Imagen 4
 *   4. Publishes the post (and optionally sends to webhook if configured)
 *   5. Updates clients.last_post_generated_at
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const cronMatch = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);
  const trafficInternal = verifyTrafficSchedulerInternalRequest(req);

  if (!cronMatch && !trafficInternal) {
    // Allow authenticated admin to run from the admin panel (no CRON_SECRET in browser)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = createAdminClient();
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .single();
    if (roleRow?.role_id !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ?force=true bypasses the frequency interval check â€” useful for testing
  const force = new URL(req.url).searchParams.get("force") === "true";
  const userIdParam = new URL(req.url).searchParams.get("userId");

  const admin = createAdminClient();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const imagenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // Fetch all clients that have completed onboarding (have a domain)
  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("id, user_id, domain, frequency, last_post_generated_at, google_access_token, google_scope, auto_publish, webhook_url, webhook_event_format, post_locale, brand_name, brand_tone, brand_book, company_name, logo_url, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, custom_instructions, instruction_reinforcement, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_text")
    .not("domain", "is", null);

  if (clientsError) {
    console.error("[scheduler] Failed to fetch clients:", clientsError.message);
    return NextResponse.json({ error: clientsError.message }, { status: 500 });
  }

  let clientsToConsider = clients ?? [];
  let singleUserForce = false;
  if (userIdParam) {
    const match = clientsToConsider.filter((c) => c.user_id === userIdParam);
    if (match.length === 0) {
      return NextResponse.json(
        { error: "User not found or has no client with domain (onboarding incomplete)." },
        { status: 400 }
      );
    }
    clientsToConsider = match;
    singleUserForce = true;
  }

  const now = Date.now();
  const results: Array<{ client_id: string; domain: string; status: string; post_id?: string; error?: string }> = [];

  const dueClients: NonNullable<typeof clients> = [];
  for (const client of clientsToConsider) {
    const intervalMs = FREQUENCY_INTERVAL_MS[client.frequency] ?? FREQUENCY_INTERVAL_MS.weekly;
    const lastRun = client.last_post_generated_at ? new Date(client.last_post_generated_at).getTime() : 0;
    const due = force || singleUserForce || now - lastRun >= intervalMs;
    if (due) {
      dueClients.push(client);
    } else {
      results.push({ client_id: client.id, domain: client.domain, status: "skipped_not_due" });
    }
  }

  // Process due clients with a random stagger (0â€“30 s per client) to spread API load
  for (let i = 0; i < dueClients.length; i++) {
    const client = dueClients[i];
    if (i > 0) {
      // Random delay 5â€“30 s between each client
      const jitterMs = 5_000 + Math.floor(Math.random() * 25_000);
      await new Promise((r) => setTimeout(r, jitterMs));
    }

    try {
      const postId = await generatePostForClient(client, admin, genAI, imagenAI, {
        skipDueClaim: force || singleUserForce,
        now,
      });
      if (postId === null) {
        results.push({ client_id: client.id, domain: client.domain, status: "skipped_concurrent" });
        continue;
      }
      results.push({ client_id: client.id, domain: client.domain, status: "generated", post_id: postId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[scheduler] Failed for client ${client.domain}:`, msg);
      results.push({ client_id: client.id, domain: client.domain, status: "error", error: msg });
    }
  }

  const generated = results.filter((r) => r.status === "generated").length;
  const skipped =
    results.filter((r) => r.status === "skipped_not_due" || r.status === "skipped_concurrent").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log(`[scheduler] Done â€” generated: ${generated}, skipped: ${skipped}, errors: ${errors}`);

  return NextResponse.json({ ok: true, generated, skipped, errors, results });
}

// GET: health check, or run scheduler when authorized (Vercel Cron sends Authorization: Bearer CRON_SECRET, or ?secret=CRON_SECRET)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secretParam = url.searchParams.get("secret");
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const authorized =
    cronSecret &&
    (secretParam === cronSecret || authHeader === `Bearer ${cronSecret}`);
  if (authorized) {
    const mockPost = new NextRequest(req.url, { method: "POST", headers: req.headers });
    return POST(mockPost);
  }
  return NextResponse.json({
    ok: true,
    message: "Scheduler endpoint is live. Trigger: Vercel Cron (time-based) or GET ?secret=CRON_SECRET or POST with Bearer CRON_SECRET.",
    next_run: "Vercel Cron runs on schedule (see vercel.json). Manual: GET /api/scheduler?secret=CRON_SECRET or POST with Bearer CRON_SECRET.",
  });
}

// â”€â”€â”€ Core generation logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ALL_LOCALES = ["pt", "en", "fr"] as const;
type SupportedLocale = (typeof ALL_LOCALES)[number];

type GeneratedContent = {
  title: string;
  slug?: string;
  core_argument?: string;
  cover_image_description?: string;
  cover_image_headline?: string;
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  excerpt: string;
  content_md: string;
  faq_blocks: Array<{ question: string; answer: string }>;
  seo_score?: { seo: number; aeo: number; geo: number; notes: string };
};

type SchedulerRunOpts = {
  /** When true, skip the DB claim (admin force / per-user generate). */
  skipDueClaim: boolean;
  now: number;
};

type SchedulerClient = {
  id: string;
  user_id: string;
  domain: string;
  frequency: string;
  last_post_generated_at?: string | null;
  google_access_token: string | null;
  google_scope: string | null;
  auto_publish?: boolean | null;
  webhook_url?: string | null;
  webhook_event_format?: "spec" | "legacy" | null;
  post_locale?: string | null;
  brand_name?: string | null;
  brand_tone?: string | null;
  brand_book?: unknown;
  company_name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  tertiary_color?: string | null;
  alternative_color?: string | null;
  font_style?: string | null;
  brand_voice?: string | null;
  custom_instructions?: string | null;
  instruction_reinforcement?: string | null;
  cover_reference_image_1?: string | null;
  cover_reference_image_2?: string | null;
  cover_reference_image_3?: string | null;
  brand_guidelines_text?: string | null;
};

async function generatePostForClient(
  client: SchedulerClient,
  admin: ReturnType<typeof createAdminClient>,
  genAI: GoogleGenerativeAI,
  imagenAI: GoogleGenAI,
  runOpts: SchedulerRunOpts,
): Promise<string | null> {
  // Always generate in all three locales; primary is Portuguese (main site language)
  const primaryLocale: SupportedLocale = "pt";
  const previousLastPost = client.last_post_generated_at ?? null;
  const combinedInstructions = combineClientInstructionsForModel(
    client.custom_instructions,
    client.instruction_reinforcement,
  );

  // Track the created post ID so the catch block can clean up
  let createdPostId: string | null = null;

  try {
  // Atomic claim so concurrent scheduler runs (Inngest + traffic trigger, overlapping cron, etc.)
  // cannot both pass the due check. Matches due logic: last_run <= now - interval (see FREQUENCY_INTERVAL_MS).
  if (!runOpts.skipDueClaim) {
    const intervalMs = FREQUENCY_INTERVAL_MS[client.frequency] ?? FREQUENCY_INTERVAL_MS.weekly;
    const thresholdIso = new Date(runOpts.now - intervalMs).toISOString();
    const claimIso = new Date(runOpts.now).toISOString();
    // Use an RPC function for the atomic claim so it bypasses PostgREST's
    // schema-cache validation (avoids "column does not exist" errors on fresh deploys).
    const { data: claimedId, error: claimError } = await admin.rpc(
      "claim_client_for_generation",
      { p_client_id: client.id, p_claim_iso: claimIso, p_threshold_iso: thresholdIso },
    );
    if (claimError) throw new Error(claimError.message);
    if (!claimedId) return null;
  }

  const publicationDate = new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).format(new Date());

  // Fetch recent post titles so the model chooses a different topic
  const { data: recentPosts } = await admin
    .from("posts")
    .select("id, post_localizations(locale, title)")
    .eq("author_id", client.user_id)
    .order("created_at", { ascending: false })
    .limit(15);
  const recentPostTitles = (recentPosts ?? [])
    .map((p) => {
      const locs = (p as { post_localizations?: Array<{ locale: string; title: string | null }> }).post_localizations ?? [];
      const pt = locs.find((l) => l.locale === "pt");
      return pt?.title?.trim() ?? null;
    })
    .filter((t): t is string => !!t);

  // Use brand name if set, otherwise domain as topic hint (Gemini will generate the actual focus keyword)
  const topicHint = client.brand_name ?? client.domain.replace(/^www\./, "").replace(/\.[a-z]+$/, "");

  // Use a temporary placeholder slug â€” will be replaced with the title-derived slug after PT generation
  const tempSlug = `draft-${client.user_id.slice(0, 8)}-${Date.now()}`;

  const bylineAuthorId = await pickRandomBylineAuthorId(admin, client.user_id).catch(() => null);

  // Create the post row with a temp slug
  const { data: post, error: postError } = await admin
    .from("posts")
    .insert({
      slug: tempSlug,
      primary_locale: primaryLocale,
      content_type: "hero",
      status: "draft",
      author_id: client.user_id,
      // Only include byline_author_id when non-null to avoid PostgREST schema-cache
      // rejecting the column if the blog_authors migration hasn't refreshed yet.
      ...(bylineAuthorId !== null ? { byline_author_id: bylineAuthorId } : {}),
    })
    .select("id")
    .single();

  if (postError || !post) {
    throw new Error(postError?.message ?? "Failed to create post row");
  }
  createdPostId = post.id;

  const brandBook = client.brand_book as import("@/lib/brand-book/types").BrandBook | null | undefined;
  const resolvedBrandColors = resolveClientBrandColors({
    domain: client.domain,
    primary_color: client.primary_color,
    secondary_color: client.secondary_color,
    tertiary_color: client.tertiary_color,
    alternative_color: client.alternative_color,
    colorPaletteText: brandBook?.visualIdentity?.colorPalette ?? null,
  });
  const brandDisplayName =
    client.company_name?.trim() ||
    client.brand_name?.trim() ||
    brandBook?.brandName?.trim() ||
    null;
  const manualBrand = brandDisplayName
    ? {
        companyName: brandDisplayName,
        logoUrl: client.logo_url ?? null,
        primaryColor: resolvedBrandColors.primaryColor,
        secondaryColor: resolvedBrandColors.secondaryColor,
        tertiaryColor: resolvedBrandColors.tertiaryColor,
        alternativeColor: resolvedBrandColors.alternativeColor,
        fontStyle: client.font_style ?? "modern",
        brandVoice: client.brand_voice ?? "professional",
      }
    : null;

  const rawUrls = await getCandidateSiteUrls(client.domain);
  const internalLinkCandidates =
    rawUrls.length > 0 ? await enrichWithTitles(rawUrls, 35) : [];
  const clientCtx: ClientContext = {
    domain: client.domain,
    brandName: client.company_name ?? client.brand_name ?? null,
    brandTone: client.brand_voice ?? client.brand_tone ?? null,
    brandBook: brandBook ?? null,
    manualBrand,
    websiteSummary: null,
    industry: (brandBook as { industry?: string } | null)?.industry ?? null,
    gaTopPages: null,
    gaTopKeywords: null,
    searchConsoleQueries: null,
    recentPostTitles: recentPostTitles.length > 0 ? recentPostTitles : null,
    internalLinkCandidates: internalLinkCandidates.length > 0 ? internalLinkCandidates : null,
  };

  const brandName = (brandBook as { brandName?: string } | null)?.brandName ?? client.brand_name ?? client.domain;
  const publisherEntity = {
    "@type": "Organization",
    "name": brandName,
    "url": `https://${client.domain}`,
    "logo": { "@type": "ImageObject", "url": `https://${client.domain}/logo.png` },
  };

  const systemInstruction = await resolveSystemInstructionsWithEmbeddings(
    genAI,
    combinedInstructions,
    {
      contentType: "hero",
      locale: primaryLocale,
      focusKeywordOrTopic: topicHint,
      hasInternalLinks: internalLinkCandidates.length > 0,
      taskKind: "post_generation",
    },
  );

  const geminiModel = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
      topP: 0.95,
    },
  });

  // ── STEP 1: Generate primary content in PT ──────────────────────────────────
  let slug = tempSlug;
  let titleForCoverPrompt = topicHint;
  let coverImageDescription: string | null = null;
  let primaryContent: GeneratedContent | null = null;

  const postCtx: PostContext = {
    slug,
    content_type: "hero",
    locale: primaryLocale,
    focus_keyword: topicHint, // Just a hint — Gemini will generate the actual focus keyword
    publication_date: publicationDate,
    existing_title: null,
    existing_draft: null,
  };

  const { data: primaryRun } = await admin
    .from("agent_runs")
    .insert({ post_id: post.id, locale: primaryLocale, status: "running", model: MODEL, input: { postCtx, clientCtx } })
    .select("id")
    .single();
  const primaryRunId = primaryRun?.id;

  const primaryPrompt = buildPrompt(postCtx, clientCtx, { hasCustomInstructions: !!combinedInstructions });
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await geminiModel.generateContent(primaryPrompt);
      const text = result.response.text().trim();
      const clean = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      primaryContent = JSON.parse(clean);
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[scheduler] Gemini attempt ${attempt}/${MAX_RETRIES} failed for PT (${client.domain}): ${msg}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 5_000 * attempt));
      }
    }
  }

  if (!primaryContent) {
    if (primaryRunId) await admin.from("agent_runs").update({ status: "failed", error: "Gemini failed after 3 attempts" }).eq("id", primaryRunId);
    throw new Error(`Primary content generation failed for ${client.domain}`);
  }

  primaryContent.content_md = sanitizeInternalMarkdownLinks(
    primaryContent.content_md,
    internalLinkCandidates.map((c) => c.url)
  );
  primaryContent.content_md = convertInternalLinksToRelative(primaryContent.content_md, client.domain);
  primaryContent.content_md = sanitizeRelativeMarkdownLinks(primaryContent.content_md, internalLinkCandidates.map((c) => c.url));

  const qualitySystemInstruction = await resolveSystemInstructionsWithEmbeddings(
    genAI,
    combinedInstructions,
    {
      contentType: "hero",
      locale: primaryLocale,
      focusKeywordOrTopic: topicHint,
      hasInternalLinks: internalLinkCandidates.length > 0,
      taskKind: "quality_loop",
    },
  );

  // Post-generation: score, review, and revise until 90+ (see improve-to-90 MAX_ITERATIONS)
  const { content: improvedContent, score: finalScore } = await improvePostTo90(
    genAI,
    MODEL,
    {
      title: primaryContent.title,
      content_md: primaryContent.content_md,
      seo_title: primaryContent.seo_title,
      seo_description: primaryContent.seo_description,
      focus_keyword: primaryContent.focus_keyword,
      faq_blocks: primaryContent.faq_blocks,
    },
    primaryContent.seo_score ?? undefined,
    { systemInstruction: qualitySystemInstruction }
  );
  primaryContent.content_md = improvedContent.content_md;
  if (improvedContent.title) primaryContent.title = improvedContent.title;
  if (improvedContent.seo_title) primaryContent.seo_title = improvedContent.seo_title;
  if (improvedContent.seo_description) primaryContent.seo_description = improvedContent.seo_description;
  if (improvedContent.faq_blocks) primaryContent.faq_blocks = improvedContent.faq_blocks;
  primaryContent.seo_score = finalScore;

  // Extract metadata from primary content
  titleForCoverPrompt = primaryContent.title;
  if (primaryContent.cover_image_description) coverImageDescription = primaryContent.cover_image_description;

  // Derive slug from primary content
  const rawSlug = (primaryContent.slug && primaryContent.slug.trim())
    ? primaryContent.slug
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/-$/, "")
        .slice(0, 60)
    : primaryContent.title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60)
        .replace(/-$/, "");

  // Collision check
  let candidate = rawSlug;
  let counter = 2;
  while (true) {
    const { data: existing } = await admin
      .from("posts")
      .select("id")
      .eq("slug", candidate)
      .neq("id", post.id)
      .maybeSingle();
    if (!existing) break;
    candidate = `${rawSlug}-${counter}`;
    counter++;
  }
  slug = candidate;
  await admin.from("posts").update({ slug }).eq("id", post.id);

  const authorForBlock = await resolveAuthorForByline(admin, client.user_id, bylineAuthorId);

  const ptContentMd = appendAuthorBlock(primaryContent.content_md, "pt", authorForBlock);
  const ptSeoTitle = clampSeoTitle(primaryContent.seo_title);
  const ptSeoDesc = clampMetaDescription(primaryContent.seo_description);

  // Save PT localization
  const ptJsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": primaryContent.title,
        "description": ptSeoDesc,
        "keywords": primaryContent.focus_keyword,
        "datePublished": new Date().toISOString(),
        "inLanguage": "pt",
        "author": publisherEntity,
        "publisher": publisherEntity,
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://${client.domain}/pt/blog/${slug}` },
      },
      ...((primaryContent.faq_blocks?.length ?? 0) > 0 ? [{
        "@type": "FAQPage",
        "mainEntity": (primaryContent.faq_blocks ?? []).map((f) => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": { "@type": "Answer", "text": f.answer },
        })),
      }] : []),
    ],
  };

  await admin.from("post_localizations").upsert(
    {
      post_id: post.id,
      locale: "pt",
      title: primaryContent.title,
      excerpt: primaryContent.excerpt,
      content_md: ptContentMd,
      seo_title: ptSeoTitle,
      seo_description: ptSeoDesc,
      focus_keyword: primaryContent.focus_keyword,
      faq_blocks: primaryContent.faq_blocks ?? null,
      jsonld: ptJsonld,
      seo_score: primaryContent.seo_score ?? null,
    },
    { onConflict: "post_id,locale" }
  );

  if (primaryRunId) {
    await admin.from("agent_runs").update({
      status: "done",
      output: { ...primaryContent, content_md: ptContentMd },
    }).eq("id", primaryRunId);
  }

  // ── STEP 2: Translate to other locales (EN, FR) ─────────────────────────────
  const translationSystemInstruction = await resolveSystemInstructionsWithEmbeddings(
    genAI,
    combinedInstructions,
    {
      contentType: "hero",
      locale: "English and French (translate from Portuguese)",
      focusKeywordOrTopic: topicHint,
      hasInternalLinks: internalLinkCandidates.length > 0,
      taskKind: "translation",
    },
  );
  const geminiTranslateModel = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: translationSystemInstruction,
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 8192,
      topP: 0.95,
    },
  });

  const translationLocales = ALL_LOCALES.filter((l) => l !== primaryLocale);

  for (const locale of translationLocales) {
    await new Promise((r) => setTimeout(r, 2_000)); // Rate limit pause

    const { data: transRun } = await admin
      .from("agent_runs")
      .insert({ post_id: post.id, locale, status: "running", model: MODEL, input: { action: "translate", from: "pt", to: locale } })
      .select("id")
      .single();
    const transRunId = transRun?.id;

    const langName = locale === "en" ? "English" : locale === "fr" ? "French" : locale;

    const translationPrompt = `You are a professional translator. Translate the following blog post from Portuguese to ${langName}.

RULES:
- Translate ALL text accurately while preserving the exact same structure, markdown formatting, and meaning.
- Keep the same headings (H1, H2, H3), bullet points, numbered lists, and FAQ format.
- Translate the title, excerpt, SEO title, SEO description, all FAQ questions/answers, and the single author block at the end (heading "Sobre o autor" / "About the author" / "À propos de l'auteur" and the name, job title, and bio). Do NOT duplicate the author section — output it exactly once.
- If the author block uses HTML, preserve the layout: <div class="author-block-header"> with <div class="author-avatar"> (unchanged) and <div class="author-block-titles"> containing <p class="author-name"> and <p class="author-job">; optional <p class="author-bio"> below. Translate only the text inside those <p> tags.
- Keep any brand names, proper nouns, and technical terms as-is (e.g., "Google Analytics", "SEO").
- In content_md: for every markdown link [anchor](url), keep the url EXACTLY unchanged (character-for-character); translate only the anchor text inside the brackets to natural ${langName}. Do not add, remove, or reorder links.
- Do not add a date line or cover image in content_md; the website template shows them above the body.
- Do NOT add, remove, or change any facts, statistics, or claims — only translate.
- Use natural, fluent ${langName} — not word-for-word translation.

ORIGINAL CONTENT (Portuguese):

Title: ${primaryContent.title}
Excerpt: ${primaryContent.excerpt}
SEO Title: ${primaryContent.seo_title}
SEO Description: ${primaryContent.seo_description}
Focus Keyword: ${primaryContent.focus_keyword}

Content (Markdown) — include the "Sobre o autor" / "About the author" section at the end; translate the heading and bio to ${langName}:
${ptContentMd}

FAQ Blocks:
${(primaryContent.faq_blocks ?? []).map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join("\n")}

Respond with a single valid JSON object — no markdown fences, no preamble:
{
  "title": "Translated title",
  "excerpt": "Translated excerpt",
  "seo_title": "Translated SEO title",
  "seo_description": "Translated SEO description",
  "focus_keyword": "Translated focus keyword",
  "content_md": "Full translated markdown content",
  "faq_blocks": [{ "question": "Translated question", "answer": "Translated answer" }]
}`;

    let translated: GeneratedContent | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await geminiTranslateModel.generateContent(translationPrompt);
        const text = result.response.text().trim();
        const clean = text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        translated = JSON.parse(clean);
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[scheduler] Translation attempt ${attempt}/${MAX_RETRIES} failed for ${locale} (${client.domain}): ${msg}`);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 3_000 * attempt));
        }
      }
    }

    if (!translated) {
      if (transRunId) await admin.from("agent_runs").update({ status: "failed", error: "Translation failed" }).eq("id", transRunId);
      console.warn(`[scheduler] Skipping ${locale} translation for ${client.domain}`);
      continue;
    }

    // Carry over SEO scores from primary content
    translated.seo_score = primaryContent.seo_score;

    translated.content_md = sanitizeInternalMarkdownLinks(
      translated.content_md,
      internalLinkCandidates.map((c) => c.url)
    );
    translated.content_md = convertInternalLinksToRelative(translated.content_md, client.domain);
    translated.content_md = sanitizeRelativeMarkdownLinks(translated.content_md, internalLinkCandidates.map((c) => c.url));
    // Re-append canonical author HTML using translated copy (appendAuthorBlock strips the model section first).
    const extractedAuthor = extractAuthorFieldsFromContentMd(translated.content_md);
    const authorForTranslatedLocale = authorForBlock
      ? {
          ...authorForBlock,
          displayName: extractedAuthor.displayName?.trim() || authorForBlock.displayName,
          jobTitle: extractedAuthor.jobTitle?.trim() || authorForBlock.jobTitle,
          bio: extractedAuthor.bio?.trim() || authorForBlock.bio,
        }
      : null;
    translated.content_md = appendAuthorBlock(
      translated.content_md,
      locale as Locale,
      authorForTranslatedLocale,
    );
    const translatedMd = translated.content_md;
    const locSeoTitle = clampSeoTitle(translated.seo_title);
    const locSeoDesc = clampMetaDescription(translated.seo_description);

    const localeJsonld = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "headline": translated.title,
          "description": locSeoDesc,
          "keywords": translated.focus_keyword,
          "datePublished": new Date().toISOString(),
          "inLanguage": locale,
          "author": publisherEntity,
          "publisher": publisherEntity,
          "mainEntityOfPage": { "@type": "WebPage", "@id": `https://${client.domain}/${locale}/blog/${slug}` },
        },
        ...((translated.faq_blocks?.length ?? 0) > 0 ? [{
          "@type": "FAQPage",
          "mainEntity": (translated.faq_blocks ?? []).map((f) => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": { "@type": "Answer", "text": f.answer },
          })),
        }] : []),
      ],
    };

    await admin.from("post_localizations").upsert(
      {
        post_id: post.id,
        locale,
        title: translated.title,
        excerpt: translated.excerpt,
        content_md: translatedMd,
        seo_title: locSeoTitle,
        seo_description: locSeoDesc,
        focus_keyword: translated.focus_keyword,
        faq_blocks: translated.faq_blocks ?? null,
        jsonld: localeJsonld,
        seo_score: translated.seo_score ?? null,
      },
      { onConflict: "post_id,locale" }
    );

    if (transRunId) await admin.from("agent_runs").update({ status: "done", output: { ...translated, content_md: translatedMd } }).eq("id", transRunId);
  }



  // â”€â”€ Generate cover image (once, shared across all locales) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  try {
    const coverSubjectRaw = coverImageDescription
      ? coverImageDescription
      : `Editorial illustration for "${titleForCoverPrompt}": rich, topic-specific visuals; distinctive composition for this article.`;
    const coverSubject = truncateCoverImageSubject(coverSubjectRaw);

    const visualIdentity = (brandBook as { visualIdentity?: { aestheticStyle?: string; imageStyle?: string; colorPalette?: string } } | null)?.visualIdentity ?? null;
    const brandStyle = {
      primaryColor: resolvedBrandColors.primaryColor,
      secondaryColor: resolvedBrandColors.secondaryColor,
      tertiaryColor: resolvedBrandColors.tertiaryColor,
      alternativeColor: resolvedBrandColors.alternativeColor,
      fontStyle: client.font_style ?? "modern",
      brandVoice: client.brand_voice ?? "professional",
    };
    const headlineForCover =
      primaryContent.cover_image_headline ??
      primaryContent.title.trim().split(/\s+/).slice(0, 4).join(" ");
    const coverHeadlineIsEnglishOnly = Boolean(primaryContent.cover_image_headline?.trim());
    const refParts = await loadCoverReferenceImageParts(admin, [
      client.cover_reference_image_1,
      client.cover_reference_image_2,
      client.cover_reference_image_3,
    ]);
    console.info(`[scheduler] cover refs for ${client.domain}: ${refParts.length} image(s) loaded (of ${[client.cover_reference_image_1, client.cover_reference_image_2, client.cover_reference_image_3].filter(Boolean).length} configured)`);
    let referenceVisionBrief: string | null = null;
    if (refParts.length > 0) {
      referenceVisionBrief = await requireCoverReferenceVisionBrief(
        genAI,
        refParts,
        `[scheduler] ref-vision ${client.domain}`,
      );
    }
    const { prefix: coverEmbedPrefix } = await buildCoverInstructionEmbeddingPrefixWithMeta(
      genAI,
      {
        focusKeywordOrTopic: primaryContent.focus_keyword || titleForCoverPrompt,
        contentType: "hero",
        locale: primaryLocale,
        hasInternalLinks: internalLinkCandidates.length > 0,
      },
      combinedInstructions,
      referenceVisionBrief,
    );
    const baseCoverPrompt = buildCoverPrompt(
      coverSubject,
      headlineForCover,
      brandStyle,
      visualIdentity ? {
        colorPalette: visualIdentity.colorPalette,
        aestheticStyle: visualIdentity.aestheticStyle,
        imageStyle: visualIdentity.imageStyle,
      } : null,
      { headlineMayBeNonEnglish: !coverHeadlineIsEnglishOnly, hasReferenceImages: refParts.length > 0 }
    );
    const buffer = await generateCoverImageBufferWithEmbedFallback(imagenAI, {
      embedPrefix: coverEmbedPrefix,
      basePrompt: baseCoverPrompt,
      logLabel: `[scheduler] cover ${client.domain}`,
      referenceImages: refParts.length ? refParts : undefined,
      referenceVisionBrief,
      guidelinesText: client.brand_guidelines_text ?? null,
      enforcePrimaryInstructionEmbedding: true,
    });

    if (buffer) {
      const coverPath = `${post.id}/cover-${Date.now()}.jpg`;
      const { error: uploadErr } = await admin.storage
        .from("covers")
        .upload(coverPath, buffer, { contentType: "image/jpeg", upsert: true });

      if (!uploadErr) {
        await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", post.id);
      } else {
        console.warn(`[scheduler] Cover upload failed for ${client.domain} (non-fatal):`, uploadErr.message);
      }
    }
  } catch (coverErr) {
    console.warn(`[scheduler] Cover generation failed for ${client.domain} (non-fatal):`, coverErr);
  }


  const canAutoPublish = seoScoreMeetsPublishBar(primaryContent.seo_score ?? null);

  if (canAutoPublish) {
    await admin.from("posts").update({
      status: "published",
      published_at: new Date().toISOString(),
      webhook_status: client.webhook_url ? "pending" : null,
      webhook_sent_at: client.webhook_url ? new Date().toISOString() : null,
      webhook_error: null,
    }).eq("id", post.id);
  } else {
    const avg = primaryContent.seo_score ? seoScoreAverage(primaryContent.seo_score) : null;
    console.warn(
      `[scheduler] Post ${post.id} left in review: SEO avg ${avg ?? "n/a"} is below 90 or score missing (${client.domain})`,
    );
    await admin.from("posts").update({
      status: "review",
      published_at: null,
      webhook_status: null,
      webhook_sent_at: null,
      webhook_error: null,
    }).eq("id", post.id);
  }

  if (canAutoPublish && client.webhook_url) {
    try {
      const { data: freshPost } = await admin
        .from("posts")
        .select(
          "cover_image_path, slug, author_id, byline_author_id, post_localizations(locale, title, excerpt, content_md, seo_title, seo_description, jsonld)",
        )
        .eq("id", post.id)
        .single();

      let coverImageUrl: string | null = null;
      if (freshPost?.cover_image_path) {
        const { data: urlData } = admin.storage.from("covers").getPublicUrl(freshPost.cover_image_path);
        coverImageUrl = urlData?.publicUrl ?? null;
      }

      const localizations = (freshPost?.post_localizations ?? []) as Array<{
        locale: string;
        title: string | null;
        excerpt: string | null;
        content_md: string | null;
        seo_title: string | null;
        seo_description: string | null;
        jsonld: unknown;
      }>;

      const COVER_RE = /!\[Cover image\]\(\{COVER_IMAGE_PLACEHOLDER\}\)\n?/g;
      const cleaned = localizations.map((l) => ({
        ...l,
        content_md: (l.content_md ?? "")
          .replace(COVER_RE, coverImageUrl ? `![Cover image](${coverImageUrl})\n` : "")
          .trim(),
      }));

      const primary =
        cleaned.find((l) => l.locale === "pt") ??
        cleaned.find((l) => l.locale === "en") ??
        cleaned[0];

      if (!primary) throw new Error("No localizations found after generation");

      const { data: clientConfig } = await admin
        .from("clients")
        .select("webhook_secret")
        .eq("user_id", client.user_id)
        .maybeSingle();

      const authorOwnerId = (freshPost as { author_id?: string }).author_id ?? client.user_id;
      const bylineId = (freshPost as { byline_author_id?: string | null }).byline_author_id ?? null;
      const bylineResolved = await resolveAuthorForByline(admin, authorOwnerId, bylineId);
      const webhookAuthor = bylineResolved
        ? {
            name: bylineResolved.displayName,
            jobTitle: bylineResolved.jobTitle,
            bio: bylineResolved.bio,
            avatarUrl: bylineResolved.avatarUrl,
          }
        : null;

      const event = resolveWebhookEvent(client.webhook_event_format ?? "spec", false);
      const revalidation = buildRevalidationPayload(event, client.id, {
        id: post.id,
        slug: freshPost?.slug ?? slug,
        status: "published",
        updatedAt: new Date().toISOString(),
      });
      const authorPayload = contentMdHasEmbeddedAuthorBlock(primary.content_md ?? "")
        ? undefined
        : webhookAuthor;

      const webhookPayload = {
        ...revalidation,
        post: {
          ...revalidation.post,
          cover_image_url: coverImageUrl,
          ...(authorPayload !== undefined ? { author: authorPayload } : {}),
          title: primary.title,
          excerpt: primary.excerpt,
          content_md: primary.content_md,
          seo_title: primary.seo_title,
          meta_description: primary.seo_description,
          json_ld: primary.jsonld ?? null,
          locale: primary.locale,
          translations: Object.fromEntries(
            cleaned.map((l) => [l.locale, {
              title: l.title,
              excerpt: l.excerpt,
              content_md: l.content_md,
              seo_title: l.seo_title,
              meta_description: l.seo_description,
              json_ld: l.jsonld ?? null,
            }])
          ),
        },
      };
      const webhookHeaders: Record<string, string> = clientConfig?.webhook_secret
        ? buildWebhookHeaders(webhookPayload, clientConfig.webhook_secret, event)
        : { "Content-Type": "application/json" };
      if (clientConfig?.webhook_secret) webhookHeaders["x-webhook-secret"] = clientConfig.webhook_secret;

      const webhookRes = await fetch(client.webhook_url, {
        method: "POST",
        headers: webhookHeaders,
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(15_000),
      });

      if (!webhookRes.ok) {
        const errText = await webhookRes.text().catch(() => "");
        const errMsg = `Webhook responded with ${webhookRes.status}: ${errText.slice(0, 200)}`;
        await admin.from("posts").update({ webhook_status: "failed", webhook_error: errMsg }).eq("id", post.id);
        console.warn(`[scheduler] Webhook failed for ${client.domain}: ${errMsg}`);
      } else {
        await admin.from("posts").update({ webhook_status: "success" }).eq("id", post.id);
        console.log(`[scheduler] Webhook sent to ${client.webhook_url}`);
      }
    } catch (webhookErr) {
      const msg = webhookErr instanceof Error ? webhookErr.message : "Unknown error";
      await admin.from("posts").update({ webhook_status: "failed", webhook_error: msg }).eq("id", post.id);
      console.warn(`[scheduler] Webhook error for ${client.domain}:`, msg);
    }
  }

  await admin.from("clients").update({
    last_post_generated_at: new Date().toISOString(),
    last_generation_error: null,
    last_generation_error_at: null,
  }).eq("id", client.id);

  console.log(
    `[scheduler] Generated post (3 locales) for ${client.domain} -> post id ${post.id}${canAutoPublish ? " (published)" : " (review — avg < 90)"}`,
  );
  return post.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[scheduler] Generation failed for ${client.domain} (post ${createdPostId ?? "pre-insert"}):`, msg);
    const clientPatch: Record<string, string | null> = {
      last_generation_error: msg,
      last_generation_error_at: new Date().toISOString(),
    };
    if (!runOpts.skipDueClaim) {
      clientPatch.last_post_generated_at = previousLastPost;
    }
    // Best-effort: don't let a secondary DB error hide the original error
    try { await admin.from("clients").update(clientPatch).eq("id", client.id); } catch { /* ignore */ }
    if (createdPostId) {
      try { await admin.from("posts").delete().eq("id", createdPostId); } catch { /* ignore */ }
    }
    throw err;
  }
}
