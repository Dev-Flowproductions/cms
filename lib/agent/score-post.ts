/**
 * Post-generation SEO scoring: evaluate the actual content with a separate LLM call.
 * Prevents default scores (e.g. 85) by making the model read and critique the post.
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";

export type SeoScoreResult = {
  seo: number;
  aeo: number;
  geo: number;
  notes: string;
};

export type ScoredContent = {
  title: string;
  content_md: string;
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  faq_blocks: Array<{ question: string; answer: string }>;
};

const SCORE_SYSTEM = `You are an SEO editor. You score blog posts (0-100) for SEO, AEO, and GEO.
- SEO: keyword in title, intro, H2s, seo_title, meta? 5-8 variants? Sentence case?
- AEO: core argument, definition block, FAQs, bold claims, EEAT signals?
- GEO: 3+ attributed stats? 5+ named entities? Date-anchored facts?
Be CRITICAL. Do NOT default to 85 or 90. Scores must reflect real gaps. Typical range 55-88. Only 90+ when exceptional.
Output ONLY valid JSON: { "seo": number, "aeo": number, "geo": number, "notes": "1 sentence with specific gaps or strengths" }`;

export async function scorePost(
  genAI: GoogleGenerativeAI,
  modelName: string,
  content: ScoredContent
): Promise<SeoScoreResult | null> {
  const prompt = `${SCORE_SYSTEM}

Evaluate this blog post and output a JSON score object. Read the content carefully — do not guess. Do NOT default to 85.

TITLE: ${content.title}
SEO TITLE: ${content.seo_title}
SEO DESCRIPTION: ${content.seo_description}
FOCUS KEYWORD: ${content.focus_keyword}

CONTENT (markdown):
${content.content_md}

FAQs: ${content.faq_blocks.length} questions

Output ONLY this JSON, nothing else:
{ "seo": <0-100>, "aeo": <0-100>, "geo": <0-100>, "notes": "<1 sentence>" }`;

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(clean) as { seo?: number; aeo?: number; geo?: number; notes?: string };
    const seo = Math.min(100, Math.max(0, Math.round(Number(parsed.seo) ?? 0)));
    const aeo = Math.min(100, Math.max(0, Math.round(Number(parsed.aeo) ?? 0)));
    const geo = Math.min(100, Math.max(0, Math.round(Number(parsed.geo) ?? 0)));
    return {
      seo,
      aeo,
      geo,
      notes: typeof parsed.notes === "string" ? parsed.notes.slice(0, 300) : "Scored post-generation.",
    };
  } catch {
    return null;
  }
}
