/**
 * Inspect recent Flow Productions posts — duplicates, covers, webhooks.
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

const { data: client } = await sb
  .from("clients")
  .select("id, user_id, domain, webhook_url, auto_publish")
  .ilike("domain", "%flowproductions%")
  .maybeSingle();

if (!client) {
  console.error("Flow client not found");
  process.exit(1);
}

console.log("Client:", client.domain, client.user_id, "auto_publish:", client.auto_publish);

const { data: posts } = await sb
  .from("posts")
  .select(
    "id, slug, status, created_at, published_at, updated_at, cover_image_path, webhook_status, webhook_error, webhook_sent_at, primary_locale",
  )
  .eq("author_id", client.user_id)
  .order("created_at", { ascending: false })
  .limit(30);

// Also find slug variants (-2, -3) and title matches for AR post
const { data: arPosts } = await sb
  .from("posts")
  .select("id, slug, created_at, cover_image_path, webhook_sent_at, published_at, status")
  .eq("author_id", client.user_id)
  .or("slug.ilike.%augmented-reality%,slug.ilike.%augmented%");

console.log("\n=== Slug matches augmented* ===");
for (const p of arPosts ?? []) {
  console.log(JSON.stringify(p));
}

console.log("\n=== Recent posts (by created_at) ===");
for (const p of posts ?? []) {
  const cover = p.cover_image_path ? "yes" : "NO";
  console.log(
    `${p.created_at?.slice(0, 19)} | ${p.id.slice(0, 8)}… | ${p.slug.slice(0, 55)} | status=${p.status} | cover=${cover} | webhook=${p.webhook_status} | pub=${p.webhook_sent_at?.slice(0, 19) ?? "—"}`,
  );
}

// Group by similar slug prefix or same-day clusters
const recent = posts ?? [];
const latest = recent[0];
if (!latest) process.exit(0);

console.log("\n=== Latest post detail ===");
console.log(JSON.stringify(latest, null, 2));

const sameDay = recent.filter(
  (p) => p.created_at?.slice(0, 10) === latest.created_at?.slice(0, 10),
);
console.log(`\nPosts created same day as latest (${latest.created_at?.slice(0, 10)}): ${sameDay.length}`);
for (const p of sameDay) {
  const { data: loc } = await sb
    .from("post_localizations")
    .select("locale, title")
    .eq("post_id", p.id)
    .eq("locale", p.primary_locale ?? "pt")
    .maybeSingle();
  let coverHttp = "n/a";
  if (p.cover_image_path) {
    const pub = `${url}/storage/v1/object/public/covers/${p.cover_image_path}`;
    try {
      const h = await fetch(pub, { method: "HEAD" });
      coverHttp = String(h.status);
    } catch {
      coverHttp = "err";
    }
  }
  console.log(`\n--- ${p.slug} (${p.id}) ---`);
  console.log("  title:", loc?.title?.slice(0, 80));
  console.log("  cover_path:", p.cover_image_path ?? "NULL");
  console.log("  cover HTTP:", coverHttp);
  console.log("  webhook_sent:", p.webhook_sent_at, "status:", p.webhook_status, "err:", p.webhook_error);
}

// Webhook delivery log if table exists
const { data: deliveries, error: delErr } = await sb
  .from("webhook_deliveries")
  .select("id, post_id, status, created_at, error")
  .in(
    "post_id",
    sameDay.map((p) => p.id),
  )
  .order("created_at", { ascending: true });

if (!delErr && deliveries?.length) {
  console.log("\n=== Webhook deliveries ===");
  for (const d of deliveries) {
    console.log(`${d.created_at?.slice(0, 19)} | post=${d.post_id.slice(0, 8)} | ${d.status} | ${(d.error ?? "").slice(0, 60)}`);
  }
}
