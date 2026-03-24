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

const SCORE_SYSTEM = `You are an SEO editor. Score blog posts (0-100) for SEO, AEO, and GEO.

**SEO:** Focus keyword in title, intro, 2+ H2s, seo_title, seo_description. 5-8 semantic variants.
**AEO:** Core argument in intro. Definition block. 5 FAQs. **Bold** key claims. EEAT signals.
**GEO:** 3+ attributed stats ("According to [Source], ..."). 5+ named entities. Date-anchored facts.

Score 0-100 based on how well each dimension is met. 90+ = strong, most criteria present. 70-89 = good with gaps. 50-69 = several gaps. <50 = major gaps.
Output ONLY valid JSON, nothing else: { "seo": 0-100, "aeo": 0-100, "geo": 0-100, "notes": "1 sentence" }`;

export async function scorePost(
  genAI: GoogleGenerativeAI,
  modelName: string,
  content: ScoredContent
): Promise<SeoScoreResult | null> {
  const prompt = `${SCORE_SYSTEM}

Evaluate this blog post. Read the content carefully. Apply the 90+ criteria strictly. Score each dimension based on actual presence of required elements.

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
    let clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    // Extract JSON object if model wrapped it in extra text
    const braceStart = clean.indexOf("{");
    if (braceStart >= 0) {
      let depth = 0;
      let end = -1;
      for (let i = braceStart; i < clean.length; i++) {
        if (clean[i] === "{") depth++;
        else if (clean[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end >= 0) clean = clean.slice(braceStart, end + 1);
    }
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
