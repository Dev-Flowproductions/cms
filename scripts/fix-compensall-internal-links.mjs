/**
 * Fix broken internal links in Compensall CMS post markdown, then optionally republish.
 *
 * Problems this addresses:
 * - Invented PT slugs (direitos-passageiros, voo-cancelado)
 * - Article labels pointing at /assets/blog/*.jpg
 * - Locale-prefixed paths (/pt/blog/...) that Compensall next-intl can double
 * - Obvious "compensation rights guide" labels pointing at the wrong post
 *
 * Usage:
 *   node scripts/fix-compensall-internal-links.mjs --dry-run
 *   node scripts/fix-compensall-internal-links.mjs
 *   node scripts/fix-compensall-internal-links.mjs --republish
 */
import fs from "fs";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i);
    let v = t.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv(".env.local");

const dryRun = process.argv.includes("--dry-run");
const republish = process.argv.includes("--republish");

const GUIDE_SLUGS = new Set([
  "flight-cancellation",
  "denied-boarding",
  "flight-delay",
  "missed-connection",
  "overbooking",
  "airline-strike",
  "passenger-rights",
  "passengers-with-disabilities",
  "flight-compensation-rights-guide",
  "lost-luggage-rights-compensation",
]);

const LEGACY_PATHS = {
  "/blog/direitos-passageiros": "/blog/passenger-rights",
  "/blog/voo-cancelado": "/blog/flight-cancellation",
  "/servicos/reclamacao-voo": "/#claim",
  "/pt/servicos/reclamacao-voo": "/#claim",
  "/en/servicos/reclamacao-voo": "/#claim",
  "/fr/servicos/reclamacao-voo": "/#claim",
};

const SITE_HOST_RE = /^https?:\/\/(?:www\.)?compensall\.com/i;

function stripLocalePrefix(pathname) {
  let current = pathname;
  for (let i = 0; i < 3; i++) {
    const m = current.match(/^\/(en|pt|fr)(\/.*)?$/i);
    if (!m) break;
    current = m[2] && m[2].length > 0 ? m[2] : "/";
  }
  return current;
}

function splitPathAndSuffix(href) {
  const m = href.match(/^([^?#]*)([?#].*)?$/);
  return { path: m?.[1] ?? href, suffix: m?.[2] ?? "" };
}

function rewritePath(pathname) {
  const { path, suffix } = splitPathAndSuffix(pathname);
  let next = stripLocalePrefix(path);

  if (LEGACY_PATHS[next]) {
    next = LEGACY_PATHS[next];
  } else if (LEGACY_PATHS[path]) {
    next = LEGACY_PATHS[path];
  }

  // /assets/blog/{slug}.jpg used as an article link → /blog/{slug}
  const asset = next.match(/^\/assets\/blog\/([a-z0-9-]+)\.(?:jpe?g|png|webp)$/i);
  if (asset && GUIDE_SLUGS.has(asset[1])) {
    next = `/blog/${asset[1]}`;
  }

  return `${next}${suffix}`;
}

function normalizeHref(href) {
  const trimmed = href.trim();
  if (!trimmed) return trimmed;

  let pathname = trimmed;
  if (SITE_HOST_RE.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      pathname = `${u.pathname}${u.search}${u.hash}`;
    } catch {
      return trimmed;
    }
  }

  if (!pathname.startsWith("/")) return trimmed;
  return rewritePath(pathname);
}

function fixMismatchedGuideTarget(label, href) {
  const pathOnly = splitPathAndSuffix(href).path;
  const labelLc = label.toLowerCase();

  // Prefer topic-specific guides when the label names that topic.
  if (/cancel+a|annul/i.test(labelLc) && pathOnly.startsWith("/blog/")) {
    return "/blog/flight-cancellation";
  }
  if (/\bdelay|atraso|retard\b/i.test(labelLc) && pathOnly.startsWith("/blog/")) {
    return "/blog/flight-delay";
  }
  if (/overbook|denied boarding|embarque recusado|refus d['']embarquement/i.test(labelLc) && pathOnly.startsWith("/blog/")) {
    if (/overbook|surbook/i.test(labelLc)) return "/blog/overbooking";
    return "/blog/denied-boarding";
  }
  if (/missed connection|correspond[aê]nce|liga[cç][aã]o/i.test(labelLc) && pathOnly.startsWith("/blog/")) {
    return "/blog/missed-connection";
  }
  if (/strike|greve/i.test(labelLc) && pathOnly.startsWith("/blog/")) {
    return "/blog/airline-strike";
  }

  const wantsCompensationGuide =
    /compensation rights guide|flight compensation rights|direitos de compensa[cç][aã]o(?!.*cancel)|guia de compensa[cç][aã]o(?!.*cancel)|droits à l['']indemnisation|guide.*indemnisation|vos droits en matière de compensation/i.test(
      labelLc,
    ) && !/passenger rights|direitos dos passageiros|droits des passagers a[eé]riens|cancel|annul/i.test(labelLc);

  if (
    wantsCompensationGuide &&
    (pathOnly === "/blog/flight-cancellation" || pathOnly === "/blog/passenger-rights")
  ) {
    return "/blog/flight-compensation-rights-guide";
  }

  // Brand/name link incorrectly pointing at a random guide
  if (/^compensall$/i.test(label.trim()) && pathOnly.startsWith("/blog/")) {
    return "/#claim";
  }

  return href;
}

function rewriteMarkdown(md) {
  if (!md) return { text: md, changes: 0 };
  let changes = 0;

  const text = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, href) => {
    let next = normalizeHref(href);
    next = fixMismatchedGuideTarget(label, next);
    if (next !== href) {
      changes += 1;
      return `[${label}](${next})`;
    }
    return full;
  });

  return { text, changes };
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://cms.witflow.co";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: client, error: clientErr } = await sb
  .from("clients")
  .select("id, user_id, domain")
  .ilike("domain", "%compensall%")
  .maybeSingle();

if (clientErr || !client) {
  console.error("Compensall client not found", clientErr);
  process.exit(1);
}

const { data: posts, error: postsErr } = await sb
  .from("posts")
  .select("id, slug, status")
  .eq("author_id", client.user_id)
  .eq("status", "published");

if (postsErr) {
  console.error(postsErr);
  process.exit(1);
}

console.log(
  `${dryRun ? "[dry-run] " : ""}Fixing links for ${posts.length} Compensall post(s)${republish ? " + republish" : ""}`,
);

const touchedPostIds = [];

for (const post of posts) {
  const { data: locs, error: locErr } = await sb
    .from("post_localizations")
    .select("id, locale, content_md")
    .eq("post_id", post.id);

  if (locErr) {
    console.error(post.slug, locErr);
    continue;
  }

  let postChanged = false;
  for (const loc of locs ?? []) {
    const { text, changes } = rewriteMarkdown(loc.content_md ?? "");
    if (!changes) continue;
    postChanged = true;
    console.log(`  ${post.slug} [${loc.locale}]: ${changes} link(s)`);
    if (!dryRun) {
      const { error: updErr } = await sb
        .from("post_localizations")
        .update({ content_md: text })
        .eq("id", loc.id);
      if (updErr) {
        console.error(`  failed update ${post.slug}/${loc.locale}`, updErr);
      }
    }
  }

  if (postChanged) touchedPostIds.push(post.id);
}

console.log(
  `${dryRun ? "Would update" : "Updated"} ${touchedPostIds.length} post(s)`,
);

if (!dryRun && republish && touchedPostIds.length) {
  console.log(`Republishing ${touchedPostIds.length} post(s) via ${appUrl}…`);
  for (const postId of touchedPostIds) {
    await sb.from("posts").update({ webhook_status: null }).eq("id", postId);
    const res = await fetch(`${appUrl}/api/publish/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-scheduler-internal": "1",
      },
    });
    const body = await res.text();
    console.log(`  publish ${postId}: ${res.status} ${body.slice(0, 120)}`);
  }
}
