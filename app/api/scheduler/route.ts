import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTIONS, buildPrompt, type ClientContext, type PostContext } from "@/lib/agent/instructions";

const MODEL = "gemini-3.1-pro-preview";

/**
 * Frequency → minimum interval in milliseconds before a new post should be generated.
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
    const due = now - lastRun >= intervalMs;
    if (due) {
      dueClients.push(client);
    } else {
      results.push({ client_id: client.id, domain: client.domain, status: "skipped_not_due" });
    }
  }

  // Process due clients with a random stagger (0–30 s per client) to spread API load
  for (let i = 0; i < dueClients.length; i++) {
    const client = dueClients[i];
    if (i > 0) {
      // Random delay 5–30 s between each client
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

  console.log(`[scheduler] Done — generated: ${generated}, skipped: ${skipped}, errors: ${errors}`);

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

// ─── Core generation logic ───────────────────────────────────────────────────

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
  const locale = (client.post_locale ?? "en") as string;
  const publicationDate = new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).format(new Date());

  // Derive a focus keyword from the domain (simple heuristic — works well for agency clients)
  const domainSlug = client.domain.replace(/^www\./, "").replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]/gi, " ").trim();
  const focusKeyword = `${domainSlug} ${new Date().getFullYear()}`.toLowerCase();

  // Auto-generate a URL-safe slug from the domain + date
  const datePart = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const slugBase = `${domainSlug.replace(/\s+/g, "-")}-${datePart}`.toLowerCase().slice(0, 70);

  // Ensure unique slug
  let slug = slugBase;
  const { data: existing } = await admin.from("posts").select("id").eq("slug", slug).maybeSingle();
  if (existing) slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

  // Create the post row in "draft" first
  const { data: post, error: postError } = await admin
    .from("posts")
    .insert({
      slug,
      primary_locale: locale,
      content_type: "hero",
      status: "draft",
      author_id: client.user_id,
    })
    .select("id")
    .single();

  if (postError || !post) throw new Error(postError?.message ?? "Failed to create post row");

  // Create empty localization so we have a record to upsert into
  await admin.from("post_localizations").insert({
    post_id: post.id,
    locale,
    title: "",
    excerpt: "",
    content_md: "",
  });

  // Build generation contexts
  const clientCtx: ClientContext = {
    domain: client.domain,
    websiteSummary: null,
    industry: null,
    gaTopPages: null,
    gaTopKeywords: null,
    searchConsoleQueries: null,
  };

  const postCtx: PostContext = {
    slug,
    content_type: "hero",
    locale,
    focus_keyword: focusKeyword,
    publication_date: publicationDate,
    existing_title: null,
    existing_draft: null,
  };

  // Log agent run
  const { data: run } = await admin
    .from("agent_runs")
    .insert({ post_id: post.id, locale, status: "running", model: MODEL, input: { postCtx, clientCtx } })
    .select("id")
    .single();
  const runId = run?.id;

  // Generate content with Gemini
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_INSTRUCTIONS,
  });

  const prompt = buildPrompt(postCtx, clientCtx);
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let generated: {
    title: string;
    seo_title: string;
    seo_description: string;
    focus_keyword: string;
    excerpt: string;
    content_md: string;
    faq_blocks: Array<{ question: string; answer: string }>;
    seo_score?: { seo: number; aeo: number; geo: number; notes: string };
  };

  try {
    generated = JSON.parse(clean);
  } catch {
    if (runId) await admin.from("agent_runs").update({ status: "failed", error: "Invalid JSON from Gemini" }).eq("id", runId);
    throw new Error("Gemini returned invalid JSON");
  }

  // Build JSON-LD
  const publisherEntity = {
    "@type": "Organization",
    "name": "Flow Productions",
    "url": `https://${client.domain}`,
    "logo": { "@type": "ImageObject", "url": "https://flowproductions.pt/logo.png" },
  };
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
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://${client.domain}/blog/${slug}` },
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

  // Save generated content
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

  // Generate cover image
  try {
    const coverPrompt =
      `Professional hero image for a blog post about: "${generated.focus_keyword}". ` +
      `Wide landscape format, 16:9 ratio. High quality, modern, editorial photography style. ` +
      `Clean composition, no text overlays, no watermarks.`;

    const imgResponse = await imagenAI.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: coverPrompt,
      config: { numberOfImages: 1, aspectRatio: "16:9", outputMimeType: "image/jpeg" },
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

  // Auto-publish: if client has auto_publish on, publish immediately and fire webhook.
  // Otherwise put in "review" so the user can approve/edit in their dashboard.
  if (client.auto_publish && client.webhook_url) {
    await admin.from("posts").update({
      status: "published",
      published_at: new Date().toISOString(),
      webhook_status: "pending",
      webhook_sent_at: new Date().toISOString(),
      webhook_error: null,
    }).eq("id", post.id);

    // Fire webhook
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const webhookRes = await fetch(`${appUrl}/api/publish/${post.id}`, {
        method: "POST",
        headers: { "x-scheduler-internal": "1" },
      });
      if (!webhookRes.ok) {
        const err = await webhookRes.text().catch(() => "");
        console.warn(`[scheduler] Webhook failed for ${client.domain}: ${err.slice(0, 200)}`);
      }
    } catch (webhookErr) {
      console.warn(`[scheduler] Webhook error for ${client.domain}:`, webhookErr);
    }
  } else {
    // No auto-publish — put in user's review queue
    await admin.from("posts").update({ status: "review" }).eq("id", post.id);
  }

  // Update last_post_generated_at on the client
  await admin.from("clients").update({ last_post_generated_at: new Date().toISOString() }).eq("id", client.id);

  console.log(`[scheduler] Generated post "${generated.title}" for ${client.domain} → post id ${post.id}`);
  return post.id;
}
