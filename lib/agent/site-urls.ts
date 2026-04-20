/**
 * Discover public URLs on a client domain for internal linking (sitemap → homepage links → homepage only).
 */

import type { Locale } from "@/lib/types/db";

const MAX_URLS = 80;
const MAX_COLLECT = 500; // Collect more, then sort + slice to get best URLs
const FETCH_TIMEOUT_MS = 12_000;
const TITLE_FETCH_TIMEOUT_MS = 4_000;
const TITLE_FETCH_CONCURRENCY = 8;

function normalizeHost(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/")[0] ?? domain;
}

function sameHost(urlStr: string, host: string): boolean {
  try {
    const u = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    return u.hostname.replace(/^www\./, "") === host.replace(/^www\./, "");
  } catch {
    return false;
  }
}

/** Extract <loc> URLs from sitemap XML (simple regex; works for most WordPress / static sitemaps). */
function parseSitemapLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc[^>]*>([^<]+)<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const u = m[1]?.trim();
    if (u) out.push(u);
  }
  return out;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "CMS-InternalLinkBot/1.0" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Follow one level of sitemap index if present. */
async function expandSitemapIndex(xml: string, baseHost: string): Promise<string[]> {
  const locs = parseSitemapLocs(xml);
  const isIndex = /<sitemapindex/i.test(xml) || locs.some((l) => /sitemap.*\.xml$/i.test(l));
  if (!isIndex || locs.length === 0) return locs;

  const merged: string[] = [];
  for (const loc of locs.slice(0, 12)) {
    if (!sameHost(loc, baseHost)) continue;
    const sub = await fetchText(loc);
    if (sub) merged.push(...parseSitemapLocs(sub));
  }
  return merged.length > 0 ? merged : locs;
}

function parseHomepageLinks(html: string, baseOrigin: string, host: string): string[] {
  const out = new Set<string>();
  const hrefRe = /\shref=["']([^"'#]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(html)) !== null) {
    let href = m[1]?.trim();
    if (!href || href.startsWith("mailto:") || href.startsWith("javascript:")) continue;
    if (href.startsWith("/")) {
      try {
        out.add(new URL(href, baseOrigin).href);
      } catch {
        /* ignore */
      }
    } else if (href.startsWith("http") && sameHost(href, host)) {
      out.add(href.split("#")[0] ?? href);
    }
  }
  return [...out];
}

/**
 * Returns candidate page URLs on the site (for the internal-link picker).
 * Order: sitemap URLs → homepage anchor URLs → at least the site homepage.
 */
export async function getCandidateSiteUrls(domain: string | null): Promise<string[]> {
  if (!domain?.trim()) return [];

  const host = normalizeHost(domain);
  const baseOrigin = `https://${host}`;
  const homepage = `${baseOrigin}/`;

  const seen = new Set<string>();
  const add = (u: string) => {
    const clean = u.replace(/\/$/, "") || homepage;
    if (seen.size >= MAX_COLLECT) return;
    seen.add(clean);
  };

  const sitemapPaths = ["/sitemap.xml", "/wp-sitemap.xml", "/sitemap_index.xml"];
  let sitemapXml: string | null = null;
  for (const p of sitemapPaths) {
    sitemapXml = await fetchText(`${baseOrigin}${p}`);
    if (sitemapXml && parseSitemapLocs(sitemapXml).length > 0) break;
  }
  if (sitemapXml) {
    let locs = parseSitemapLocs(sitemapXml);
    if (locs.some((l) => /sitemap.*\.xml$/i.test(l)) || /<sitemapindex/i.test(sitemapXml)) {
      locs = await expandSitemapIndex(sitemapXml, host);
    }
    for (const loc of locs) {
      if (sameHost(loc, host)) add(loc.split("#")[0] ?? loc);
    }
  }

  // Always fetch homepage — nav/footer often link to key pages
  const homeHtml = await fetchText(homepage);
  const homeLinks: string[] = [];
  if (homeHtml) {
    for (const u of parseHomepageLinks(homeHtml, baseOrigin, host)) {
      homeLinks.push(u);
      add(u);
    }
  }

  // Crawl section pages (e.g. /en/martech, /en/servicos) to get subpages the sitemap may miss
  const pathDepth = (urlStr: string) => (new URL(urlStr).pathname.match(/\/[^/]+/g) || []).length;
  const sectionCandidates = homeLinks
    .filter((u) => sameHost(u, host) && pathDepth(u) === 2)
    .slice(0, 12);
  for (const sectionUrl of sectionCandidates) {
    const html = await fetchText(sectionUrl);
    if (html) {
      for (const u of parseHomepageLinks(html, baseOrigin, host)) {
        if (sameHost(u, host)) add(u.split("#")[0] ?? u);
      }
    }
  }

  add(homepage);

  const urls = [...seen];
  // Exclude non-content pages: project/portfolio, auth, legal, app UI
  const isNonContent = (path: string) =>
    /\/projects?(\/|$)/i.test(path) ||
    /\/projetos?(\/|$)/i.test(path) ||
    /\/portfolio(\/|$)/i.test(path) ||
    /\/cases?(-studies?)?(\/|$)/i.test(path) ||
    // Auth / account pages
    /\/(login|logout|sign-?in|sign-?out|signup|register|auth|oauth|reset-password|forgot-password)(\/|$)/i.test(path) ||
    // Legal / compliance pages
    /\/(privacy|terms|cookies?|legal|policy|gdpr|disclaimer|imprint)(\/|$)/i.test(path) ||
    // App / back-office UI
    /\/(dashboard|admin|account|profile|settings|app|onboarding|billing|checkout|cart)(\/|$)/i.test(path) ||
    // Technical / utility
    /\/(api|cdn-cgi|\.well-known|sitemap|robots\.txt|404|500)(\/|$)/i.test(path);
  const filtered = urls.filter((u) => {
    try {
      return !isNonContent(new URL(u).pathname);
    } catch {
      return true;
    }
  });
  // Sort by path depth (deeper = more specific). Works for any site structure.
  filtered.sort((a, b) => {
    const depthA = (new URL(a).pathname.match(/\/[^/]+/g) || []).length;
    const depthB = (new URL(b).pathname.match(/\/[^/]+/g) || []).length;
    return depthB - depthA;
  });
  return filtered.slice(0, MAX_URLS);
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m?.[1]) return null;
  return m[1]
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim()
    .slice(0, 120) || null;
}

async function fetchOneTitle(url: string): Promise<{ url: string; title: string | null }> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "CMS-InternalLinkBot/1.0" },
      signal: AbortSignal.timeout(TITLE_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { url, title: null };
    const html = await res.text();
    return { url, title: extractTitle(html) };
  } catch {
    return { url, title: null };
  }
}

/** Enrich URLs with page titles for topical matching. Fetches top N in batches. */
export async function enrichWithTitles(
  urls: string[],
  limit = 35
): Promise<EnrichedUrl[]> {
  const toFetch = urls.slice(0, limit);
  const rest = urls.slice(limit).map((url): EnrichedUrl => ({ url, title: null }));
  const results: EnrichedUrl[] = [];
  for (let i = 0; i < toFetch.length; i += TITLE_FETCH_CONCURRENCY) {
    const batch = toFetch.slice(i, i + TITLE_FETCH_CONCURRENCY);
    const done = await Promise.all(batch.map(fetchOneTitle));
    results.push(...done);
  }
  return [...results, ...rest];
}

export type EnrichedUrl = { url: string; title: string | null };

/** First path segment is a CMS-supported locale prefix (en, en-GB, pt, pt-BR, fr, …). */
const LOCALE_PATH_PREFIX = /^(en|fr|pt)(-[a-z]{2})?$/i;

/**
 * If the URL path starts with a locale segment, returns that segment and the path **after** it (may be "").
 * Paths like /insights/foo (no locale) return null — treat as language-neutral for expansion.
 */
export function parseLocalizedPathPrefix(pathname: string): { localeSeg: string; rest: string } | null {
  const path = pathname || "/";
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const first = parts[0] ?? "";
  if (!LOCALE_PATH_PREFIX.test(first)) return null;
  const rest = parts.length > 1 ? `/${parts.slice(1).join("/")}` : "";
  return { localeSeg: first, rest };
}

function normalizeEnrichedUrlKey(urlStr: string): string {
  try {
    const u = new URL(urlStr.trim());
    u.hash = "";
    let p = u.pathname.replace(/\/+$/, "") || "/";
    u.pathname = p;
    return u.href.replace(/\/$/, "");
  } catch {
    return urlStr.trim();
  }
}

/**
 * For each URL whose first segment is a locale (e.g. /en-GB/insights/a), adds sibling URLs for
 * pt, en, and fr so internal linking can prefer /pt/..., /fr/..., etc. Preserves subtags when
 * swapping only the language family (e.g. en-GB → pt, not en).
 */
export function expandEnrichedUrlsWithLocaleSiblings(enriched: EnrichedUrl[]): EnrichedUrl[] {
  if (enriched.length === 0) return enriched;
  const byKey = new Map<string, EnrichedUrl>();

  const add = (url: string, title: string | null) => {
    const key = normalizeEnrichedUrlKey(url);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { url: key, title });
    } else if (title && !existing.title) {
      existing.title = title;
    }
  };

  for (const e of enriched) {
    add(e.url, e.title);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(e.url.trim());
    } catch {
      continue;
    }

    const loc = parseLocalizedPathPrefix(parsedUrl.pathname);
    if (!loc) continue;

    const origin = `${parsedUrl.protocol}//${parsedUrl.host}`;
    const targets: Locale[] = ["pt", "en", "fr"];
    for (const target of targets) {
      const newSeg = localePrefixForTarget(target, loc.localeSeg);
      const newPath = `/${newSeg}${loc.rest}`;
      let built: string;
      try {
        built = new URL(newPath, origin).href;
      } catch {
        continue;
      }
      add(built, e.title);
    }
  }

  return [...byKey.values()];
}

/**
 * Rewrites relative markdown links whose first path segment is a locale prefix (e.g. /en-GB/foo → /pt/foo)
 * so translated posts point at the correct language path. Leaves non-locale paths (e.g. /insights/foo) unchanged.
 */
export function rewriteMarkdownRelativePathsToLocale(contentMd: string, targetLocale: Locale): string {
  return contentMd.replace(
    /\]\((\/(?:en|fr|pt)(?:-[a-zA-Z]{2,})?)((?:\/[^)\s#]*)?)\)/gi,
    (_full, segWithSlash: string, pathRest: string) => {
      const localeSeg = segWithSlash.replace(/^\//, "");
      const rest = pathRest ?? "";
      const newSeg = localePrefixForTarget(targetLocale, localeSeg);
      return `](/${newSeg}${rest})`;
    },
  );
}

/** Pick standard path segment for pt / en / fr, preserving en-GB / pt-BR style when reference matches family. */
function localePrefixForTarget(target: Locale, referenceLocaleSeg: string): string {
  const ref = referenceLocaleSeg.toLowerCase();
  if (target === "en" && ref.startsWith("en")) return referenceLocaleSeg;
  if (target === "pt" && ref.startsWith("pt")) return referenceLocaleSeg;
  if (target === "fr" && ref.startsWith("fr")) return referenceLocaleSeg;
  if (target === "en") return "en";
  if (target === "pt") return "pt";
  return "fr";
}

/**
 * After {@link expandEnrichedUrlsWithLocaleSiblings}, keep only URLs that match `locale` (or neutral paths).
 * If that would remove every URL, returns the full expanded list so the model still has candidates.
 */
export function narrowInternalLinksForLocale(expanded: EnrichedUrl[], locale: Locale): EnrichedUrl[] {
  if (expanded.length === 0) return expanded;
  const filtered = filterEnrichedUrlsForLocale(expanded, locale);
  return filtered.length > 0 ? filtered : expanded;
}

/** First path segment suggests a site language variant; "neutral" = no locale prefix (e.g. /insights/...). */
function guessPathLocaleFromUrl(urlStr: string): "en" | "pt" | "fr" | "neutral" {
  try {
    const pathname = new URL(urlStr.trim()).pathname || "/";
    const seg = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
    if (!seg) return "neutral";
    if (seg === "en" || seg.startsWith("en-")) return "en";
    if (seg === "pt" || seg.startsWith("pt-")) return "pt";
    if (seg === "fr" || seg.startsWith("fr-")) return "fr";
    return "neutral";
  } catch {
    return "neutral";
  }
}

/**
 * Keeps internal-link candidates that match the content locale: drops obvious cross-language paths
 * (e.g. /pt/... when generating English). Paths without a locale prefix are kept for all locales.
 */
export function filterEnrichedUrlsForLocale(urls: EnrichedUrl[], locale: Locale): EnrichedUrl[] {
  if (urls.length === 0) return urls;
  return urls.filter((e) => {
    const guess = guessPathLocaleFromUrl(e.url);
    if (guess === "neutral") return true;
    return guess === locale;
  });
}
