/**
 * AI picks the best internal URL for a post; we append a localized "Learn more" footer.
 * Author block is appended into content_md so it appears at the bottom of every post.
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

const ABOUT_AUTHOR: Record<Locale, string> = {
  pt: "Sobre o autor",
  en: "About the author",
  fr: "À propos de l'auteur",
};

export type AuthorForBlock = {
  displayName: string | null;
  jobTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

/**
 * Appends a "Sobre o autor" / "About the author" section at the end of content_md
 * so the author always appears at the bottom of the post, in the content itself.
 * Avatar image (if present) is shown above the name and bio.
 */
export function appendAuthorBlock(
  contentMd: string,
  locale: Locale,
  author: AuthorForBlock | null
): string {
  if (!author?.displayName?.trim()) return contentMd;
  const heading = ABOUT_AUTHOR[locale] ?? ABOUT_AUTHOR.en;
  const name = author.displayName.trim();
  const job = author.jobTitle?.trim();
  const bio = author.bio?.trim();
  const avatarUrl = author.avatarUrl?.trim();
  const byline = job ? `**${name}** — ${job}` : `**${name}**`;
  // Use HTML so we can set size (64px like Flow author block); markdown ![alt](url) would be full-width
  const avatarLine = avatarUrl
    ? `\n\n<img src="${avatarUrl.replace(/"/g, "&quot;")}" alt="${name.replace(/"/g, "&quot;")}" width="64" height="64" style="border-radius: 50%; object-fit: cover; display: block;" />\n\n`
    : "\n\n";
  const block = bio
    ? `\n\n## ${heading}${avatarLine}${byline}\n\n${bio}`
    : `\n\n## ${heading}${avatarLine}${byline}`;
  const trimmed = contentMd.trimEnd();
  if (trimmed.includes(`## ${heading}`)) return contentMd;
  return `${trimmed}${block}`;
}

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
