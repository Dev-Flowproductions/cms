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

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ABOUT_AUTHOR_HEADINGS = [...new Set(Object.values(ABOUT_AUTHOR))];

/** Injected or pasted HTML author cards (with or without id). */
const AUTHOR_DIV_RE =
  /<div[^>]*(?:\bid\s*=\s*["']author-block["']|\sclass\s*=\s*["'][^"']*author-block[^"']*["'])[^>]*>[\s\S]*?<\/div>/gi;

/** Match CMS-appended author card without using the global AUTHOR_DIV_RE (avoids lastIndex side effects). */
const EMBEDDED_AUTHOR_BLOCK_SNIPPET =
  /id\s*=\s*["']author-block["']|\bclass\s*=\s*["'][^"']*\bauthor-block\b[^"']*["']/i;

/** True when body markdown already includes the rich author block (webhook should omit `post.author` to avoid duplicate UI). */
export function contentMdHasEmbeddedAuthorBlock(contentMd: string): boolean {
  return Boolean(contentMd && EMBEDDED_AUTHOR_BLOCK_SNIPPET.test(contentMd));
}

function decodeBasicHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripOuterMarkdownBold(s: string): string {
  return s.replace(/^\*\*([\s\S]*)\*\*$/m, "$1").trim();
}

/**
 * Reads name / job / bio from the author section the translator put in `content_md`
 * (before `appendAuthorBlock` strips it). Used so we re-append the canonical HTML card with translated copy.
 */
export function extractAuthorFieldsFromContentMd(contentMd: string): Partial<AuthorForBlock> {
  const out: Partial<AuthorForBlock> = {};
  for (const heading of ABOUT_AUTHOR_HEADINGS) {
    const escaped = escapeRegExp(heading);
    const re = new RegExp(
      `(?:^|\\n)#{1,3}\\s*(?:\\*\\*)?\\s*${escaped}\\s*(?:\\*\\*)?\\s*\\n([\\s\\S]*?)(?=\\n#{1,3}\\s|$)`,
      "i",
    );
    const m = contentMd.match(re);
    if (!m?.[1]) continue;
    const body = m[1].trim();
    if (!body) continue;

    const divInner = body.match(/<div[^>]*author-block[^>]*>([\s\S]*?)<\/div>/i);
    const htmlBlob = divInner ? divInner[1] : /author-name|author-job|author-bio/i.test(body) ? body : null;
    if (htmlBlob) {
      const nm = htmlBlob.match(/class\s*=\s*["']author-name["'][^>]*>([^<]*)/i);
      const jm = htmlBlob.match(/class\s*=\s*["']author-job["'][^>]*>([^<]*)/i);
      const bm = htmlBlob.match(/class\s*=\s*["']author-bio["'][^>]*>([\s\S]*?)<\/p>/i);
      if (nm?.[1]?.trim()) out.displayName = decodeBasicHtmlEntities(nm[1].trim());
      if (jm?.[1]?.trim()) out.jobTitle = decodeBasicHtmlEntities(jm[1].trim());
      if (bm?.[1]?.trim()) {
        const raw = bm[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim();
        out.bio = decodeBasicHtmlEntities(raw);
      }
      if (out.bio !== undefined || out.jobTitle !== undefined || out.displayName !== undefined) {
        return out;
      }
    }

    const textOnly = body.replace(/<div\b[\s\S]*?<\/div>/gi, "").trim();
    const paras = textOnly.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
    if (paras.length >= 1) {
      const name = stripOuterMarkdownBold(paras[0].replace(/\*\*/g, "").trim());
      if (name && name.length < 200) out.displayName = name;
    }
    if (paras.length >= 3) {
      out.jobTitle = paras[1].replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
      out.bio = paras.slice(2).join("\n\n").replace(/\*\*/g, "").trim();
    } else if (paras.length === 2) {
      const second = paras[1].replace(/\*\*/g, "").trim();
      if (second.length > 140 || !/[|•]/.test(second)) {
        out.bio = second;
      } else {
        out.jobTitle = second;
      }
    }
    return out;
  }
  return out;
}

/**
 * Removes injected author HTML and model-written author headings so we only append one block.
 * Runs until stable — models sometimes emit two identical "## Sobre o autor" sections.
 */
export function stripAuthorBlocksFromContentMd(contentMd: string): string {
  let s = contentMd;
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(AUTHOR_DIV_RE, "");
    for (const heading of ABOUT_AUTHOR_HEADINGS) {
      const escaped = escapeRegExp(heading);
      // H1–H3 (models sometimes use # for "Sobre o autor"); stop at next markdown heading of any level.
      const re = new RegExp(
        `(?:^|\\n)#{1,3}\\s*(?:\\*\\*)?\\s*${escaped}\\s*(?:\\*\\*)?\\s*\\n[\\s\\S]*?(?=\\n#{1,3}\\s|$)`,
        "gi",
      );
      s = s.replace(re, "");
    }
  }
  return s.replace(/\n{3,}/g, "\n\n").trimEnd();
}

/** Markdown links [text](url) in content — http(s) and relative paths. */
const MARKDOWN_HTTP_LINK_RE = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi;
const MARKDOWN_ANY_LINK_RE = /\[([^\]]*)\]\(([^)\s]+)\)/g;

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
 * Restores internal links in revised content when the reviser corrupted them to "/" or homepage.
 * Uses original content as the source of truth for anchor→URL mapping.
 */
export function restoreInternalLinks(revisedContent: string, originalContent: string): string {
  const originalLinks: Array<{ anchor: string; url: string }> = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(MARKDOWN_ANY_LINK_RE.source, "g");
  while ((m = re.exec(originalContent)) !== null) {
    const url = m[2]?.trim() ?? "";
    const anchor = m[1] ?? "";
    if (url && url !== "/" && !/^https?:\/\/[^/]+\/?$/i.test(url)) {
      originalLinks.push({ anchor, url });
    }
  }
  if (originalLinks.length === 0) return revisedContent;

  const byAnchor = new Map<string, string>();
  for (const { anchor, url } of originalLinks) {
    if (!byAnchor.has(anchor)) byAnchor.set(anchor, url);
  }

  return revisedContent.replace(MARKDOWN_ANY_LINK_RE, (full, anchor: string, url: string) => {
    const u = (url ?? "").trim();
    const isHome = u === "/" || /^https?:\/\/[^/]+\/?$/i.test(u);
    if (!isHome) return full;
    const correct = byAnchor.get(anchor);
    if (!correct) return full;
    return `[${anchor}](${correct})`;
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
 * Strips relative markdown links (e.g. `[text](/path)`) whose path is not in the allowed URL set.
 * Call after {@link convertInternalLinksToRelative} to remove any AI-hallucinated relative paths.
 */
export function sanitizeRelativeMarkdownLinks(contentMd: string, allowedUrls: string[]): string {
  if (!allowedUrls.length) return contentMd;
  // Build set of known paths (without trailing slash) from the allowed absolute URLs
  const knownPaths = new Set<string>();
  for (const u of allowedUrls) {
    try {
      const path = new URL(u.trim()).pathname.replace(/\/$/, "") || "/";
      knownPaths.add(path.toLowerCase());
      knownPaths.add((path + "/").toLowerCase());
    } catch {
      // Relative path already
      const p = u.trim().replace(/\/$/, "") || "/";
      knownPaths.add(p.toLowerCase());
    }
  }
  const RELATIVE_LINK_RE = /\[([^\]]*)\]\((\/[^)\s]*)\)/g;
  return contentMd.replace(RELATIVE_LINK_RE, (full, anchor: string, path: string) => {
    const p = path.trim().replace(/\/$/, "") || "/";
    if (knownPaths.has(p.toLowerCase()) || knownPaths.has((p + "/").toLowerCase())) return full;
    return anchor; // Remove the link, keep the anchor text
  });
}


/**
 * Appends a "Sobre o autor" / "About the author" section at the end of content_md
 * so the author always appears at the bottom of the post, in the content itself.
 * Layout: avatar left, name + role stacked on the right; bio full width below (see globals.css).
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
  const avatarInner = avatarUrl
    ? `<img src="${esc(avatarUrl)}" alt="${esc(name)}" width="56" height="56" />`
    : `<span class="author-initial" aria-hidden="true">${esc(initial)}</span>`;
  const avatarHtml = `<div class="author-avatar">${avatarInner}</div>`;
  const nameHtml = `<p class="author-name">${esc(name)}</p>`;
  const jobHtml = job ? `<p class="author-job">${esc(job)}</p>` : "";
  const titlesHtml = `<div class="author-block-titles">${nameHtml}${jobHtml}</div>`;
  const headerHtml = `<div class="author-block-header">${avatarHtml}${titlesHtml}</div>`;
  const bioHtml = bio ? `<p class="author-bio">${esc(bio)}</p>` : "";
  const block = `\n\n## ${heading}\n\n<div id="author-block" class="author-block">${headerHtml}${bioHtml}</div>`;
  const stripped = stripAuthorBlocksFromContentMd(contentMd);
  return `${stripped.trimEnd()}${block}`;
}
