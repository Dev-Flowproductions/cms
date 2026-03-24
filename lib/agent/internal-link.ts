/**
 * In-body internal links: generated with the post; URLs must come from the candidate list.
 * Author block is appended into content_md at the bottom of every post.
 */

import type { Locale } from "@/lib/types/db";

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

/** Markdown links [text](https://...) in content — only http(s) targets are validated. */
const MARKDOWN_HTTP_LINK_RE = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi;

function sameOrigin(urlHost: string, domain: string): boolean {
  const n = (h: string) => h.replace(/^www\./, "").toLowerCase();
  return n(urlHost) === n(domain.replace(/^https?:\/\//, "").replace(/\/.*$/, ""));
}

function normalizeComparableUrl(urlStr: string): string | null {
  try {
    const u = new URL(urlStr.trim());
    u.hash = "";
    const path = u.pathname.replace(/\/$/, "") || "";
    return `${u.protocol}//${u.hostname.toLowerCase()}${path}`.toLowerCase();
  } catch {
    return null;
  }
}

/** Build lookup set from crawler-provided URLs (with trailing-slash variants). */
function buildAllowedUrlSet(candidates: string[]): { raw: Set<string>; normalized: Set<string> } {
  const raw = new Set<string>();
  const normalized = new Set<string>();
  for (const c of candidates) {
    const t = c.trim();
    if (!t) continue;
    raw.add(t);
    raw.add(t.replace(/\/$/, ""));
    raw.add(t.endsWith("/") ? t : `${t}/`);
    const n = normalizeComparableUrl(t);
    if (n) normalized.add(n);
    const noSlash = t.replace(/\/$/, "");
    const n2 = normalizeComparableUrl(noSlash);
    if (n2) normalized.add(n2);
  }
  return { raw, normalized };
}

/**
 * Keeps only markdown links whose URL appears in the allowed list (same site pages).
 * Invalid or unknown URLs are reduced to plain anchor text (link removed).
 */
export function sanitizeInternalMarkdownLinks(contentMd: string, allowedUrls: string[]): string {
  if (!allowedUrls.length) {
    return contentMd.replace(MARKDOWN_HTTP_LINK_RE, (_full, anchor: string) => anchor);
  }
  const { raw, normalized } = buildAllowedUrlSet(allowedUrls);
  return contentMd.replace(MARKDOWN_HTTP_LINK_RE, (full, anchor: string, url: string) => {
    const trimmed = url.trim();
    if (raw.has(trimmed) || raw.has(trimmed.replace(/\/$/, "")) || raw.has(trimmed.endsWith("/") ? trimmed : `${trimmed}/`)) {
      return full;
    }
    const nu = normalizeComparableUrl(trimmed);
    if (nu && normalized.has(nu)) return full;
    return anchor;
  });
}

/**
 * Converts same-site absolute URLs to relative paths (e.g. https://example.com/servicos → /servicos).
 * Better for SEO and works across staging/production. Call after sanitize.
 */
export function convertInternalLinksToRelative(contentMd: string, domain: string): string {
  if (!domain?.trim()) return contentMd;
  const baseHost = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
  if (!baseHost) return contentMd;
  return contentMd.replace(MARKDOWN_HTTP_LINK_RE, (full, anchor: string, url: string) => {
    try {
      const u = new URL(url.trim());
      if (!sameOrigin(u.hostname, baseHost)) return full;
      const path = u.pathname || "/";
      const q = u.search ? `${u.pathname || "/"}${u.search}` : path;
      return `[${anchor}](${q})`;
    } catch {
      return full;
    }
  });
}

/**
 * Appends a "Sobre o autor" / "About the author" section at the end of content_md
 * so the author always appears at the bottom of the post, in the content itself.
 * Centered layout: avatar, name, job title, bio in a compact block.
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
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const initial = name.charAt(0).toUpperCase();
  const avatarHtml = avatarUrl
    ? `<p class="author-avatar"><img src="${esc(avatarUrl)}" alt="${esc(name)}" width="48" height="48" /></p>`
    : `<p class="author-avatar"><span class="author-initial" aria-hidden>${esc(initial)}</span></p>`;
  const nameHtml = `<p class="author-name">${esc(name)}</p>`;
  const jobHtml = job ? `<p class="author-job">${esc(job)}</p>` : "";
  const bioHtml = bio ? `<p class="author-bio">${esc(bio)}</p>` : "";
  const block = `\n\n## ${heading}\n\n<div id="author-block" class="author-block">${avatarHtml}${nameHtml}${jobHtml}${bioHtml}</div>`;
  const trimmed = contentMd.trimEnd();
  if (trimmed.includes(`## ${heading}`)) return contentMd;
  return `${trimmed}${block}`;
}
