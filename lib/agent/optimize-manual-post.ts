import { createAdminClient } from "@/lib/supabase/admin";
import { bindAiUsageContext } from "@/lib/agent/token-usage";
import { createAgentLlmBundle } from "@/lib/agent/text-llm";
import { improvePostTo90 } from "@/lib/agent/improve-to-90";
import {
  combineClientInstructionsForModel,
  resolvePostSystemInstructions,
} from "@/lib/agent/instructions";
import { normalizeFaqHeading } from "@/lib/agent/faq-heading";
import { clampMetaDescription, clampSeoTitle } from "@/lib/agent/clamp-seo-fields";
import { seoScoreMeetsPublishBar, type SeoScoreResult } from "@/lib/agent/score-post";
import {
  enrichWithTitles,
  expandEnrichedUrlsWithLocaleSiblings,
  getCandidateSiteUrls,
  narrowInternalLinksForLocale,
} from "@/lib/agent/site-urls";
import type { Locale } from "@/lib/types/db";

export type OptimizeManualPostInput = {
  postId: string;
  locale: Locale;
  title: string;
  content_md: string;
};

export type OptimizeManualPostResult =
  | {
      ok: true;
      title: string;
      content_md: string;
      seo_title: string;
      seo_description: string;
      focus_keyword: string;
      faq_blocks: Array<{ question: string; answer: string }>;
      seo_score: SeoScoreResult;
      meets_publish_bar: boolean;
    }
  | { ok: false; error: string; statusCode?: number };

function deriveExcerpt(contentMd: string): string {
  const plain = contentMd
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim()
    .split(/\n/)
    .find((line) => line.trim().length > 0);
  return plain?.slice(0, 160) ?? "";
}

export async function optimizeManualPost(input: OptimizeManualPostInput): Promise<OptimizeManualPostResult> {
  const { postId, locale } = input;
  const title = input.title.trim();
  const content_md = input.content_md.trim();

  if (!title && !content_md) {
    return { ok: false, error: "Add a title or content before optimizing.", statusCode: 400 };
  }
  if (content_md.length < 80) {
    return { ok: false, error: "Write more content before running SEO optimization.", statusCode: 400 };
  }

  const admin = createAdminClient();
  const { data: post, error: postError } = await admin
    .from("posts")
    .select("id, slug, author_id, content_type, primary_locale")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return { ok: false, error: "Post not found", statusCode: 404 };
  }

  const { data: existing } = await admin
    .from("post_localizations")
    .select("title, excerpt, content_md, seo_title, seo_description, focus_keyword, faq_blocks")
    .eq("post_id", postId)
    .eq("locale", locale)
    .maybeSingle();

  const resolvedTitle = title || existing?.title?.trim() || "Untitled";
  const keyword =
    existing?.focus_keyword?.trim() ||
    post.slug.replace(/-/g, " ").trim() ||
    resolvedTitle.split(/\s+/).slice(0, 4).join(" ");

  const { data: clientRow } = await admin
    .from("clients")
    .select("id, domain, custom_instructions, instruction_reinforcement, company_name, brand_name")
    .eq("user_id", post.author_id)
    .maybeSingle();

  bindAiUsageContext({
    userId: post.author_id,
    clientId: clientRow?.id ?? null,
    postId,
  });

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

  let llm: ReturnType<typeof createAgentLlmBundle>;
  try {
    llm = createAgentLlmBundle();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "LLM not configured";
    return { ok: false, error: msg, statusCode: 503 };
  }

  const qualitySystemInstruction = await resolvePostSystemInstructions(
    llm.embeddings,
    combinedInstructions,
    {
      contentType: post.content_type ?? "hero",
      locale,
      focusKeywordOrTopic: keyword,
      hasInternalLinks: internalLinkCandidates.length > 0,
      taskKind: "quality_loop",
    },
  );

  const seoTitle =
    existing?.seo_title?.trim() || clampSeoTitle(resolvedTitle);
  const seoDescription =
    existing?.seo_description?.trim() ||
    clampMetaDescription(existing?.excerpt?.trim() || deriveExcerpt(content_md));

  const faqBlocks = Array.isArray(existing?.faq_blocks)
    ? (existing.faq_blocks as Array<{ question: string; answer: string }>)
    : [];

  const { content: improvedContent, score: seoScoreToSave } = await improvePostTo90(
    llm.text,
    {
      title: resolvedTitle,
      content_md,
      seo_title: seoTitle,
      seo_description: seoDescription,
      focus_keyword: keyword,
      faq_blocks: faqBlocks,
    },
    undefined,
    { systemInstruction: qualitySystemInstruction },
  );

  const contentMdOut = normalizeFaqHeading(improvedContent.content_md, locale);
  const finalTitle = improvedContent.title?.trim() || resolvedTitle;
  const finalSeoTitle = improvedContent.seo_title?.trim() || seoTitle;
  const finalSeoDescription = improvedContent.seo_description?.trim() || seoDescription;
  const finalFaqBlocks = improvedContent.faq_blocks ?? faqBlocks;
  const excerpt = deriveExcerpt(contentMdOut);

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
    headline: finalTitle,
    description: finalSeoDescription,
    keywords: keyword,
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
    finalFaqBlocks.length > 0
      ? {
          "@type": "FAQPage",
          mainEntity: finalFaqBlocks.map((f) => ({
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

  const { error: upsertError } = await admin.from("post_localizations").upsert(
    {
      post_id: postId,
      locale,
      title: finalTitle,
      excerpt,
      content_md: contentMdOut,
      seo_title: finalSeoTitle,
      seo_description: finalSeoDescription,
      focus_keyword: keyword,
      faq_blocks: finalFaqBlocks,
      jsonld,
      seo_score: seoScoreToSave,
    },
    { onConflict: "post_id,locale" },
  );

  if (upsertError) {
    return { ok: false, error: upsertError.message, statusCode: 500 };
  }

  if (post.primary_locale !== locale) {
    await admin.from("posts").update({ primary_locale: locale }).eq("id", postId);
  }

  return {
    ok: true,
    title: finalTitle,
    content_md: contentMdOut,
    seo_title: finalSeoTitle,
    seo_description: finalSeoDescription,
    focus_keyword: keyword,
    faq_blocks: finalFaqBlocks,
    seo_score: seoScoreToSave,
    meets_publish_bar: seoScoreMeetsPublishBar(seoScoreToSave),
  };
}
