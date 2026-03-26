/**
 * SEO/AEO/GEO reviewer agent: analyzes post, identifies gaps, outputs actionable
 * improvements needed to reach 90+ on each dimension.
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";
import { seoScoreAverage, type ScoredContent, type SeoScoreResult } from "./score-post";

export type ReviewerOutput = {
  improvements: string[];
};

const REVIEWER_SYSTEM = `You are an expert SEO, AEO, and GEO editor. Output SPECIFIC, actionable improvements so the rounded average of SEO, AEO, and GEO scores reaches 90+ (that average is required to publish). Lift the lowest-scoring dimension(s) first — they drag the average down most.

**SEO 90+ needs:** Keyword in title, intro, 2+ H2s, seo_title, meta. 5-8 variants.
**AEO 90+ needs:** Data-backed core argument in intro. Definition "**Term** is...". 2+ H2s as questions with direct 40-60w answers. 5 FAQs. **Bold** claims. Named sources.
**GEO 90+ needs:** 3+ stats as "According to [Source] (Year), X%". 5+ named entities. 2+ date-anchored facts. ZERO vague attributions.

Each improvement must be EXACTLY editable — the reviser will apply it verbatim:
- BAD: "Improve GEO"
- GOOD: "In paragraph 2, replace 'studies show that' with: According to Gartner (2025), "
- BAD: "Add definition"
- GOOD: "In intro, add after first sentence: **Intent scoring** is a method that ranks leads by buyer behaviour signals."
- GOOD: "Add focus keyword 'email automation' to the H2 'Best practices' → 'Best email automation practices'"

Output ONLY valid JSON: { "improvements": ["...", "...", ...] }
6-10 improvements. Prioritize the LOWEST-scoring dimension first. Be specific: exact phrase to add, exact location, exact format.`;

export type ReviewPostOptions = {
  systemInstruction?: string;
};

export async function reviewPostFor90(
  genAI: GoogleGenerativeAI,
  modelName: string,
  content: ScoredContent,
  currentScore: SeoScoreResult,
  options?: ReviewPostOptions
): Promise<ReviewerOutput | null> {
  const avg = seoScoreAverage(currentScore);
  const userMessage = `This blog post scored SEO ${currentScore.seo}, AEO ${currentScore.aeo}, GEO ${currentScore.geo} (rounded avg ${avg}). Goal: bring that average to 90+ by fixing gaps — prioritize the weakest dimension(s).

TITLE: ${content.title}
SEO TITLE: ${content.seo_title}
SEO DESCRIPTION: ${content.seo_description}
FOCUS KEYWORD: ${content.focus_keyword}
SCORER NOTES: ${currentScore.notes}

CONTENT (markdown):
${content.content_md}

FAQs: ${content.faq_blocks.length} questions

List SPECIFIC improvements so the rounded average of the three scores reaches 90+. The dimension scoring LOWEST needs the most fixes — prioritize those first. Each item must be copy-paste actionable: exact text to add, exact location, exact replacement.

Output ONLY this JSON:
{ "improvements": ["...", "...", ...] }`;

  const prompt = options?.systemInstruction
    ? userMessage
    : `${REVIEWER_SYSTEM}

${userMessage}`;

  try {
    const model = genAI.getGenerativeModel(
      options?.systemInstruction
        ? {
            model: modelName,
            systemInstruction: `${options.systemInstruction}

---
${REVIEWER_SYSTEM}`,
          }
        : { model: modelName }
    );
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(clean) as { improvements?: string[] };
    const improvements = Array.isArray(parsed.improvements)
      ? parsed.improvements.filter((s): s is string => typeof s === "string").slice(0, 10)
      : [];
    return { improvements };
  } catch {
    return null;
  }
}
