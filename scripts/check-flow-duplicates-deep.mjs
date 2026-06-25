/**
 * Deep search Flow Productions duplicates by title/slug/webhook timing.
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
const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const uid = "2dc0ae1a-5543-4551-b9dd-07252ecf3243";

const { data: locs } = await sb
  .from("post_localizations")
  .select("post_id, locale, title, posts!inner(id, slug, status, created_at, published_at, cover_image_path, webhook_sent_at, author_id)")
  .eq("posts.author_id", uid)
  .ilike("title", "%Augmented Reality%");

console.log("=== Title matches Augmented Reality ===");
for (const row of locs ?? []) {
  const p = row.posts;
  console.log(JSON.stringify({ ...p, locale: row.locale, title: row.title }));
}

const { data: allPosts } = await sb
  .from("posts")
  .select("id, slug, status, created_at, published_at, cover_image_path, webhook_sent_at")
  .eq("author_id", uid)
  .gte("published_at", "2026-06-20")
  .order("published_at", { ascending: false });

console.log("\n=== Published since Jun 20 ===");
for (const p of allPosts ?? []) console.log(JSON.stringify(p));

// Pull CMS API if key available
const { data: client } = await sb
  .from("clients")
  .select("domain, cms_api_key, webhook_url, webhook_event_format")
  .eq("user_id", uid)
  .single();

console.log("\nClient webhook format:", client?.webhook_event_format);

// Try public CMS API list
const cmsBase = process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")
  ? "https://cms.witflow.co"
  : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://cms.witflow.co";

if (client?.cms_api_key) {
  const apiUrl = `${cmsBase}/api/cms/sites/${client.domain}/posts?limit=10`;
  try {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${client.cms_api_key}` },
    });
    const json = await res.json();
    console.log("\n=== CMS API latest posts ===");
    for (const p of json.posts ?? json.data ?? []) {
      console.log(
        p.slug,
        "| cover:",
        p.coverImageUrl ? "yes" : "NO",
        "| id:",
        p.id?.slice?.(0, 8),
      );
    }
  } catch (e) {
    console.log("CMS API fetch failed:", e.message);
  }
}

// Timeline for latest AR post
const postId = "c74e24c7-cd35-4a66-ad44-c547cff515b4";
const p = allPosts?.find((x) => x.id === postId) ?? locs?.[0]?.posts;
if (p) {
  console.log("\n=== AR post timeline ===");
  console.log("created:", p.created_at);
  console.log("published_at (first publish in CMS):", p.published_at);
  console.log("webhook_sent_at (last webhook only):", p.webhook_sent_at);
  const ts = p.cover_image_path?.match(/cover-(\d+)\.jpg/)?.[1];
  if (ts) console.log("cover file ts:", new Date(Number(ts)).toISOString());
  console.log("\nOld scheduler sent 2 webhooks: publish at ~published_at, then cover update at ~webhook_sent_at");
  console.log("Flow uses legacy format (cms.post.*). Site may CREATE on each event instead of upsert by post.id");
}
