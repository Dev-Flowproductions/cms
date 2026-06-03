/**
 * Inspect latest published Flow Productions post cover state.
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
  .select("id, user_id, domain")
  .ilike("domain", "%flowproductions%")
  .maybeSingle();

if (!client) {
  console.error("Flow client not found");
  process.exit(1);
}

console.log("Client:", client.domain, client.user_id);

const { data: posts, error } = await sb
  .from("posts")
  .select(
    "id, slug, status, created_at, published_at, updated_at, cover_image_path, webhook_status, webhook_error, webhook_sent_at, primary_locale, byline_author_id",
  )
  .eq("author_id", client.user_id)
  .order("published_at", { ascending: false, nullsFirst: false })
  .limit(5);

if (error) {
  console.error(error.message);
  process.exit(1);
}

const latest = posts?.[0];
if (!latest) {
  console.log("No posts");
  process.exit(0);
}

console.log("\n=== Latest post (by published_at) ===");
console.log(JSON.stringify(latest, null, 2));

const { data: locs } = await sb
  .from("post_localizations")
  .select("locale, title, seo_score")
  .eq("post_id", latest.id);

console.log("\nLocalizations:", locs);

let coverUrl = null;
if (latest.cover_image_path) {
  const { data: urlData } = sb.storage.from("covers").getPublicUrl(latest.cover_image_path);
  coverUrl = urlData?.publicUrl ?? null;
  const { data: fileMeta } = await sb.storage.from("covers").list(
    latest.cover_image_path.includes("/")
      ? latest.cover_image_path.split("/").slice(0, -1).join("/")
      : "",
    { search: latest.cover_image_path.split("/").pop() },
  );
  console.log("\nCover path:", latest.cover_image_path);
  console.log("Cover public URL:", coverUrl);
  console.log("Storage list hint:", fileMeta?.length ? "found" : "not in list (may still exist)");
}

const primaryLoc = locs?.find((l) => l.locale === (latest.primary_locale ?? "pt")) ?? locs?.[0];
const { data: contentRow } = await sb
  .from("post_localizations")
  .select("content_md")
  .eq("post_id", latest.id)
  .eq("locale", primaryLoc?.locale ?? "pt")
  .maybeSingle();

const md = contentRow?.content_md ?? "";
const hasPlaceholder = md.includes("{COVER_IMAGE_PLACEHOLDER}");
const hasCoverImg = /!\[Cover image\]\(/i.test(md);
const coverMatch = md.match(/!\[Cover image\]\(([^)]+)\)/);
console.log("\nPrimary content_md cover:");
console.log("  placeholder:", hasPlaceholder);
console.log("  cover img tag:", hasCoverImg);
if (coverMatch) console.log("  src:", coverMatch[1].slice(0, 120));

console.log("\n=== Last 5 posts cover summary ===");
for (const p of posts ?? []) {
  console.log(
    `- ${p.slug} | published=${p.published_at?.slice(0, 10) ?? "—"} | cover=${p.cover_image_path ? "yes" : "NO"} | webhook=${p.webhook_status}`,
  );
}

const tsMatch = latest.cover_image_path?.match(/cover-(\d+)\.jpg/);
if (tsMatch) {
  console.log("\n=== Timeline ===");
  console.log("Post created:", latest.created_at);
  console.log("Published:", latest.published_at);
  console.log("Cover generated:", new Date(Number(tsMatch[1])).toISOString());
  console.log("Webhook sent:", latest.webhook_sent_at);
  console.log("Post updated:", latest.updated_at);
}

const { data: runs } = await sb
  .from("agent_runs")
  .select("created_at, kind, status, error")
  .eq("post_id", latest.id)
  .order("created_at", { ascending: true });
console.log("\n=== Agent runs ===");
for (const r of runs ?? []) {
  console.log(`${r.created_at?.slice(0, 19)} | ${r.kind ?? "?"} | ${r.status} | ${(r.error ?? "").slice(0, 80)}`);
}

if (coverUrl) {
  try {
    const head = await fetch(coverUrl, { method: "HEAD" });
    console.log("\nCover URL HTTP:", head.status, head.headers.get("content-type"));
  } catch (e) {
    console.log("\nCover URL fetch failed:", e instanceof Error ? e.message : e);
  }
}

const { data: prev } = await sb
  .from("posts")
  .select("slug, cover_image_path")
  .eq("author_id", client.user_id)
  .eq("slug", "ai-agents-marketing-sales-2026")
  .maybeSingle();
if (prev?.cover_image_path) {
  const prevUrl = `${url}/storage/v1/object/public/covers/${prev.cover_image_path}`;
  const head2 = await fetch(prevUrl, { method: "HEAD" });
  console.log("\nPrevious post cover HTTP:", prev.slug, head2.status);
}
