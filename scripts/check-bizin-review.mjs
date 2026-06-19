/**
 * Diagnose Bizin client posts stuck in review.
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

const { data: clients } = await sb
  .from("clients")
  .select("id, user_id, domain, auto_publish, webhook_url, frequency, last_post_generated_at, post_locale")
  .or("domain.ilike.%bizin%,company_name.ilike.%bizin%,brand_name.ilike.%bizin%");

console.log("=== Clients matching bizin ===");
for (const c of clients ?? []) {
  console.log(JSON.stringify(c, null, 2));
}

const userIds = (clients ?? []).map((c) => c.user_id);
if (!userIds.length) {
  console.log("No bizin client found");
  process.exit(0);
}

for (const uid of userIds) {
  const { data: posts } = await sb
    .from("posts")
    .select(
      "id, slug, status, primary_locale, created_at, published_at, webhook_status, webhook_error, updated_at",
    )
    .eq("author_id", uid)
    .in("status", ["review", "draft"])
    .order("created_at", { ascending: false })
    .limit(10);

  console.log(`\n=== Posts in review/draft for user ${uid} ===`);
  for (const p of posts ?? []) {
    const { data: locs } = await sb
      .from("post_localizations")
      .select("locale, title, seo_score")
      .eq("post_id", p.id);
    console.log({
      id: p.id,
      slug: p.slug,
      status: p.status,
      primary_locale: p.primary_locale,
      created_at: p.created_at,
      webhook_status: p.webhook_status,
      webhook_error: p.webhook_error?.slice?.(0, 120),
      seo: locs?.map((l) => ({ locale: l.locale, avg: l.seo_score ? Math.round((l.seo_score.seo + l.seo_score.aeo + l.seo_score.geo) / 3) : null })),
    });
  }
}
