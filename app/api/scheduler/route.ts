import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildCoverInstructionEmbeddingPrefixWithMeta } from "@/lib/agent/instruction-embeddings";
import {
  combineClientInstructionsForModel,
  resolvePostSystemInstructions,
  buildPrompt,
  type ClientContext,
  type PostContext,
} from "@/lib/agent/instructions";
import {
  coverImageClientsFromLlm,
  coverVisionClientsFromLlm,
  createAgentLlmBundle,
  stripModelJsonFences,
  type AgentLlmBundle,
} from "@/lib/agent/text-llm";
import { bindAiUsageContext, flushAiTokenUsageWrites } from "@/lib/agent/token-usage";
import { buildCoverPrompt, truncateCoverImageSubject } from "@/lib/agent/cover-prompt";
import { clientDisallowsCoverOnImageText } from "@/lib/agent/cover-text-policy";
import { loadCoverReferenceImageParts } from "@/lib/agent/cover-reference-images";
import { buildCoverReferenceVisionBriefWithTimeout } from "@/lib/agent/cover-reference-vision";
import { generateCoverImageBufferWithEmbedFallback } from "@/lib/agent/cover-image";
import { resolveClientBrandColors } from "@/lib/agent/resolve-client-brand-colors";
import { clampMetaDescription, clampSeoTitle } from "@/lib/agent/clamp-seo-fields";
import { improvePostTo90 } from "@/lib/agent/improve-to-90";
import { normalizeFaqHeading } from "@/lib/agent/faq-heading";
import { localizeAuthorForLocale } from "@/lib/agent/localize-author-for-locale";
import {
  localeLanguageShortName,
  localeWritingLanguageInstruction,
} from "@/lib/agent/locale-language";
import { seoScoreAverage, seoScoreMeetsPublishBar } from "@/lib/agent/score-post";
import {
  appendAuthorBlock,
  sanitizeInternalMarkdownLinks,
  sanitizeRelativeMarkdownLinks,
  convertInternalLinksToRelative,
  stripAuthorBlocksFromContentMd,
  mergeAuthorWithContentMd,
} from "@/lib/agent/internal-link";
import {
  getCandidateSiteUrls,
  enrichWithTitles,
  expandEnrichedUrlsWithLocaleSiblings,
  narrowInternalLinksForLocale,
  rewriteMarkdownRelativePathsToLocale,
  type EnrichedUrl,
} from "@/lib/agent/site-urls";
import type { Locale } from "@/lib/types/db";
import { FREQUENCY_INTERVAL_MS } from "@/lib/scheduler/next-post";
import { verifyTrafficSchedulerInternalRequest } from "@/lib/scheduler/traffic-internal-auth";
import {
  pickRandomBylineAuthorId,
  resolveAuthorForByline,
} from "@/lib/data/blog-authors";
import { notifyDgArticleStatusIfLinked } from "@/lib/integrations/dg/notify";
import { requestInternalPublishPost } from "@/lib/publish/request-internal-publish";

export const maxDuration = 300;

/**
 * POST /api/scheduler/run
 *
 * Triggered by GET /api/scheduler/trigger (called on app traffic, rate-limited) or by manual POST with CRON_SECRET.
 * When run, it checks last_post_generated_at + frequency per client and only processes clients who are due.
 * With auto_publish + webhook, due clients get generated; posts publish only when SEO avg (SEO+AEO+GEO) ≥ 90, else status stays review. No cron required.
 *
 * For each client whose frequency interval has elapsed since last_post_generated_at,
 * this route:
 *   1. Claims the client (atomic) so concurrent runs do not double-process
 *   2. If the author has any post in `draft`, publishes the oldest draft (webhook + SEO gate via POST /api/publish)
 *   3. Otherwise: creates a new post row, generates content (Gemini), cover (Imagen), publishes or review per SEO bar
 *   4. Updates clients.last_post_generated_at
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
  let llm: AgentLlmBundle;
  try {
    llm = createAgentLlmBundle();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "LLM not configured";
    console.error("[scheduler]", msg);
    return NextResponse.json({ error: msg }, { status: 503 });
  }

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

  // Publish ready drafts first — do not wait for the frequency interval (covers timed-out generations).
  for (const client of clientsToConsider) {
    try {
      const draftResult = await tryPublishOldestDraft(admin, client);
      if (!draftResult) continue;
      if (draftResult.ok) {
        results.push({
          client_id: client.id,
          domain: client.domain,
          status: "published_draft",
          post_id: draftResult.post_id,
        });
      } else {
        console.warn(
          `[scheduler] Stranded draft publish failed for ${client.domain} (${draftResult.post_id}):`,
          draftResult.error,
        );
        results.push({
          client_id: client.id,
          domain: client.domain,
          status: "draft_publish_failed",
          post_id: draftResult.post_id,
          error: draftResult.error,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.warn(`[scheduler] Stranded draft check failed for ${client.domain}:`, msg);
    }
  }

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

  // Process at most one due client per invocation (avoids 300s timeout with multi-client queues).
  const MAX_CLIENTS_PER_RUN = 1;
  let processedDue = 0;

  for (let i = 0; i < dueClients.length; i++) {
    if (processedDue >= MAX_CLIENTS_PER_RUN) {
      results.push({
        client_id: dueClients[i]!.id,
        domain: dueClients[i]!.domain,
        status: "deferred_next_run",
      });
      continue;
    }
    const client = dueClients[i]!;
    if (i > 0 && processedDue > 0) {
      // Random delay 5â€“30 s between each client
      const jitterMs = 5_000 + Math.floor(Math.random() * 25_000);
      await new Promise((r) => setTimeout(r, jitterMs));
    }

    try {
      const outerSkipClaim = force || singleUserForce;
      const previousLastPost = client.last_post_generated_at ?? null;

      if (!(await claimClientForSchedulerIfNeeded(admin, client, outerSkipClaim, now))) {
        results.push({ client_id: client.id, domain: client.domain, status: "skipped_concurrent" });
        continue;
      }

      const draftPostId = await findOldestDraftPostId(admin, client.user_id);
      if (draftPostId) {
        const pub = await requestInternalPublishPost(draftPostId);
        if (pub.ok) {
          await admin
            .from("clients")
            .update({
              last_post_generated_at: new Date().toISOString(),
              last_generation_error: null,
              last_generation_error_at: null,
            })
            .eq("id", client.id);
          console.log(`[scheduler] Published existing draft for ${client.domain} -> post id ${draftPostId}`);
          results.push({ client_id: client.id, domain: client.domain, status: "published_draft", post_id: draftPostId });
          continue;
        }
        const errMsg = pub.error ?? `HTTP ${pub.status}`;
        console.warn(`[scheduler] Draft publish failed for ${client.domain} (${draftPostId}):`, errMsg);
        try {
          await admin
            .from("clients")
            .update({
              last_post_generated_at: previousLastPost,
              last_generation_error: `Draft publish failed: ${errMsg}`,
              last_generation_error_at: new Date().toISOString(),
            })
            .eq("id", client.id);
        } catch {
          /* ignore */
        }
        results.push({
          client_id: client.id,
          domain: client.domain,
          status: "draft_publish_failed",
          error: errMsg,
          post_id: draftPostId,
        });
        continue;
      }

      const postId = await generatePostForClient(client, admin, llm, {
        revertLastPostOnGenerationFailure: !outerSkipClaim,
        now,
      });
      processedDue += 1;
      results.push({ client_id: client.id, domain: client.domain, status: "generated", post_id: postId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[scheduler] Failed for client ${client.domain}:`, msg);
      results.push({ client_id: client.id, domain: client.domain, status: "error", error: msg });
    }
  }

  const generated = results.filter((r) => r.status === "generated").length;
  const publishedDrafts = results.filter((r) => r.status === "published_draft").length;
  const skipped =
    results.filter((r) => r.status === "skipped_not_due" || r.status === "skipped_concurrent").length;
  const errors = results.filter((r) => r.status === "error").length;
  const draftPublishFailed = results.filter((r) => r.status === "draft_publish_failed").length;

  console.log(
    `[scheduler] Done — generated: ${generated}, published_draft: ${publishedDrafts}, draft_publish_failed: ${draftPublishFailed}, skipped: ${skipped}, errors: ${errors}`,
  );

  await flushAiTokenUsageWrites();

  return NextResponse.json({
    ok: true,
    generated,
    published_drafts: publishedDrafts,
    draft_publish_failed: draftPublishFailed,
    skipped,
    errors,
    results,
  });
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

function normalizeSchedulerPrimaryLocale(postLocale: string | null | undefined): SupportedLocale {
  if (postLocale === "en" || postLocale === "pt" || postLocale === "fr") return postLocale;
  return "pt";
}

function localeToEnglishName(locale: SupportedLocale): string {
  return localeLanguageShortName(locale);
}

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
  author_job_title?: string | null;
  author_bio?: string | null;
  seo_score?: { seo: number; aeo: number; geo: number; notes: string };
};

type SchedulerRunOpts = {
  /**
   * When the outer handler successfully claimed the client, revert `last_post_generated_at`
   * if content generation fails after the claim.
   */
  revertLastPostOnGenerationFailure: boolean;
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

async function claimClientForSchedulerIfNeeded(
  admin: ReturnType<typeof createAdminClient>,
  client: SchedulerClient,
  outerSkipClaim: boolean,
  now: number,
): Promise<boolean> {
  if (outerSkipClaim) return true;
  const intervalMs = FREQUENCY_INTERVAL_MS[client.frequency] ?? FREQUENCY_INTERVAL_MS.weekly;
  const thresholdIso = new Date(now - intervalMs).toISOString();
  const claimIso = new Date(now).toISOString();
  const { data: claimedId, error: claimError } = await admin.rpc("claim_client_for_generation", {
    p_client_id: client.id,
    p_claim_iso: claimIso,
    p_threshold_iso: thresholdIso,
  });
  if (claimError) throw new Error(claimError.message);
  return Boolean(claimedId);
}

const STRANDED_DRAFT_SLUG_RE = /^draft-[0-9a-f]{8}-\d+$/;

function isStrandedSchedulerDraftSlug(slug: string | null | undefined): boolean {
  return !!slug && STRANDED_DRAFT_SLUG_RE.test(slug);
}

/** Empty scheduler placeholders left when generation times out before content is saved. */
async function cleanupStrandedSchedulerDrafts(
  admin: ReturnType<typeof createAdminClient>,
  authorId: string,
): Promise<string[]> {
  const { data: drafts, error } = await admin
    .from("posts")
    .select("id, slug, post_localizations(id)")
    .eq("author_id", authorId)
    .eq("status", "draft");

  if (error || !drafts?.length) return [];

  const deleted: string[] = [];
  for (const draft of drafts) {
    const locCount = (draft as { post_localizations?: Array<{ id: string }> }).post_localizations?.length ?? 0;
    if (locCount === 0 && isStrandedSchedulerDraftSlug(draft.slug)) {
      const { error: delErr } = await admin.from("posts").delete().eq("id", draft.id);
      if (!delErr) {
        deleted.push(draft.id);
        console.log(`[scheduler] Removed stranded empty draft ${draft.id} (${draft.slug})`);
      } else {
        console.warn(`[scheduler] Failed to remove stranded draft ${draft.id}:`, delErr.message);
      }
    }
  }
  return deleted;
}

async function findOldestDraftPostId(
  admin: ReturnType<typeof createAdminClient>,
  authorId: string,
): Promise<string | null> {
  await cleanupStrandedSchedulerDrafts(admin, authorId);

  const { data: drafts, error } = await admin
    .from("posts")
    .select("id, post_localizations(id)")
    .eq("author_id", authorId)
    .eq("status", "draft")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[scheduler] findOldestDraftPostId:", error.message);
    return null;
  }

  for (const draft of drafts ?? []) {
    const locCount = (draft as { post_localizations?: Array<{ id: string }> }).post_localizations?.length ?? 0;
    if (locCount > 0) return draft.id;
  }
  return null;
}

/** Publish the oldest draft when content is ready — runs even if the client is not due yet. */
async function tryPublishOldestDraft(
  admin: ReturnType<typeof createAdminClient>,
  client: SchedulerClient,
): Promise<{ post_id: string; ok: true } | { post_id: string; ok: false; error: string } | null> {
  const draftPostId = await findOldestDraftPostId(admin, client.user_id);
  if (!draftPostId) return null;

  const pub = await requestInternalPublishPost(draftPostId);
  if (pub.ok) {
    console.log(`[scheduler] Published stranded draft for ${client.domain} -> post id ${draftPostId}`);
    return { post_id: draftPostId, ok: true };
  }
  return { post_id: draftPostId, ok: false, error: pub.error ?? `HTTP ${pub.status}` };
}

async function generatePostForClient(
  client: SchedulerClient,
  admin: ReturnType<typeof createAdminClient>,
  llm: AgentLlmBundle,
  runOpts: SchedulerRunOpts,
): Promise<string> {
  const { text, embeddings } = llm;
  const modelName = text.modelName;
  // Always generate in all three locales; primary matches clients.post_locale (default pt)
  const primaryLocale = normalizeSchedulerPrimaryLocale(client.post_locale);
  const previousLastPost = client.last_post_generated_at ?? null;
  const combinedInstructions = combineClientInstructionsForModel(
    client.custom_instructions,
    client.instruction_reinforcement,
  );

  // Track the created post ID so the catch block can clean up
  let createdPostId: string | null = null;

  bindAiUsageContext({
    userId: client.user_id,
    clientId: client.id,
  });

  try {
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
      const pick = locs.find((l) => l.locale === primaryLocale);
      return pick?.title?.trim() ?? locs[0]?.title?.trim() ?? null;
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
  bindAiUsageContext({ postId: post.id });

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
  const enrichedBase: EnrichedUrl[] =
    rawUrls.length > 0 ? await enrichWithTitles(rawUrls, 35) : [];
  const allEnriched = expandEnrichedUrlsWithLocaleSiblings(enrichedBase);
  /** Every known same-site URL (all locale variants) — required when validating translated markdown that still uses primary-language paths until rewritten */
  const allExpandedUrls = allEnriched.map((c) => c.url);
  const primaryLinkEnriched = narrowInternalLinksForLocale(allEnriched, primaryLocale);
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
    internalLinkCandidates: primaryLinkEnriched.length > 0 ? primaryLinkEnriched : null,
  };

  const brandName = (brandBook as { brandName?: string } | null)?.brandName ?? client.brand_name ?? client.domain;
  const publisherEntity = {
    "@type": "Organization",
    "name": brandName,
    "url": `https://${client.domain}`,
    "logo": { "@type": "ImageObject", "url": `https://${client.domain}/logo.png` },
  };

  const systemInstruction = await resolvePostSystemInstructions(
    embeddings,
    combinedInstructions,
    {
      contentType: "hero",
      locale: primaryLocale,
      focusKeywordOrTopic: topicHint,
      hasInternalLinks: primaryLinkEnriched.length > 0,
      taskKind: "post_generation",
    },
  );

  // ── STEP 1: Generate primary content in clients.post_locale ─────────────────
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
    .insert({ post_id: post.id, locale: primaryLocale, status: "running", model: modelName, input: { postCtx, clientCtx } })
    .select("id")
    .single();
  const primaryRunId = primaryRun?.id;

  const primaryPrompt = buildPrompt(postCtx, clientCtx, { hasCustomInstructions: !!combinedInstructions });
  const MAX_RETRIES = 3;
  let lastPrimaryError: string | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await text.generateText({
        prompt: primaryPrompt,
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 8192,
        assistant: "post_writer",
      });
      const clean = stripModelJsonFences(raw);
      primaryContent = JSON.parse(clean);
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastPrimaryError = msg;
      console.warn(`[scheduler] ${text.provider} attempt ${attempt}/${MAX_RETRIES} failed for ${primaryLocale} (${client.domain}): ${msg}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 5_000 * attempt));
      }
    }
  }

  if (!primaryContent) {
    if (primaryRunId) {
      await admin
        .from("agent_runs")
        .update({ status: "failed", error: lastPrimaryError ?? "Model failed after 3 attempts" })
        .eq("id", primaryRunId);
    }
    const quotaHint = lastPrimaryError && /429|quota|billing/i.test(lastPrimaryError)
      ? `AI quota exceeded${client.domain ? ` for ${client.domain}` : ""}. Check GEMINI_API_KEY / Google billing, or set OPENAI_API_KEY for fallback when AI_PROVIDER=gemini.`
      : `Primary content generation failed for ${client.domain}${lastPrimaryError ? `: ${lastPrimaryError}` : ""}`;
    throw new Error(quotaHint);
  }

  const primaryLinkUrls = primaryLinkEnriched.map((c) => c.url);
  primaryContent.content_md = sanitizeInternalMarkdownLinks(
    primaryContent.content_md,
    primaryLinkUrls
  );
  primaryContent.content_md = convertInternalLinksToRelative(primaryContent.content_md, client.domain);
  primaryContent.content_md = sanitizeRelativeMarkdownLinks(primaryContent.content_md, primaryLinkUrls);

  const qualitySystemInstruction = await resolvePostSystemInstructions(
    embeddings,
    combinedInstructions,
    {
      contentType: "hero",
      locale: primaryLocale,
      focusKeywordOrTopic: topicHint,
      hasInternalLinks: primaryLinkEnriched.length > 0,
      taskKind: "quality_loop",
    },
  );

  // Post-generation: score, review, and revise until 90+ (see improve-to-90 MAX_ITERATIONS)
  const { content: improvedContent, score: finalScore } = await improvePostTo90(
    text,
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

  let authorForBlock = await resolveAuthorForByline(admin, client.user_id, bylineAuthorId);
  if (authorForBlock) {
    authorForBlock = await localizeAuthorForLocale(text, authorForBlock, primaryLocale as Locale);
  }

  primaryContent.content_md = normalizeFaqHeading(primaryContent.content_md, primaryLocale);

  const primaryContentMd = appendAuthorBlock(
    primaryContent.content_md,
    primaryLocale as Locale,
    authorForBlock,
  );
  const primarySeoTitle = clampSeoTitle(primaryContent.seo_title);
  const primarySeoDesc = clampMetaDescription(primaryContent.seo_description);

  const primaryJsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": primaryContent.title,
        "description": primarySeoDesc,
        "keywords": primaryContent.focus_keyword,
        "datePublished": new Date().toISOString(),
        "inLanguage": primaryLocale,
        "author": publisherEntity,
        "publisher": publisherEntity,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://${client.domain}/${primaryLocale}/blog/${slug}`,
        },
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
      locale: primaryLocale,
      title: primaryContent.title,
      excerpt: primaryContent.excerpt,
      content_md: primaryContentMd,
      seo_title: primarySeoTitle,
      seo_description: primarySeoDesc,
      focus_keyword: primaryContent.focus_keyword,
      faq_blocks: primaryContent.faq_blocks ?? null,
      jsonld: primaryJsonld,
      seo_score: primaryContent.seo_score ?? null,
    },
    { onConflict: "post_id,locale" }
  );

  if (primaryRunId) {
    await admin.from("agent_runs").update({
      status: "done",
      output: { ...primaryContent, content_md: primaryContentMd },
    }).eq("id", primaryRunId);
  }

  // ── STEP 2: Translate to other locales ──────────────────────────────────────
  const translationSystemInstruction = await resolvePostSystemInstructions(
    embeddings,
    combinedInstructions,
    {
      contentType: "hero",
      locale: `Translate from ${localeToEnglishName(primaryLocale)} to the target language`,
      focusKeywordOrTopic: topicHint,
      hasInternalLinks: allEnriched.length > 0,
      taskKind: "translation",
    },
  );

  const translationLocales = ALL_LOCALES.filter((l) => l !== primaryLocale);

  await Promise.all(
    translationLocales.map(async (locale) => {
    const { data: transRun } = await admin
      .from("agent_runs")
      .insert({
        post_id: post.id,
        locale,
        status: "running",
        model: modelName,
        input: { action: "translate", from: primaryLocale, to: locale },
      })
      .select("id")
      .single();
    const transRunId = transRun?.id;

    const langName = localeWritingLanguageInstruction(locale);
    const sourceLangName = localeWritingLanguageInstruction(primaryLocale);
    const primaryBodyForTranslation = stripAuthorBlocksFromContentMd(primaryContentMd);
    const authorSourceBlock = authorForBlock
      ? `
AUTHOR BYLINE (translate job title and bio into natural ${langName}; keep the display name unchanged if it is a brand or company name):
Name: ${authorForBlock.displayName}
Job title: ${authorForBlock.jobTitle ?? ""}
Bio: ${authorForBlock.bio ?? ""}
`
      : "";

    const translationPrompt = `You are a professional translator. Translate the following blog post from ${sourceLangName} to ${langName}.

RULES:
- Translate ALL text accurately while preserving the exact same structure, markdown formatting, and meaning.
- Keep the same headings (H1, H2, H3), bullet points, numbered lists, and FAQ format.
- Translate the FAQ section H2 heading to the target language (English: "## Frequently asked questions", European Portuguese / Portugal: "## Perguntas frequentes", French: "## Questions fréquentes").
- Translate the title, excerpt, SEO title, SEO description, and all FAQ questions/answers.
- Translate author_job_title and author_bio into ${langName} (required when author fields are provided below). Do NOT leave the bio in ${sourceLangName}.
- Do NOT include an "About the author" / author HTML block inside content_md — the CMS appends that separately.
- Keep any brand names, proper nouns, and technical terms as-is (e.g., "Google Analytics", "SEO", company names).
- Industry acronyms (SEO, AEO, GEO, AI, CRM, etc.) must remain in ALL CAPS in ${langName}.
- In content_md: for every markdown link [anchor](url), keep the url EXACTLY unchanged (character-for-character); translate only the anchor text inside the brackets to natural ${langName}. Do not add, remove, or reorder links.
- Do not add a date line or cover image in content_md; the website template shows them above the body.
- Do NOT add, remove, or change any facts, statistics, or claims — only translate.
- Use natural, fluent ${langName} — not word-for-word translation.
- If the target is European Portuguese (Portugal / pt-PT): NEVER use Brazilian Portuguese. Prefer «estar a + infinitivo» (not Brazilian gerunds), and Portugal vocabulary (utilizador, ficheiro, ecrã, telemóvel, autocarro, comboio, equipa, contacto).

ORIGINAL CONTENT (${sourceLangName}):

Title: ${primaryContent.title}
Excerpt: ${primaryContent.excerpt}
SEO Title: ${primaryContent.seo_title}
SEO Description: ${primaryContent.seo_description}
Focus Keyword: ${primaryContent.focus_keyword}
${authorSourceBlock}
Content (Markdown) — body only, no author section:
${primaryBodyForTranslation}

FAQ Blocks:
${(primaryContent.faq_blocks ?? []).map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join("\n")}

Respond with a single valid JSON object — no markdown fences, no preamble:
{
  "title": "Translated title",
  "excerpt": "Translated excerpt",
  "seo_title": "Translated SEO title",
  "seo_description": "Translated SEO description",
  "focus_keyword": "Translated focus keyword",
  "content_md": "Full translated markdown body (no author section)",
  "author_job_title": "Translated job title or null",
  "author_bio": "Translated author bio in ${langName}",
  "faq_blocks": [{ "question": "Translated question", "answer": "Translated answer" }]
}`;

    let translated: GeneratedContent | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const raw = await text.generateText({
          prompt: translationPrompt,
          systemInstruction: translationSystemInstruction,
          temperature: 0.25,
          maxOutputTokens: 8192,
          assistant: "post_translator",
        });
        const clean = stripModelJsonFences(raw);
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
      return;
    }

    // Carry over SEO scores from primary content
    translated.seo_score = primaryContent.seo_score;

    // Translation keeps primary URLs (often /en/...); locale-only allowlists stripped them. Validate against
    // all expanded URLs first, then rewrite paths to this locale, then relative-sanitize with locale-narrowed list.
    const localeLinkUrls = narrowInternalLinksForLocale(allEnriched, locale as Locale).map((c) => c.url);
    translated.content_md = sanitizeInternalMarkdownLinks(translated.content_md, allExpandedUrls);
    translated.content_md = convertInternalLinksToRelative(translated.content_md, client.domain);
    translated.content_md = rewriteMarkdownRelativePathsToLocale(translated.content_md, locale as Locale);
    translated.content_md = sanitizeRelativeMarkdownLinks(translated.content_md, localeLinkUrls);
    translated.content_md = normalizeFaqHeading(translated.content_md, locale);
    const authorForTranslatedLocale = authorForBlock
      ? {
          ...authorForBlock,
          jobTitle: translated.author_job_title?.trim() || authorForBlock.jobTitle,
          bio: translated.author_bio?.trim() || authorForBlock.bio,
        }
      : null;
    translated.content_md = appendAuthorBlock(
      stripAuthorBlocksFromContentMd(translated.content_md),
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
    }),
  );

  // ── Generate cover image before publish (once, shared across all locales) ───
  let coverAdded = false;
  try {
    const coverSubjectRaw = coverImageDescription
      ? coverImageDescription
      : `Blog hero banner for "${titleForCoverPrompt}": rich, topic-specific visuals; distinctive composition for this article.`;
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
      referenceVisionBrief = await buildCoverReferenceVisionBriefWithTimeout(
        coverVisionClientsFromLlm(llm),
        refParts,
        `[scheduler] ref-vision ${client.domain}`,
      );
      if (!referenceVisionBrief?.trim()) {
        console.warn(
          `[scheduler] cover-reference-vision unavailable for ${client.domain} — continuing without brief`,
        );
      }
    }
    const omitOnImageText = clientDisallowsCoverOnImageText(combinedInstructions);
    const { prefix: coverEmbedPrefix } = await buildCoverInstructionEmbeddingPrefixWithMeta(
      embeddings,
      {
        focusKeywordOrTopic: primaryContent.focus_keyword || titleForCoverPrompt,
        contentType: "hero",
        locale: primaryLocale,
        hasInternalLinks: primaryLinkEnriched.length > 0,
      },
      combinedInstructions,
      referenceVisionBrief,
      { omitOnImageText },
    );
    const baseCoverPrompt = buildCoverPrompt(
      coverSubject,
      omitOnImageText ? "" : headlineForCover,
      brandStyle,
      visualIdentity ? {
        colorPalette: visualIdentity.colorPalette,
        aestheticStyle: visualIdentity.aestheticStyle,
        imageStyle: visualIdentity.imageStyle,
      } : null,
      {
        headlineMayBeNonEnglish: !omitOnImageText && !coverHeadlineIsEnglishOnly,
        hasReferenceImages: refParts.length > 0,
        omitOnImageText,
      },
    );
    const buffer = await generateCoverImageBufferWithEmbedFallback(coverImageClientsFromLlm(llm), {
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
        coverAdded = true;
      } else {
        console.warn(`[scheduler] Cover upload failed for ${client.domain}:`, uploadErr.message);
      }
    } else {
      console.warn(`[scheduler] Cover generation returned no image for ${client.domain}`);
    }
  } catch (coverErr) {
    console.warn(`[scheduler] Cover generation failed for ${client.domain}:`, coverErr);
  }

  const scoreOk = seoScoreMeetsPublishBar(primaryContent.seo_score ?? null);
  const canAutoPublish = scoreOk && coverAdded;

  if (canAutoPublish) {
    const pub = await requestInternalPublishPost(post.id);
    if (!pub.ok) {
      const avg = primaryContent.seo_score ? seoScoreAverage(primaryContent.seo_score) : null;
      console.warn(
        `[scheduler] Auto-publish failed for ${client.domain} (${post.id}): ${pub.error ?? pub.status}; avg=${avg ?? "n/a"}`,
      );
      await admin.from("posts").update({
        status: "review",
        published_at: null,
        webhook_status: null,
        webhook_sent_at: null,
        webhook_error: pub.error ?? null,
      }).eq("id", post.id);
    }
  } else if (scoreOk && !coverAdded) {
    console.warn(
      `[scheduler] Post ${post.id} left in review: cover image missing (${client.domain})`,
    );
    await admin.from("posts").update({
      status: "review",
      published_at: null,
      webhook_status: null,
      webhook_sent_at: null,
      webhook_error: "Cover image could not be generated",
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

  void notifyDgArticleStatusIfLinked(post.id);

  await admin.from("clients").update({
    last_post_generated_at: new Date().toISOString(),
    last_generation_error: null,
    last_generation_error_at: null,
  }).eq("id", client.id);

  const { data: finalPost } = await admin.from("posts").select("status").eq("id", post.id).maybeSingle();
  const finalStatus = finalPost?.status ?? (canAutoPublish ? "published" : "review");
  console.log(
    `[scheduler] Generated post (3 locales) for ${client.domain} -> post id ${post.id} (${finalStatus}, cover=${coverAdded ? "yes" : "no"})`,
  );
  return post.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[scheduler] Generation failed for ${client.domain} (post ${createdPostId ?? "pre-insert"}):`, msg);
    const clientPatch: Record<string, string | null> = {
      last_generation_error: msg,
      last_generation_error_at: new Date().toISOString(),
    };
    if (runOpts.revertLastPostOnGenerationFailure) {
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
