import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTIONS, buildPrompt, type ClientContext, type PostContext } from "@/lib/agent/instructions";

const MODEL = "gemini-3.1-pro-preview";

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
 * Called by Vercel Cron (daily at 07:00 UTC).
 * Also callable manually with a CRON_SECRET header for testing.
 *
 * For each client whose frequency interval has elapsed since last_post_generated_at,
 * this route:
 *   1. Creates a new draft post row
 *   2. Generates content with Gemini (same pipeline as manual "Generate with AI")
 *   3. Generates a cover image with Imagen 4
 *   4. Sets post status to "review" so the admin can approve it
 *   5. Updates clients.last_post_generated_at
 */
export async function POST(req: NextRequest) {
  // Verify the request is from Vercel Cron or an authorised manual trigger
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ?force=true bypasses the frequency interval check â€” useful for testing
  const force = new URL(req.url).searchParams.get("force") === "true";

  const admin = createAdminClient();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const imagenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // Fetch all clients that have completed onboarding (have a domain)
  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("id, user_id, domain, frequency, last_post_generated_at, google_access_token, google_scope, auto_publish, webhook_url, post_locale")
    .not("domain", "is", null);

  if (clientsError) {
    console.error("[scheduler] Failed to fetch clients:", clientsError.message);
    return NextResponse.json({ error: clientsError.message }, { status: 500 });
  }

  const now = Date.now();
  const results: Array<{ client_id: string; domain: string; status: string; post_id?: string; error?: string }> = [];

  // Collect clients that are due so we can stagger their generation
  const dueClients: NonNullable<typeof clients> = [];
  for (const client of clients ?? []) {
    const intervalMs = FREQUENCY_INTERVAL_MS[client.frequency] ?? FREQUENCY_INTERVAL_MS.weekly;
    const lastRun = client.last_post_generated_at ? new Date(client.last_post_generated_at).getTime() : 0;
    const due = force || now - lastRun >= intervalMs;
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

// Allow GET for a quick health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Scheduler endpoint is live. POST to trigger a run.",
    next_run: "Daily at 07:00 UTC via Vercel Cron",
  });
}

// â”€â”€â”€ Core generation logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ALL_LOCALES = ["pt", "en", "fr"] as const;
type SupportedLocale = (typeof ALL_LOCALES)[number];

type GeneratedContent = {
  title: string;
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  excerpt: string;
  content_md: string;
  faq_blocks: Array<{ question: string; answer: string }>;
  seo_score?: { seo: number; aeo: number; geo: number; notes: string };
};

async function generatePostForClient(
  client: {
    id: string;
    user_id: string;
    domain: string;
    frequency: string;
    google_access_token: string | null;
    google_scope: string | null;
    auto_publish?: boolean | null;
    webhook_url?: string | null;
    post_locale?: string | null;
  },
  admin: ReturnType<typeof createAdminClient>,
  genAI: GoogleGenerativeAI,
  imagenAI: GoogleGenAI,
): Promise<string> {
  // Always generate in all three locales; primary is Portuguese (main site language)
  const primaryLocale: SupportedLocale = "pt";

  const publicationDate = new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).format(new Date());

  // Derive a focus keyword from the domain
  const domainSlug = client.domain.replace(/^www\./, "").replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]/gi, " ").trim();
  const focusKeyword = `${domainSlug} ${new Date().getFullYear()}`.toLowerCase();

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

  // Build shared context
  const clientCtx: ClientContext = {
    domain: client.domain,
    websiteSummary: null,
    industry: null,
    gaTopPages: null,
    gaTopKeywords: null,
    searchConsoleQueries: null,
  };

  const publisherEntity = {
    "@type": "Organization",
    "name": "Flow Productions",
    "url": `https://${client.domain}`,
    "logo": { "@type": "ImageObject", "url": "https://flowproductions.pt/logo.png" },
  };

  const geminiModel = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_INSTRUCTIONS,
  });

  // â”€â”€ Generate content for each locale sequentially â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PT is generated first so we can derive the slug from its title.
  let slug = tempSlug;
  let titleForCoverPrompt = focusKeyword;
  let firstRunId: string | undefined;

  for (const locale of ALL_LOCALES) {
    const postCtx: PostContext = {
      slug,
      content_type: "hero",
      locale,
      focus_keyword: focusKeyword,
      publication_date: publicationDate,
      existing_title: null,
      existing_draft: null,
    };

    const { data: run } = await admin
      .from("agent_runs")
      .insert({ post_id: post.id, locale, status: "running", model: MODEL, input: { postCtx, clientCtx } })
      .select("id")
      .single();
    const runId = run?.id;
    if (locale === primaryLocale) firstRunId = runId;

    const prompt = buildPrompt(postCtx, clientCtx);
    let generated: GeneratedContent;

    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text().trim();
      const clean = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      generated = JSON.parse(clean);
    } catch (err) {
      if (runId) await admin.from("agent_runs").update({ status: "failed", error: "Invalid JSON from Gemini" }).eq("id", runId);
      console.warn(`[scheduler] Gemini failed for locale ${locale}, client ${client.domain} â€” skipping`);
      continue;
    }

    if (locale === primaryLocale) {
      titleForCoverPrompt = generated.title;

      // Derive the final slug from the PT title â€” short, clean, no date
      // e.g. "VisÃ£o da flowproductions 2026: o futuro da produÃ§Ã£o" â†’ "visao-da-flowproductions-2026-o-futuro-da-producao"
      const titleSlug = generated.title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip diacritics
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60)
        .replace(/-$/, "");

      // Ensure uniqueness with a short suffix
      const suffix = Math.random().toString(36).slice(2, 6);
      slug = `${titleSlug}-${suffix}`;

      // Update the post row with the real slug
      await admin.from("posts").update({ slug }).eq("id", post.id);
    }

    const jsonld = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "headline": generated.title,
          "description": generated.seo_description,
          "keywords": generated.focus_keyword,
          "datePublished": new Date().toISOString(),
          "inLanguage": locale,
          "author": publisherEntity,
          "publisher": publisherEntity,
          "mainEntityOfPage": { "@type": "WebPage", "@id": `https://${client.domain}/${locale}/blog/${slug}` },
        },
        ...(generated.faq_blocks?.length > 0 ? [{
          "@type": "FAQPage",
          "mainEntity": generated.faq_blocks.map((f) => ({
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
        title: generated.title,
        excerpt: generated.excerpt,
        content_md: generated.content_md,
        seo_title: generated.seo_title,
        seo_description: generated.seo_description,
        focus_keyword: generated.focus_keyword,
        faq_blocks: generated.faq_blocks,
        jsonld,
        seo_score: generated.seo_score ?? null,
      },
      { onConflict: "post_id,locale" }
    );

    if (runId) await admin.from("agent_runs").update({ status: "done", output: generated }).eq("id", runId);

    // Small pause between locale generations to respect rate limits
    if (locale !== ALL_LOCALES[ALL_LOCALES.length - 1]) {
      await new Promise((r) => setTimeout(r, 3_000));
    }
  }

  void firstRunId; // suppress unused warning

  // â”€â”€ Generate cover image (once, shared across all locales) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  try {
    const coverPrompt =
      `Professional hero cover image for a blog post titled: "${titleForCoverPrompt}". ` +
      `Topic: ${focusKeyword}. ` +
      `Tall wide format, 4:3 aspect ratio. The image fills a full-width hero panel: 82vh tall on desktop (â‰ˆ1574px at 1920px wide), 62vh tall on mobile. Use object-cover crop. ` +
      `Keep the main subject centred both horizontally and vertically â€” safe zone is the central 60% of the frame. ` +
      `High quality, modern, editorial photography style. Clean composition. No text, no overlays, no watermarks, no borders.`;

    const imgResponse = await imagenAI.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: coverPrompt,
      config: { numberOfImages: 1, aspectRatio: "4:3", outputMimeType: "image/jpeg" },
    });

    const img = imgResponse.generatedImages?.[0]?.image;
    if (img?.imageBytes) {
      const binaryStr = atob(img.imageBytes as unknown as string);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      const coverPath = `${post.id}/cover-${Date.now()}.jpg`;
      const { error: uploadErr } = await admin.storage
        .from("covers")
        .upload(coverPath, bytes.buffer, { contentType: "image/jpeg", upsert: true });

      if (!uploadErr) {
        await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", post.id);
      }
    }
  } catch (coverErr) {
    console.warn(`[scheduler] Cover generation failed for ${client.domain} (non-fatal):`, coverErr);
  }


  // Auto-publish or send to review queue
  if (client.auto_publish && client.webhook_url) {
    // Inline publish — no self-fetch to avoid cold-start timeouts on Vercel
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

      const webhookHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (clientConfig?.webhook_secret) webhookHeaders["x-webhook-secret"] = clientConfig.webhook_secret;

      const webhookPayload = {
        event: "cms.post.published",
        post: {
          id: post.id,
          slug: freshPost?.slug ?? slug,
          cover_image_url: coverImageUrl,
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

      await admin.from("posts").update({
        status: "published",
        published_at: new Date().toISOString(),
        webhook_status: "pending",
        webhook_sent_at: new Date().toISOString(),
        webhook_error: null,
      }).eq("id", post.id);

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
        console.log(`[scheduler] Auto-published to ${client.webhook_url}`);
      }
    } catch (publishErr) {
      const msg = publishErr instanceof Error ? publishErr.message : "Unknown error";
      await admin.from("posts").update({
        status: "published",
        published_at: new Date().toISOString(),
        webhook_status: "failed",
        webhook_error: msg,
      }).eq("id", post.id);
      console.warn(`[scheduler] Auto-publish error for ${client.domain}:`, msg);
    }
  } else {
    await admin.from("posts").update({ status: "review" }).eq("id", post.id);
  }

  await admin.from("clients").update({ last_post_generated_at: new Date().toISOString() }).eq("id", client.id);

  console.log(`[scheduler] Generated post (3 locales) for ${client.domain} -> post id ${post.id}`);
  return post.id;
}
