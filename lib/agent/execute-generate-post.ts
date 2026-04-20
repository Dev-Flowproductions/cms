import { createAdminClient } from "@/lib/supabase/admin";
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
import { improvePostTo90 } from "@/lib/agent/improve-to-90";
import { appendAuthorBlock, sanitizeInternalMarkdownLinks, convertInternalLinksToRelative } from "@/lib/agent/internal-link";
import {
  getCandidateSiteUrls,
  enrichWithTitles,
  expandEnrichedUrlsWithLocaleSiblings,
  narrowInternalLinksForLocale,
} from "@/lib/agent/site-urls";
import { resolveAuthorForByline } from "@/lib/data/blog-authors";
import { notifyDgArticleStatusIfLinked } from "@/lib/integrations/dg/notify";
import type { Locale } from "@/lib/types/db";
import type { BrandBook } from "@/lib/brand-book/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const imagenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-3.1-flash-lite-preview";

export type ExecuteGenerateSuccess = {
  ok: true;
  data: {
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
  coverPublicUrl: string | null;
  seoScore: { seo: number; aeo: number; geo: number; notes?: string } | undefined;
};

export type ExecuteGenerateFailure = {
  ok: false;
  error: string;
  statusCode?: number;
};

export type ExecuteGenerateResult = ExecuteGenerateSuccess | ExecuteGenerateFailure;

/**
 * Core of POST /api/agent/generate — usable from the HTTP route and from background jobs (e.g. DG briefs).
 * When {@link input.dgBrief} is true, sets post status to `draft` on success and notifies DG (`drafting` canonical).
 */
export async function executeAgentGeneratePost(input: {
  postId: string;
  locale: Locale;
  focusKeyword?: string | null;
  /** When true, advance post out of `idea` and notify DG after successful generation. */
  dgBrief?: boolean;
}): Promise<ExecuteGenerateResult> {
  const { postId, locale, dgBrief } = input;
  const focus_keyword = input.focusKeyword;

  const admin = createAdminClient();

  const { data: post } = await admin
    .from("posts")
    .select("slug, content_type, primary_locale, author_id, byline_author_id")
    .eq("id", postId)
    .single();
  if (!post) {
    return { ok: false, error: "Post not found", statusCode: 404 };
  }

  const { data: existing } = await admin
    .from("post_localizations")
    .select("title, excerpt, content_md, seo_title, seo_description, focus_keyword")
    .eq("post_id", postId)
    .eq("locale", locale)
    .maybeSingle();

  const keyword = focus_keyword ?? existing?.focus_keyword ?? post.slug.replace(/-/g, " ");

  const { data: clientRow } = await admin
    .from("clients")
    .select(
      "domain, google_access_token, google_scope, brand_book, company_name, logo_url, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, brand_name, brand_tone, custom_instructions, instruction_reinforcement, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_text",
    )
    .eq("user_id", post.author_id)
    .maybeSingle();

  const rawBookForColors = clientRow?.brand_book as BrandBook | null | undefined;
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
  const enrichedBase = rawUrls.length > 0 ? await enrichWithTitles(rawUrls, 35) : [];
  const internalLinkCandidates = narrowInternalLinksForLocale(
    expandEnrichedUrlsWithLocaleSiblings(enrichedBase),
    locale,
  );
  const combinedInstructions = combineClientInstructionsForModel(
    clientRow?.custom_instructions,
    clientRow?.instruction_reinforcement,
  );

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

  const publicationDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
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

  const { data: run } = await admin
    .from("agent_runs")
    .insert({
      post_id: postId,
      locale,
      status: "running",
      model: MODEL,
      input: { postCtx, clientCtx },
    })
    .select("id")
    .single();
  const runId = run?.id;

  try {
    const systemInstruction = await resolveSystemInstructionsWithEmbeddings(
      genAI,
      combinedInstructions,
      {
        contentType: post.content_type,
        locale,
        focusKeywordOrTopic: keyword,
        hasInternalLinks: internalLinkCandidates.length > 0,
        taskKind: "post_generation",
      },
    );

    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction,
    });

    const prompt = buildPrompt(postCtx, clientCtx, { hasCustomInstructions: !!combinedInstructions });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

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
      if (runId) {
        await admin
          .from("agent_runs")
          .update({ status: "failed", error: "Invalid JSON from Gemini", output: { raw: text } })
          .eq("id", runId);
      }
      return { ok: false, error: "Gemini returned invalid JSON. Try again." };
    }

    generated.content_md = sanitizeInternalMarkdownLinks(
      generated.content_md,
      internalLinkCandidates.map((c) => c.url),
    );
    if (clientRow?.domain) {
      generated.content_md = convertInternalLinksToRelative(generated.content_md, clientRow.domain);
    }

    const qualitySystemInstruction = await resolveSystemInstructionsWithEmbeddings(
      genAI,
      combinedInstructions,
      {
        contentType: post.content_type,
        locale,
        focusKeywordOrTopic: keyword,
        hasInternalLinks: internalLinkCandidates.length > 0,
        taskKind: "quality_loop",
      },
    );

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
      generated.seo_score ?? undefined,
      { systemInstruction: qualitySystemInstruction },
    );
    generated.content_md = improvedContent.content_md;
    if (improvedContent.title) generated.title = improvedContent.title;
    if (improvedContent.seo_title) generated.seo_title = improvedContent.seo_title;
    if (improvedContent.seo_description) generated.seo_description = improvedContent.seo_description;
    if (improvedContent.faq_blocks) generated.faq_blocks = improvedContent.faq_blocks;

    const publisherEntity = {
      "@type": "Organization",
      name: "Witflow",
      url: clientRow?.domain ? `https://${clientRow.domain}` : "https://witflow.co",
      logo: {
        "@type": "ImageObject",
        url: "https://witflow.co/logo.png",
      },
    };

    const articleEntity = {
      "@type": "BlogPosting",
      headline: generated.title,
      description: generated.seo_description,
      keywords: generated.focus_keyword,
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      inLanguage: locale,
      author: publisherEntity,
      publisher: publisherEntity,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", ".intro"],
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": clientRow?.domain
          ? `https://${clientRow.domain}/blog/${post.slug}`
          : `https://witflow.co/blog/${post.slug}`,
      },
    };

    const faqEntity =
      generated.faq_blocks?.length > 0
        ? {
            "@type": "FAQPage",
            mainEntity: generated.faq_blocks.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }
        : null;

    const jsonld = {
      "@context": "https://schema.org",
      "@graph": [articleEntity, ...(faqEntity ? [faqEntity] : [])],
    };

    const authorForBlock = await resolveAuthorForByline(
      admin,
      post.author_id,
      (post as { byline_author_id?: string | null }).byline_author_id ?? null,
    );

    const contentMdOut = appendAuthorBlock(generated.content_md, locale, authorForBlock);

    const { error: upsertError } = await admin
      .from("post_localizations")
      .upsert(
        {
          post_id: postId,
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
        { onConflict: "post_id,locale" },
      );

    if (upsertError) {
      if (runId) {
        await admin.from("agent_runs").update({ status: "failed", error: upsertError.message }).eq("id", runId);
      }
      return { ok: false, error: upsertError.message };
    }

    if (runId) {
      await admin
        .from("agent_runs")
        .update({
          status: "done",
          output: { ...generated, content_md: contentMdOut, seo_score: seoScoreToSave },
        })
        .eq("id", runId);
    }

    let coverPublicUrl: string | null = null;
    try {
      const coverSubjectRaw = generated.cover_image_description
        ? generated.cover_image_description
        : `Editorial illustration for "${generated.focus_keyword}": rich, topic-specific visuals; distinctive composition.`;
      const coverSubject = truncateCoverImageSubject(coverSubjectRaw);
      const headlineForCover =
        generated.cover_image_headline ?? generated.title.trim().split(/\s+/).slice(0, 4).join(" ");
      const coverHeadlineIsEnglishOnly = Boolean(generated.cover_image_headline?.trim());
      const rawBook = clientCtx.brandBook;
      const bb =
        typeof rawBook === "string"
          ? (() => {
              try {
                return JSON.parse(rawBook) as {
                  visualIdentity?: { aestheticStyle?: string; imageStyle?: string; colorPalette?: string };
                };
              } catch {
                return null;
              }
            })()
          : rawBook;
      const visualIdentity = bb?.visualIdentity ?? null;
      const brandStyle = {
        primaryColor: resolvedBrandColors.primaryColor,
        secondaryColor: resolvedBrandColors.secondaryColor,
        tertiaryColor: resolvedBrandColors.tertiaryColor,
        alternativeColor: resolvedBrandColors.alternativeColor,
        fontStyle: clientRow?.font_style ?? "modern",
        brandVoice: clientRow?.brand_voice ?? "professional",
      };
      const refParts = await loadCoverReferenceImageParts(admin, [
        clientRow?.cover_reference_image_1,
        clientRow?.cover_reference_image_2,
        clientRow?.cover_reference_image_3,
      ]);
      let referenceVisionBrief: string | null = null;
      if (refParts.length > 0) {
        referenceVisionBrief = await requireCoverReferenceVisionBrief(genAI, refParts, "[generate] ref-vision");
      }
      const { prefix: coverEmbedPrefix } = await buildCoverInstructionEmbeddingPrefixWithMeta(
        genAI,
        {
          focusKeywordOrTopic: generated.focus_keyword || keyword,
          contentType: post.content_type,
          locale,
          hasInternalLinks: internalLinkCandidates.length > 0,
        },
        combinedInstructions,
        referenceVisionBrief,
      );
      const baseCoverPrompt = buildCoverPrompt(
        coverSubject,
        headlineForCover,
        brandStyle,
        visualIdentity
          ? {
              colorPalette: visualIdentity.colorPalette,
              aestheticStyle: visualIdentity.aestheticStyle,
              imageStyle: visualIdentity.imageStyle,
            }
          : null,
        { headlineMayBeNonEnglish: !coverHeadlineIsEnglishOnly },
      );

      const buffer = await generateCoverImageBufferWithEmbedFallback(imagenAI, {
        embedPrefix: coverEmbedPrefix,
        basePrompt: baseCoverPrompt,
        logLabel: "[generate] auto-cover",
        referenceImages: refParts.length ? refParts : undefined,
        referenceVisionBrief,
        guidelinesText: clientRow?.brand_guidelines_text ?? null,
        enforcePrimaryInstructionEmbedding: true,
      });

      if (buffer) {
        const coverPath = `${postId}/cover-${Date.now()}.jpg`;
        const { error: uploadErr } = await admin.storage
          .from("covers")
          .upload(coverPath, buffer, { contentType: "image/jpeg", upsert: true });

        if (!uploadErr) {
          await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", postId);
          const { data: urlData } = admin.storage.from("covers").getPublicUrl(coverPath);
          coverPublicUrl = urlData.publicUrl;
        } else {
          console.warn("[generate] Auto-cover upload failed (non-fatal):", uploadErr.message);
        }
      }
    } catch (coverErr) {
      console.warn("[generate] Auto-cover failed (non-fatal):", coverErr);
    }

    if (dgBrief) {
      await admin.from("posts").update({ status: "draft" }).eq("id", postId);
      void notifyDgArticleStatusIfLinked(postId);
    }

    return {
      ok: true,
      data: { ...generated, content_md: contentMdOut },
      coverPublicUrl,
      seoScore: seoScoreToSave,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (runId) {
      await admin.from("agent_runs").update({ status: "failed", error: msg }).eq("id", runId);
    }
    return { ok: false, error: msg };
  }
}
