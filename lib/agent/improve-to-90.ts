/**
 * Orchestrates the review-revise loop to achieve 90+ SEO/AEO/GEO scores.
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";
import { restoreInternalLinks } from "./internal-link";
import { scorePost, type ScoredContent, type SeoScoreResult } from "./score-post";
import { reviewPostFor90 } from "./seo-reviewer";
import { revisePost } from "./post-reviser";
import { clampMetaDescription, clampSeoTitle } from "./clamp-seo-fields";

const TARGET_MIN = 90; // All three (SEO, AEO, GEO) must be >= 90
const MAX_ITERATIONS = 3;

export type ImprovedResult = {
  content: ScoredContent;
  score: SeoScoreResult;
  iterations: number;
};

/** Score, then review-revise until 90+ or max iterations. */
export async function improvePostTo90(
  genAI: GoogleGenerativeAI,
  modelName: string,
  initialContent: ScoredContent,
  /** Fallback when scoring fails (e.g. generator's self-assessed score). */
  fallbackScore?: SeoScoreResult | null
): Promise<ImprovedResult> {
  let content = {
    ...initialContent,
    seo_title: clampSeoTitle(initialContent.seo_title),
    seo_description: clampMetaDescription(initialContent.seo_description),
  };
  let score = await scorePost(genAI, modelName, content);
  let iterations = 0;

  if (!score) {
    const useScore = fallbackScore ?? { seo: 75, aeo: 75, geo: 75, notes: "Scoring unavailable; using fallback" };
    return { content, score: useScore, iterations: 0 };
  }

  while (iterations < MAX_ITERATIONS) {
    const allMet = score.seo >= TARGET_MIN && score.aeo >= TARGET_MIN && score.geo >= TARGET_MIN;
    if (allMet) break;

    const review = await reviewPostFor90(genAI, modelName, content, score);
    if (!review?.improvements?.length) break;

    const revised = await revisePost(genAI, modelName, content, review);
    if (!revised) break;

    // Restore any links the reviser corrupted to "/" or homepage
    const restoredMd = restoreInternalLinks(revised.content_md, content.content_md);

    content = {
      ...content,
      content_md: restoredMd,
      ...(revised.title != null && { title: revised.title }),
      ...(revised.seo_title != null && { seo_title: clampSeoTitle(revised.seo_title) }),
      ...(revised.seo_description != null && { seo_description: clampMetaDescription(revised.seo_description) }),
      ...(revised.faq_blocks != null && { faq_blocks: revised.faq_blocks }),
    };

    const newScore = await scorePost(genAI, modelName, content);
    if (!newScore) break;

    score = newScore;
    iterations++;
  }

  return {
    content: {
      ...content,
      seo_title: clampSeoTitle(content.seo_title),
      seo_description: clampMetaDescription(content.seo_description),
    },
    score,
    iterations,
  };
}
