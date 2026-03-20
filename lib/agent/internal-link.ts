/**
 * AI picks the best internal URL for a post; we append a localized "Learn more" footer.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Locale } from "@/lib/types/db";
import { getCandidateSiteUrls } from "./site-urls";

const PICK_MODEL = "gemini-3.1-flash-lite-preview";

const LEARN_MORE: Record<Locale, string> = {
  pt: "Saiba mais",
  en: "Learn more",
  fr: "En savoir plus",
};

export function appendLearnMoreFooter(
  contentMd: string,
  url: string | null,
  locale: Locale
): string {
  if (!url?.trim()) return contentMd;
  const phrase = LEARN_MORE[locale] ?? LEARN_MORE.en;
  const footer = `\n\n[${phrase}](${url.trim()})`;
  const trimmed = contentMd.trimEnd();
  // Avoid duplicating if re-run
  if (trimmed.includes(`](${url.trim()})`)) return contentMd;
  return `${trimmed}${footer}`;
}

/**
 * Fetches site URLs, asks Gemini which page best matches the post; returns one URL or null.
 */
export async function resolveBestInternalLink(params: {
  domain: string;
  postTitle: string;
  excerpt: string;
  contentMdSnippet: string;
}): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[internal-link] GEMINI_API_KEY missing, skipping internal link");
    return null;
  }

  const candidates = await getCandidateSiteUrls(params.domain);
  if (candidates.length === 0) return null;

  const list = candidates.slice(0, 60);

  const snippet = params.contentMdSnippet.slice(0, 4_000);

  const prompt = `You help choose ONE internal link for a blog article on the same website.

WEBSITE DOMAIN: ${params.domain}

CANDIDATE PAGE URLs (same site):
${list.map((u, i) => `${i + 1}. ${u}`).join("\n")}

BLOG POST:
Title: ${params.postTitle}
Excerpt: ${params.excerpt}

CONTENT START (markdown):
${snippet}

TASK: Pick exactly ONE URL from the list that is the best "learn more" destination for a reader who finished this article — the page that best matches the topic or next step (e.g. service page, product, about, contact, main offer). Prefer marketing/site pages over other blog posts when both fit.

RULES:
- Return ONLY valid JSON, no markdown fences: {"url":"https://..."} 
- The url MUST be copied exactly from the list above.
- If no URL is a reasonable match, return {"url":null}

JSON:`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: PICK_MODEL,
      generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(clean) as { url?: string | null };
    const chosen = parsed?.url?.trim();
    if (!chosen) return null;
    const ok = list.some((u) => u === chosen || u.replace(/\/$/, "") === chosen.replace(/\/$/, ""));
    if (!ok) {
      console.warn("[internal-link] Model returned URL not in candidate list:", chosen);
      return null;
    }
    return chosen;
  } catch (e) {
    console.warn("[internal-link] pick failed:", e);
    return null;
  }
}
