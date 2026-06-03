/**
 * Compare author bio in EN/PT/FR content_md for Flow Productions posts.
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

function extractBio(contentMd) {
  const bio =
    contentMd
      .match(/class\s*=\s*["']author-bio["'][^>]*>([\s\S]*?)<\/p>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ")
      .trim() ?? "";
  const job =
    contentMd.match(/class\s*=\s*["']author-job["'][^>]*>([^<]*)/i)?.[1]?.trim() ?? "";
  const heading = contentMd.match(/##\s*([^\n]+)\s*\n[\s\S]*author-block/i)?.[1]?.trim() ?? "";
  return { heading, job, bio: bio.slice(0, 120) };
}

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
  .select("user_id, domain, post_locale")
  .ilike("domain", "%flowproductions%")
  .maybeSingle();

console.log("Client:", client?.domain, "post_locale:", client?.post_locale);

const { data: posts } = await sb
  .from("posts")
  .select("id, slug, primary_locale, published_at")
  .eq("author_id", client.user_id)
  .eq("status", "published")
  .order("published_at", { ascending: false })
  .limit(3);

for (const post of posts ?? []) {
  console.log(`\n=== ${post.slug} (primary_locale=${post.primary_locale}) ===`);
  const { data: locs } = await sb
    .from("post_localizations")
    .select("locale, content_md")
    .eq("post_id", post.id);
  for (const loc of locs ?? []) {
    const { heading, job, bio } = extractBio(loc.content_md ?? "");
    console.log(`[${loc.locale}] heading: ${heading}`);
    console.log(`       job: ${job}`);
    console.log(`       bio: ${bio}...`);
  }
}

// Profile / blog author default bio (DB source)
const { data: profile } = await sb
  .from("profiles")
  .select("display_name, job_title, bio")
  .eq("id", client.user_id)
  .maybeSingle();
console.log("\n=== Account profile (fallback) ===");
console.log(profile?.display_name, profile?.job_title);
console.log((profile?.bio ?? "").slice(0, 150));

const { data: personas } = await sb
  .from("blog_authors")
  .select("display_name, job_title, bio")
  .eq("user_id", client.user_id);
console.log("\n=== Blog authors ===");
for (const p of personas ?? []) {
  console.log(p.display_name, "|", p.job_title);
  console.log("  bio:", (p.bio ?? "").slice(0, 150));
}
