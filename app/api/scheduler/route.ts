import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { getSystemInstructions, buildPrompt, type ClientContext, type PostContext } from "@/lib/agent/instructions";
import { appendAuthorBlock, sanitizeInternalMarkdownLinks, convertInternalLinksToRelative } from "@/lib/agent/internal-link";
import { getCandidateSiteUrls, enrichWithTitles } from "@/lib/agent/site-urls";
import type { Locale } from "@/lib/types/db";

const MODEL = "gemini-3.1-flash-lite-preview";

/**
 * Frequency â†’ minimum interval in milliseconds before a new post should be generated.
 */
const FREQUENCY_INTERVAL_MS: Record<string, number> = {
  daily:    1  * 24 * 60 * 60 * 1000,
  weekly:   7  * 24 * 60 * 60 * 1000,
  biweekly: 14 * 24 * 60 * 60 * 1000,
  monthly:  30 * 24 * 60 * 60 * 1000,
};

/**
 * POST /api/scheduler/run
 *
 * Triggered by GET /api/scheduler/trigger (called on app traffic, rate-limited) or by manual POST with CRON_SECRET.
 * When run, it checks last_post_generated_at + frequency per client and only processes clients who are due.
 * With auto_publish + webhook, due clients get generated and published to their site. No cron required.
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
  const cronMatch = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!cronMatch) {
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
    .select("id, user_id, domain, frequency, last_post_generated_at, google_access_token, google_scope, auto_publish, webhook_url, post_locale, brand_name, brand_tone, brand_book, company_name, logo_url, primary_color, secondary_color, tertiary_color, font_style, brand_voice, custom_instructions")
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
      const postId = await generatePostForClient(client, admin, genAI, imagenAI);
      results.push({ client_id: client.id, domain: client.domain, status: "generated", post_id: postId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[scheduler] Failed for client ${client.domain}:`, msg);
      results.push({ client_id: client.id, domain: client.domain, status: "error", error: msg });
    }
  }

  const generated = results.filter((r) => r.status === "generated").length;
  const skipped   = results.filter((r) => r.status === "skipped_not_due").length;
  const errors    = results.filter((r) => r.status === "error").length;

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
    next_run: "Vercel Cron runs on schedule (see vercel.json). Manual: Run scheduler in admin or GET /api/scheduler?secret=CRON_SECRET",
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

type SchedulerClient = {
  id: string;
  user_id: string;
  domain: string;
  frequency: string;
  google_access_token: string | null;
  google_scope: string | null;
  auto_publish?: boolean | null;
  webhook_url?: string | null;
  post_locale?: string | null;
  brand_name?: string | null;
  brand_tone?: string | null;
  brand_book?: unknown;
  company_name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  font_style?: string | null;
  brand_voice?: string | null;
  tertiary_color?: string | null;
  custom_instructions?: string | null;
};

async function generatePostForClient(
  client: SchedulerClient,
  admin: ReturnType<typeof createAdminClient>,
  genAI: GoogleGenerativeAI,
  imagenAI: GoogleGenAI,
): Promise<string> {
  // Always generate in all three locales; primary is Portuguese (main site language)
  const primaryLocale: SupportedLocale = "pt";

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

  // Create the post row with a temp slug
  const { data: post, error: postError } = await admin
    .from("posts")
    .insert({
      slug: tempSlug,
      primary_locale: primaryLocale,
      content_type: "hero",
      status: "draft",
      author_id: client.user_id,
    })
    .select("id")
    .single();

  if (postError || !post) throw new Error(postError?.message ?? "Failed to create post row");

  try {
  // Build shared context with manual brand info
  const manualBrand = client.company_name ? {
    companyName: client.company_name,
    logoUrl: client.logo_url ?? null,
    primaryColor: client.primary_color ?? "#7c5cfc",
    secondaryColor: client.secondary_color ?? "#22d3a0",
    tertiaryColor: client.tertiary_color ?? null,
    fontStyle: client.font_style ?? "modern",
    brandVoice: client.brand_voice ?? "professional",
  } : null;

  const brandBook = client.brand_book as import("@/lib/brand-book/types").BrandBook | null | undefined;
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

  const geminiModel = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: getSystemInstructions(client.custom_instructions ?? null),
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

  const primaryPrompt = buildPrompt(postCtx, clientCtx, { hasCustomInstructions: !!client.custom_instructions });
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

  // Fetch author profile so we can append "Sobre o autor" (with avatar) into the post content
  const { data: authorProfile } = await admin
    .from("profiles")
    .select("display_name, job_title, bio, avatar_url")
    .eq("id", client.user_id)
    .maybeSingle();
  const authorForBlock = authorProfile
    ? { displayName: authorProfile.display_name ?? null, jobTitle: authorProfile.job_title ?? null, bio: authorProfile.bio ?? null, avatarUrl: authorProfile.avatar_url ?? null }
    : null;

  const ptContentMd = appendAuthorBlock(primaryContent.content_md, "pt", authorForBlock);

  // Save PT localization
  const ptJsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": primaryContent.title,
        "description": primaryContent.seo_description,
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
      seo_title: primaryContent.seo_title,
      seo_description: primaryContent.seo_description,
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
- Translate the title, excerpt, SEO title, SEO description, and all FAQ questions/answers.
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

Content (Markdown):
${primaryContent.content_md}

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
        const result = await geminiModel.generateContent(translationPrompt);
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
    const translatedMd = appendAuthorBlock(translated.content_md, locale as Locale, authorForBlock);

    const localeJsonld = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "headline": translated.title,
          "description": translated.seo_description,
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
        seo_title: translated.seo_title,
        seo_description: translated.seo_description,
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
    // Graphic illustration (not photography). Style ref: flowproductions.pt blog.
    const coverSubject = coverImageDescription
      ? coverImageDescription
      : `Graphic illustration concept for "${titleForCoverPrompt}": solid or dark background, abstract shapes, modern creative style.`;

    const visualIdentity = (brandBook as { visualIdentity?: { aestheticStyle?: string; imageStyle?: string; colorPalette?: string } } | null)?.visualIdentity;
    const brandStyleParts: string[] = [];
    if (manualBrand) {
      const colorParts = [`primary ${manualBrand.primaryColor}`, `secondary ${manualBrand.secondaryColor}`];
      if (manualBrand.tertiaryColor) colorParts.push(`tertiary ${manualBrand.tertiaryColor}`);
      brandStyleParts.push(`Use EXACTLY these brand colours: ${colorParts.join(", ")} (for background and accents). Typography/font style: ${manualBrand.fontStyle}. Brand voice/mood: ${manualBrand.brandVoice}.`);
    } else if (visualIdentity) {
      if (visualIdentity.colorPalette) brandStyleParts.push(`Use EXACTLY this colour palette: ${visualIdentity.colorPalette}.`);
      if (visualIdentity.aestheticStyle) brandStyleParts.push(`Aesthetic/typography: ${visualIdentity.aestheticStyle}.`);
      if (visualIdentity.imageStyle) brandStyleParts.push(visualIdentity.imageStyle);
    }
    const brandStyle = brandStyleParts.length > 0 ? brandStyleParts.join(" ") + " " : "";

    const headlineForCover =
      primaryContent.cover_image_headline ??
      primaryContent.title.trim().split(/\s+/).slice(0, 4).join(" ");
    const coverPrompt =
      `Editorial blog hero graphic (like Flow Productions blog): ${coverSubject}. ` +
      `BALANCED composition: solid or gradient background, 2–4 intentional elements — e.g. overlapping circles or soft shapes plus one symbolic/focal element (silhouette, hands, abstract motif). Clear focal point; not too empty, not too busy. Wide banner 16:9. ` +
      brandStyle +
      `Cohesive palette, flat or subtle depth, clean edges. High clarity so it scales well. ` +
      `Include this text on the image ONCE only: "${headlineForCover}". Do not repeat or duplicate the headline — show it one time, on one line. The headline must be the TOP LAYER — no circles, shapes, or icons overlapping or covering the text; place all graphic elements behind the text or outside the headline area so the text is fully legible and never cut. The headline must be in English. Bold editorial typography. No logos or brand names; the headline above is the only text.`;
    const imgResponse = await imagenAI.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: coverPrompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
      },
    });

    const parts = imgResponse.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const coverPath = `${post.id}/cover-${Date.now()}.jpg`;
        const { error: uploadErr } = await admin.storage
          .from("covers")
          .upload(coverPath, buffer, { contentType: "image/jpeg", upsert: true });

        if (!uploadErr) {
          await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", post.id);
        }
        break;
      }
    }
  } catch (coverErr) {
    console.warn(`[scheduler] Cover generation failed for ${client.domain} (non-fatal):`, coverErr);
  }


  // All posts are published directly (no review queue). Optionally call webhook if configured.
  await admin.from("posts").update({
    status: "published",
    published_at: new Date().toISOString(),
    webhook_status: client.webhook_url ? "pending" : null,
    webhook_sent_at: client.webhook_url ? new Date().toISOString() : null,
    webhook_error: null,
  }).eq("id", post.id);

  if (client.webhook_url) {
    try {
      const { data: freshPost } = await admin
        .from("posts")
        .select("cover_image_path, slug, post_localizations(locale, title, excerpt, content_md, seo_title, seo_description, jsonld)")
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

      // Fetch author profile to include in the webhook payload
      const { data: authorProfile } = await admin
        .from("profiles")
        .select("display_name, avatar_url, bio, job_title")
        .eq("id", client.user_id)
        .maybeSingle();

      const webhookAuthor = authorProfile
        ? {
            name: authorProfile.display_name ?? null,
            jobTitle: authorProfile.job_title ?? null,
            bio: authorProfile.bio ?? null,
            avatarUrl: authorProfile.avatar_url ?? null,
          }
        : null;

      const webhookHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (clientConfig?.webhook_secret) webhookHeaders["x-webhook-secret"] = clientConfig.webhook_secret;

      const webhookPayload = {
        event: "cms.post.published",
        post: {
          id: post.id,
          slug: freshPost?.slug ?? slug,
          cover_image_url: coverImageUrl,
          author: webhookAuthor,
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
        timestamp: new Date().toISOString(),
      };

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

  console.log(`[scheduler] Generated post (3 locales) for ${client.domain} -> post id ${post.id}`);
  return post.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[scheduler] Generation failed for ${client.domain} (post ${post.id}):`, msg);
    await admin.from("clients").update({
      last_generation_error: msg,
      last_generation_error_at: new Date().toISOString(),
    }).eq("id", client.id);
    await admin.from("posts").delete().eq("id", post.id);
    throw err;
  }
}
