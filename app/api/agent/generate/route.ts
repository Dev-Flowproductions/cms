import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTIONS, buildPrompt, type ClientContext, type PostContext } from "@/lib/agent/instructions";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const imagenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-3.1-flash-lite";

export async function POST(request: Request) {
  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { post_id: string; locale: string; focus_keyword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { post_id, locale, focus_keyword } = body;
  if (!post_id || !locale) {
    return NextResponse.json({ error: "post_id and locale are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch post
  const { data: post } = await admin
    .from("posts")
    .select("slug, content_type, primary_locale, author_id")
    .eq("id", post_id)
    .single();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Fetch existing localization
  const { data: existing } = await admin
    .from("post_localizations")
    .select("title, excerpt, content_md, seo_title, seo_description, focus_keyword")
    .eq("post_id", post_id)
    .eq("locale", locale)
    .maybeSingle();

  const keyword = focus_keyword ?? existing?.focus_keyword ?? post.slug.replace(/-/g, " ");

  // Fetch client context (domain, GA/Search Console data)
  const { data: clientRow } = await admin
    .from("clients")
    .select("domain, google_access_token, google_scope")
    .eq("user_id", post.author_id)
    .maybeSingle();

  // Build client context — GA/Search Console data will be fetched here in V2
  // For now we pass domain and leave analytics fields empty (populated once OAuth is connected)
  const clientCtx: ClientContext = {
    domain: clientRow?.domain ?? null,
    websiteSummary: null,       // TODO: scrape / store website description
    industry: null,             // TODO: add industry field to clients table
    gaTopPages: null,           // TODO: fetch from GA API using google_access_token
    gaTopKeywords: null,        // TODO: fetch from GA API
    searchConsoleQueries: null, // TODO: fetch from Search Console API
  };

  // Publication date
  const publicationDate = new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).format(new Date());

  const postCtx: PostContext = {
    slug: post.slug,
    content_type: post.content_type,
    locale,
    focus_keyword: keyword,
    publication_date: publicationDate,
    existing_title: existing?.title || null,
    existing_draft: existing?.content_md || null,
  };

  // Log run
  const { data: run } = await admin
    .from("agent_runs")
    .insert({
      post_id,
      locale,
      status: "running",
      model: MODEL,
      input: { postCtx, clientCtx },
    })
    .select("id")
    .single();
  const runId = run?.id;

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_INSTRUCTIONS,
    });

    const prompt = buildPrompt(postCtx, clientCtx);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip accidental code fences
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
      if (runId) await admin.from("agent_runs").update({ status: "failed", error: "Invalid JSON from Gemini", output: { raw: text } }).eq("id", runId);
      return NextResponse.json({ error: "Gemini returned invalid JSON. Try again." }, { status: 500 });
    }

    // Build rich JSON-LD (Article + FAQPage + speakable + publisher)
    const publisherEntity = {
      "@type": "Organization",
      "name": "Flow Productions",
      "url": clientRow?.domain ? `https://${clientRow.domain}` : "https://flowproductions.pt",
      "logo": {
        "@type": "ImageObject",
        "url": "https://flowproductions.pt/logo.png",
      },
    };

    const articleEntity = {
      "@type": "BlogPosting",
      "headline": generated.title,
      "description": generated.seo_description,
      "keywords": generated.focus_keyword,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "inLanguage": locale,
      "author": publisherEntity,
      "publisher": publisherEntity,
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", "h2", ".intro"],
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": clientRow?.domain
          ? `https://${clientRow.domain}/blog/${post.slug}`
          : `https://flowproductions.pt/blog/${post.slug}`,
      },
    };

    const faqEntity = generated.faq_blocks?.length > 0
      ? {
          "@type": "FAQPage",
          "mainEntity": generated.faq_blocks.map((f) => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": { "@type": "Answer", "text": f.answer },
          })),
        }
      : null;

    const jsonld = {
      "@context": "https://schema.org",
      "@graph": [articleEntity, ...(faqEntity ? [faqEntity] : [])],
    };

    // Save to DB
    const { error: upsertError } = await admin
      .from("post_localizations")
      .upsert(
        {
          post_id,
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

    if (upsertError) {
      if (runId) await admin.from("agent_runs").update({ status: "failed", error: upsertError.message }).eq("id", runId);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    if (runId) await admin.from("agent_runs").update({ status: "done", output: generated }).eq("id", runId);

    // ── Auto-generate cover image with Imagen
    let coverPublicUrl: string | null = null;
    try {
      const coverPrompt =
        `Professional hero image for a blog post about: "${generated.focus_keyword}". ` +
        `Wide landscape format, 16:9 ratio. High quality, modern, editorial photography style. ` +
        `Clean composition, no text overlays, no watermarks.`;

      const imgResponse = await imagenAI.models.generateImages({
        model: "gemini-3.1-flash-image-preview",
        prompt: coverPrompt,
        config: { numberOfImages: 1, aspectRatio: "16:9", outputMimeType: "image/jpeg" },
      });

      const img = imgResponse.generatedImages?.[0]?.image;
      if (img?.imageBytes) {
        const binaryStr = atob(img.imageBytes as unknown as string);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

        const coverPath = `${post_id}/cover-${Date.now()}.jpg`;
        const { error: uploadErr } = await admin.storage
          .from("covers")
          .upload(coverPath, bytes.buffer, { contentType: "image/jpeg", upsert: true });

        if (!uploadErr) {
          await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", post_id);
          const { data: urlData } = admin.storage.from("covers").getPublicUrl(coverPath);
          coverPublicUrl = urlData.publicUrl;
        }
      }
    } catch (coverErr) {
      console.warn("[generate] Auto-cover failed (non-fatal):", coverErr);
    }

    return NextResponse.json({ success: true, data: generated, coverPublicUrl, seoScore: generated.seo_score ?? null });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (runId) await admin.from("agent_runs").update({ status: "failed", error: msg }).eq("id", runId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
