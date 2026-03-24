/**
 * Discover public URLs on a client domain for internal linking (sitemap → homepage links → homepage only).
 */

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
  // Exclude project/portfolio/case-study pages — we want topic pages, not individual projects
  const isProjectLike = (path: string) =>
    /\/projects?(\/|$)/i.test(path) ||
    /\/projetos?(\/|$)/i.test(path) ||
    /\/portfolio(\/|$)/i.test(path) ||
    /\/cases?(-studies?)?(\/|$)/i.test(path);
  const filtered = urls.filter((u) => {
    try {
      return !isProjectLike(new URL(u).pathname);
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
