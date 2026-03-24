import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { getSystemInstructions, buildPrompt, type ClientContext, type PostContext } from "@/lib/agent/instructions";
import { buildCoverPrompt } from "@/lib/agent/cover-prompt";
import { resolveClientBrandColors } from "@/lib/agent/resolve-client-brand-colors";
import { improvePostTo90 } from "@/lib/agent/improve-to-90";
import { appendAuthorBlock, sanitizeInternalMarkdownLinks, convertInternalLinksToRelative } from "@/lib/agent/internal-link";
import { getCandidateSiteUrls, enrichWithTitles } from "@/lib/agent/site-urls";
import type { Locale } from "@/lib/types/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const imagenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-3.1-flash-lite-preview";

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

  // Fetch client context (domain, brand book, manual brand info, custom_instructions)
  const { data: clientRow } = await admin
    .from("clients")
    .select("domain, google_access_token, google_scope, brand_book, company_name, logo_url, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, brand_name, brand_tone, custom_instructions")
    .eq("user_id", post.author_id)
    .maybeSingle();

  const rawBookForColors = clientRow?.brand_book as
    | import("@/lib/brand-book/types").BrandBook
    | null
    | undefined;
  const resolvedBrandColors = resolveClientBrandColors({
    domain: clientRow?.domain ?? "",
    primary_color: clientRow?.primary_color,
    secondary_color: clientRow?.secondary_color,
    tertiary_color: clientRow?.tertiary_color,
    alternative_color: clientRow?.alternative_color,
    colorPaletteText: rawBookForColors?.visualIdentity?.colorPalette ?? null,
  });
  const brandDisplayName =
    clientRow?.company_name?.trim() ||
    clientRow?.brand_name?.trim() ||
    rawBookForColors?.brandName?.trim() ||
    null;
  const manualBrand = brandDisplayName
    ? {
        companyName: brandDisplayName,
        logoUrl: clientRow?.logo_url ?? null,
        primaryColor: resolvedBrandColors.primaryColor,
        secondaryColor: resolvedBrandColors.secondaryColor,
        tertiaryColor: resolvedBrandColors.tertiaryColor,
        alternativeColor: resolvedBrandColors.alternativeColor,
        fontStyle: clientRow?.font_style ?? "modern",
        brandVoice: clientRow?.brand_voice ?? "professional",
      }
    : null;

  const rawUrls = clientRow?.domain ? await getCandidateSiteUrls(clientRow.domain) : [];
  const internalLinkCandidates =
    rawUrls.length > 0 ? await enrichWithTitles(rawUrls, 35) : [];
  const clientCtx: ClientContext = {
    domain: clientRow?.domain ?? null,
    brandName: clientRow?.company_name ?? clientRow?.brand_name ?? null,
    brandTone: clientRow?.brand_voice ?? clientRow?.brand_tone ?? null,
    brandBook: clientRow?.brand_book ?? null,
    manualBrand,
    websiteSummary: null,
    industry: (clientRow?.brand_book as { industry?: string } | null)?.industry ?? null,
    gaTopPages: null,
    gaTopKeywords: null,
    searchConsoleQueries: null,
    internalLinkCandidates: internalLinkCandidates.length > 0 ? internalLinkCandidates : null,
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
      systemInstruction: getSystemInstructions(clientRow?.custom_instructions ?? null),
    });

    const prompt = buildPrompt(postCtx, clientCtx, { hasCustomInstructions: !!clientRow?.custom_instructions });
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
      cover_image_description?: string | null;
      cover_image_headline?: string | null;
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

    generated.content_md = sanitizeInternalMarkdownLinks(
      generated.content_md,
      internalLinkCandidates.map((c) => c.url)
    );
    if (clientRow?.domain) {
      generated.content_md = convertInternalLinksToRelative(generated.content_md, clientRow.domain);
    }

    // Post-generation: score, review, and revise until 90+ (max 3 iterations)
    const { content: improvedContent, score: seoScoreToSave } = await improvePostTo90(
      genAI,
      MODEL,
      {
        title: generated.title,
        content_md: generated.content_md,
        seo_title: generated.seo_title,
        seo_description: generated.seo_description,
        focus_keyword: generated.focus_keyword,
        faq_blocks: generated.faq_blocks,
      },
      generated.seo_score ?? undefined
    );
    generated.content_md = improvedContent.content_md;
    if (improvedContent.title) generated.title = improvedContent.title;
    if (improvedContent.seo_title) generated.seo_title = improvedContent.seo_title;
    if (improvedContent.seo_description) generated.seo_description = improvedContent.seo_description;
    if (improvedContent.faq_blocks) generated.faq_blocks = improvedContent.faq_blocks;

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

    const { data: authorProfile } = await admin
      .from("profiles")
      .select("display_name, job_title, bio, avatar_url")
      .eq("id", post.author_id)
      .maybeSingle();
    const authorForBlock = authorProfile
      ? { displayName: authorProfile.display_name ?? null, jobTitle: authorProfile.job_title ?? null, bio: authorProfile.bio ?? null, avatarUrl: authorProfile.avatar_url ?? null }
      : null;

    const contentMdOut = appendAuthorBlock(generated.content_md, locale as Locale, authorForBlock);

    // Save to DB
    const { error: upsertError } = await admin
      .from("post_localizations")
      .upsert(
        {
          post_id,
          locale,
          title: generated.title,
          excerpt: generated.excerpt,
          content_md: contentMdOut,
          seo_title: generated.seo_title,
          seo_description: generated.seo_description,
          focus_keyword: generated.focus_keyword,
          faq_blocks: generated.faq_blocks,
          jsonld,
          seo_score: seoScoreToSave,
        },
        { onConflict: "post_id,locale" }
      );

    if (upsertError) {
      if (runId) await admin.from("agent_runs").update({ status: "failed", error: upsertError.message }).eq("id", runId);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    if (runId) await admin.from("agent_runs").update({ status: "done", output: { ...generated, content_md: contentMdOut, seo_score: seoScoreToSave } }).eq("id", runId);

    // ── Auto-generate cover image: graphic illustration (not photography), using brand book colours/font/voice
    let coverPublicUrl: string | null = null;
    try {
      const coverSubject = generated.cover_image_description
        ? generated.cover_image_description
        : `Editorial illustration for "${generated.focus_keyword}": rich, topic-specific visuals; distinctive composition.`;
      const headlineForCover =
        generated.cover_image_headline ??
        generated.title.trim().split(/\s+/).slice(0, 4).join(" ");
      const rawBook = clientCtx.brandBook;
      const bb = typeof rawBook === "string" ? (() => { try { return JSON.parse(rawBook) as { visualIdentity?: { aestheticStyle?: string; imageStyle?: string; colorPalette?: string } }; } catch { return null; } })() : rawBook;
      const visualIdentity = bb?.visualIdentity ?? null;
      const brandStyle = {
        primaryColor: resolvedBrandColors.primaryColor,
        secondaryColor: resolvedBrandColors.secondaryColor,
        tertiaryColor: resolvedBrandColors.tertiaryColor,
        alternativeColor: resolvedBrandColors.alternativeColor,
        fontStyle: clientRow?.font_style ?? "modern",
        brandVoice: clientRow?.brand_voice ?? "professional",
      };
      const coverPrompt = buildCoverPrompt(
        coverSubject,
        headlineForCover,
        brandStyle,
        visualIdentity ? {
          colorPalette: visualIdentity.colorPalette,
          aestheticStyle: visualIdentity.aestheticStyle,
          imageStyle: visualIdentity.imageStyle,
        } : null
      );

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
          const coverPath = `${post_id}/cover-${Date.now()}.jpg`;
          const { error: uploadErr } = await admin.storage
            .from("covers")
            .upload(coverPath, buffer, { contentType: "image/jpeg", upsert: true });

          if (!uploadErr) {
            await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", post_id);
            const { data: urlData } = admin.storage.from("covers").getPublicUrl(coverPath);
            coverPublicUrl = urlData.publicUrl;
          }
          break;
        }
      }
    } catch (coverErr) {
      console.warn("[generate] Auto-cover failed (non-fatal):", coverErr);
    }

    return NextResponse.json({
      success: true,
      data: { ...generated, content_md: contentMdOut },
      coverPublicUrl,
      seoScore: seoScoreToSave,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (runId) await admin.from("agent_runs").update({ status: "failed", error: msg }).eq("id", runId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
