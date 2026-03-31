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

/** Align with ScoreDisplay: legacy 0–10 integers scale to 0–100. */
function normalizeScoreDimension(val: number): number {
  if (val >= 0 && val <= 10 && val % 1 === 0) return Math.round(val * 10);
  return Math.min(100, Math.max(0, Math.round(val)));
}

/** Rounded mean of SEO / AEO / GEO — same basis as the admin “avg” badge. */
export function seoScoreAverage(score: SeoScoreResult): number {
  const seo = normalizeScoreDimension(score.seo);
  const aeo = normalizeScoreDimension(score.aeo);
  const geo = normalizeScoreDimension(score.geo);
  return Math.round((seo + aeo + geo) / 3);
}

/** Publishing and auto-publish require this bar (average ≥ 90). */
export function seoScoreMeetsPublishBar(score: SeoScoreResult | null | undefined): boolean {
  if (!score || typeof score.seo !== "number" || typeof score.aeo !== "number" || typeof score.geo !== "number") {
    return false;
  }
  return seoScoreAverage(score) >= 90;
}

export type LocalizationScoreRow = { locale: string; seo_score?: unknown };

/**
 * Same bar as {@link seoScoreMeetsPublishBar} for the primary localization row (matches admin “avg” badge).
 */
export function publishSeoScoreGate(args: {
  primaryLocale: string;
  localizations: LocalizationScoreRow[];
}): { ok: true } | { ok: false; error: string } {
  const primary =
    args.localizations.find((l) => l.locale === args.primaryLocale) ??
    args.localizations.find((l) => l.locale === "pt") ??
    args.localizations.find((l) => l.locale === "en") ??
    args.localizations[0];
  if (!primary) {
    return { ok: false, error: "Post has no content." };
  }
  const score = primary.seo_score as SeoScoreResult | null | undefined;
  if (!seoScoreMeetsPublishBar(score ?? null)) {
    const avg = score ? seoScoreAverage(score) : null;
    return {
      ok: false,
      error:
        avg != null
          ? `Average SEO score must be 90+ before publish (current ${avg}). Edit and re-run AI scoring or improve content.`
          : "Primary locale is missing seo_score. Run Generate with AI on the primary locale before publishing.",
    };
  }
  return { ok: true };
}

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
The product uses the rounded average of seo, aeo, and geo; posts are not published until that average is at least 90.
Output ONLY valid JSON, nothing else: { "seo": 0-100, "aeo": 0-100, "geo": 0-100, "notes": "1 sentence" }`;

export type ScorePostOptions = {
  /** Embedding-ordered CMS instructions + client block; scoring criteria come from here. */
  systemInstruction?: string;
};

export async function scorePost(
  genAI: GoogleGenerativeAI,
  modelName: string,
  content: ScoredContent,
  options?: ScorePostOptions
): Promise<SeoScoreResult | null> {
  const userMessage = `Evaluate this blog post. Read the content carefully. Apply the 90+ criteria strictly. Score each dimension based on actual presence of required elements.

TITLE: ${content.title}
SEO TITLE: ${content.seo_title}
SEO DESCRIPTION: ${content.seo_description}
FOCUS KEYWORD: ${content.focus_keyword}

CONTENT (markdown):
${content.content_md}

FAQs: ${content.faq_blocks.length} questions

Output ONLY this JSON, nothing else:
{ "seo": <0-100>, "aeo": <0-100>, "geo": <0-100>, "notes": "<1 sentence>" }`;

  const prompt = options?.systemInstruction
    ? userMessage
    : `${SCORE_SYSTEM}

${userMessage}`;

  try {
    const model = genAI.getGenerativeModel(
      options?.systemInstruction
        ? {
            model: modelName,
            systemInstruction: `${options.systemInstruction}

---
You are an SEO editor. Score this user message's blog post 0–100 for SEO, AEO, and GEO using the instructions above. Output ONLY valid JSON: { "seo": number, "aeo": number, "geo": number, "notes": string }.`,
          }
        : { model: modelName }
    );
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
