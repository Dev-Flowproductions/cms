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

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const flowUserId = "2dc0ae1a-5543-4551-b9dd-07252ecf3243";

const { data: posts } = await sb
  .from("posts")
  .select(
    "id, slug, status, created_at, published_at, cover_image_path, webhook_status, webhook_error, primary_locale",
  )
  .eq("author_id", flowUserId)
  .gte("published_at", "2026-06-30T00:00:00Z")
  .lte("published_at", "2026-07-02T23:59:59Z")
  .order("published_at", { ascending: false });

console.log("=== Flow posts published around 1 Jul 2026 ===\n");
for (const p of posts ?? []) {
  const { data: locs } = await sb
    .from("post_localizations")
    .select("locale, title")
    .eq("post_id", p.id);
  console.log({
    id: p.id,
    slug: p.slug,
    status: p.status,
    published_at: p.published_at,
    cover: p.cover_image_path ?? null,
    webhook_status: p.webhook_status,
    title: locs?.find((l) => l.locale === p.primary_locale)?.title ?? locs?.[0]?.title,
  });
}

const { data: nearby } = await sb
  .from("posts")
  .select("id, slug, status, created_at, published_at, cover_image_path")
  .eq("author_id", flowUserId)
  .order("published_at", { ascending: false })
  .limit(5);

console.log("\n=== Latest 5 Flow posts ===\n");
for (const p of nearby ?? []) {
  console.log(p.published_at?.slice(0, 10), p.slug, p.status, p.cover_image_path ? "cover OK" : "NO COVER");
}
