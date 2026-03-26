/**
 * Post reviser agent: applies SEO/AEO/GEO improvements from the reviewer to the content.
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";
import { clampMetaDescription, clampSeoTitle } from "./clamp-seo-fields";
import type { ScoredContent } from "./score-post";
import type { ReviewerOutput } from "./seo-reviewer";

export type RevisedContent = {
  content_md: string;
  title?: string;
  seo_title?: string;
  seo_description?: string;
  faq_blocks?: Array<{ question: string; answer: string }>;
};

const REVISER_SYSTEM = `You are an editor. You apply SPECIFIC improvements to a blog post. Your job is to make targeted edits — do not rewrite the whole article.

Rules:
- Apply each improvement exactly as stated. Add, change, or fix only what is requested.
- Preserve the original voice, structure, and flow. Minimal edits.
- Keep markdown format: ## H2, ### H3, **bold**, lists.
- Output valid JSON with the revised fields. Only include fields you actually changed.
- content_md is REQUIRED in output — the full revised body.
- If improvement says "add to title" or "improve SEO title", include title or seo_title in output.
- If improvement says "add FAQ" or "improve FAQs", include faq_blocks.
- CRITICAL: Never modify internal links. Every [anchor](url) must be preserved EXACTLY.
- When adding statistics: use real well-known sources (HubSpot, Gartner, McKinsey, Statista) and plausible figures. Do NOT invent numbers. If unsure, use "Industry reports indicate..." with a specific year.
- seo_title: MAX 60 characters (hard). seo_description: MAX 160 characters (hard). Never exceed.`;

export type RevisePostOptions = {
  systemInstruction?: string;
};

export async function revisePost(
  genAI: GoogleGenerativeAI,
  modelName: string,
  content: ScoredContent,
  review: ReviewerOutput,
  options?: RevisePostOptions
): Promise<RevisedContent | null> {
  const improvementsText = review.improvements.map((i, idx) => `${idx + 1}. ${i}`).join("\n");
  const userMessage = `Apply these improvements to the blog post. Make targeted edits only.

IMPROVEMENTS TO APPLY:
${improvementsText}

ORIGINAL CONTENT:
TITLE: ${content.title}
SEO TITLE: ${content.seo_title}
SEO DESCRIPTION: ${content.seo_description}
FOCUS KEYWORD: ${content.focus_keyword}

CONTENT (markdown):
${content.content_md}

FAQs:
${content.faq_blocks.map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join("\n\n")}

Output ONLY valid JSON. Include content_md (required, full revised body). Include title, seo_title, seo_description, faq_blocks ONLY if you changed them.
Example: { "content_md": "...", "seo_title": "..." } or { "content_md": "..." }`;

  const prompt = options?.systemInstruction
    ? userMessage
    : `${REVISER_SYSTEM}

${userMessage}`;

  try {
    const model = genAI.getGenerativeModel(
      options?.systemInstruction
        ? {
            model: modelName,
            systemInstruction: `${options.systemInstruction}

---
${REVISER_SYSTEM}`,
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
    const parsed = JSON.parse(clean) as Record<string, unknown>;
    if (typeof parsed.content_md !== "string") return null;

    const revised: RevisedContent = { content_md: parsed.content_md };
    if (typeof parsed.title === "string") revised.title = parsed.title;
    if (typeof parsed.seo_title === "string") revised.seo_title = clampSeoTitle(parsed.seo_title);
    if (typeof parsed.seo_description === "string")
      revised.seo_description = clampMetaDescription(parsed.seo_description);
    if (Array.isArray(parsed.faq_blocks)) {
      revised.faq_blocks = parsed.faq_blocks.filter(
        (f): f is { question: string; answer: string } =>
          typeof f === "object" && f != null && typeof (f as { question?: unknown }).question === "string" && typeof (f as { answer?: unknown }).answer === "string"
      );
    }
    return revised;
  } catch {
    return null;
  }
}
