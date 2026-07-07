/**
 * Diagnose recent posts stuck in draft/review and scheduler client errors.
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function avgSeo(seo) {
  if (!seo?.seo && seo?.seo !== 0) return null;
  return Math.round((seo.seo + seo.aeo + seo.geo) / 3);
}

const since = new Date();
since.setDate(since.getDate() - 3);

const { data: draftPosts, error: postsErr } = await sb
  .from("posts")
  .select(
    "id, slug, status, author_id, primary_locale, created_at, updated_at, published_at, cover_image_path, webhook_status, webhook_error",
  )
  .in("status", ["draft", "review"])
  .gte("created_at", since.toISOString())
  .order("created_at", { ascending: false });

if (postsErr) {
  console.error(postsErr.message);
  process.exit(1);
}

console.log(`=== Posts in draft/review since ${since.toISOString().slice(0, 10)} (${draftPosts?.length ?? 0}) ===\n`);

const authorIds = [...new Set((draftPosts ?? []).map((p) => p.author_id))];
const { data: clients } = await sb
  .from("clients")
  .select(
    "id, user_id, domain, company_name, brand_name, frequency, last_post_generated_at, last_generation_error, last_generation_error_at, webhook_url, post_locale",
  )
  .in("user_id", authorIds.length ? authorIds : ["00000000-0000-0000-0000-000000000000"]);

const clientByUser = new Map((clients ?? []).map((c) => [c.user_id, c]));

for (const p of draftPosts ?? []) {
  const client = clientByUser.get(p.author_id);
  const { data: locs } = await sb
    .from("post_localizations")
    .select("locale, title, seo_score")
    .eq("post_id", p.id);

  const primaryLoc = locs?.find((l) => l.locale === p.primary_locale) ?? locs?.[0];

  console.log({
    id: p.id,
    slug: p.slug,
    status: p.status,
    client: client?.domain ?? client?.brand_name ?? p.author_id,
    created_at: p.created_at,
    cover: Boolean(p.cover_image_path),
    webhook_status: p.webhook_status,
    webhook_error: p.webhook_error?.slice?.(0, 160) ?? null,
    title: primaryLoc?.title?.slice?.(0, 80),
    seo_avg: avgSeo(primaryLoc?.seo_score),
  });
}

console.log("\n=== Client scheduler errors ===\n");
const { data: allClients } = await sb
  .from("clients")
  .select(
    "domain, brand_name, frequency, last_post_generated_at, last_generation_error, last_generation_error_at",
  )
  .not("last_generation_error", "is", null)
  .order("last_generation_error_at", { ascending: false })
  .limit(10);

for (const c of allClients ?? []) {
  console.log({
    client: c.domain ?? c.brand_name,
    frequency: c.frequency,
    last_post_generated_at: c.last_post_generated_at,
    last_generation_error_at: c.last_generation_error_at,
    error: c.last_generation_error?.slice?.(0, 200),
  });
}
