/**
 * Orchestrates the review-revise loop to achieve 90+ SEO/AEO/GEO scores.
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";
import { restoreInternalLinks } from "./internal-link";
import { scorePost, seoScoreAverage, type ScoredContent, type SeoScoreResult } from "./score-post";
import { reviewPostFor90 } from "./seo-reviewer";
import { revisePost } from "./post-reviser";
import { clampMetaDescription, clampSeoTitle } from "./clamp-seo-fields";

const TARGET_MIN = 90; // Rounded average of SEO, AEO, GEO (matches publish gate and UI “avg”)
/** Each iteration = one review + revise + rescore. 3 was often too few for GEO/AEO gaps. */
const MAX_ITERATIONS = 5;

export type ImprovedResult = {
  content: ScoredContent;
  score: SeoScoreResult;
  iterations: number;
};

export type ImprovePostTo90Options = {
  /** Embedding-ordered general + client instructions for score / review / revise agents. */
  systemInstruction?: string;
};

/** Score, then review-revise until 90+ or max iterations. */
export async function improvePostTo90(
  genAI: GoogleGenerativeAI,
  modelName: string,
  initialContent: ScoredContent,
  /** Fallback when scoring fails (e.g. generator's self-assessed score). */
  fallbackScore?: SeoScoreResult | null,
  options?: ImprovePostTo90Options
): Promise<ImprovedResult> {
  let content = {
    ...initialContent,
    seo_title: clampSeoTitle(initialContent.seo_title),
    seo_description: clampMetaDescription(initialContent.seo_description),
  };
  const agentOpts = options?.systemInstruction
    ? { systemInstruction: options.systemInstruction }
    : undefined;
  let score = await scorePost(genAI, modelName, content, agentOpts);
  let iterations = 0;

  if (!score) {
    const useScore = fallbackScore ?? { seo: 75, aeo: 75, geo: 75, notes: "Scoring unavailable; using fallback" };
    return { content, score: useScore, iterations: 0 };
  }

  while (iterations < MAX_ITERATIONS) {
    if (seoScoreAverage(score) >= TARGET_MIN) break;

    let review = await reviewPostFor90(genAI, modelName, content, score, agentOpts);
    let improvements = review?.improvements?.filter((s) => s.trim()) ?? [];
    // Reviewer sometimes returns empty JSON improvements while scores stay <90 — use scorer notes as a fallback directive.
    if (improvements.length === 0 && score.notes?.trim()) {
      improvements = [
        `Apply targeted fixes for the lowest-scoring dimension(s). Scorer said: ${score.notes.trim()}`,
      ];
      review = { improvements };
    }
    if (improvements.length === 0) break;

    const revised = await revisePost(genAI, modelName, content, { improvements }, agentOpts);
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

    const newScore = await scorePost(genAI, modelName, content, agentOpts);
    if (!newScore) break;

    score = newScore;
    iterations++;
  }

  const avg = seoScoreAverage(score);
  if (avg < TARGET_MIN) {
    console.warn("[improve-to-90] Stopped before 90+ average:", {
      seo: score.seo,
      aeo: score.aeo,
      geo: score.geo,
      avg,
      iterations,
      notes: score.notes?.slice(0, 200),
    });
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
