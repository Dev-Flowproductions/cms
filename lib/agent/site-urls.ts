/**
 * Discover public URLs on a client domain for internal linking (sitemap → homepage links → homepage only).
 */

const MAX_URLS = 80;
const FETCH_TIMEOUT_MS = 12_000;

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
  for (const loc of locs.slice(0, 5)) {
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
    if (seen.size >= MAX_URLS) return;
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

  if (seen.size < 8) {
    const homeHtml = await fetchText(homepage);
    if (homeHtml) {
      for (const u of parseHomepageLinks(homeHtml, baseOrigin, host)) {
        add(u);
      }
    }
  }

  add(homepage);

  return [...seen].slice(0, MAX_URLS);
}
