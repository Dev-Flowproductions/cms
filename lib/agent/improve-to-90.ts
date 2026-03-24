/**
 * Orchestrates the review-revise loop to achieve 90+ SEO/AEO/GEO scores.
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";
import { restoreInternalLinks } from "./internal-link";
import { scorePost, type ScoredContent, type SeoScoreResult } from "./score-post";
import { reviewPostFor90 } from "./seo-reviewer";
import { revisePost } from "./post-reviser";

const TARGET_AVG = 90;
const MAX_ITERATIONS = 2;

export type ImprovedResult = {
  content: ScoredContent;
  score: SeoScoreResult;
  iterations: number;
};

/** Score, then review-revise until 90+ or max iterations. */
export async function improvePostTo90(
  genAI: GoogleGenerativeAI,
  modelName: string,
  initialContent: ScoredContent
): Promise<ImprovedResult> {
  let content = { ...initialContent };
  let score = await scorePost(genAI, modelName, content);
  let iterations = 0;

  if (!score) {
    return { content, score: { seo: 0, aeo: 0, geo: 0, notes: "Scoring failed" }, iterations: 0 };
  }

  while (iterations < MAX_ITERATIONS) {
    const avg = (score.seo + score.aeo + score.geo) / 3;
    if (avg >= TARGET_AVG) break;

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
      ...(revised.seo_title != null && { seo_title: revised.seo_title }),
      ...(revised.seo_description != null && { seo_description: revised.seo_description }),
      ...(revised.faq_blocks != null && { faq_blocks: revised.faq_blocks }),
    };

    const newScore = await scorePost(genAI, modelName, content);
    if (!newScore) break;

    score = newScore;
    iterations++;
  }

  return { content, score, iterations };
}
