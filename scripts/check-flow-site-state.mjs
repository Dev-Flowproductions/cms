/**
 * Find all Flow posts including non-published; check blog index duplicates theory.
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

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const uid = "2dc0ae1a-5543-4551-b9dd-07252ecf3243";

const { data: all } = await sb
  .from("posts")
  .select("id, slug, status, created_at, cover_image_path, webhook_sent_at, published_at")
  .eq("author_id", uid)
  .order("created_at", { ascending: false });

console.log("Total posts in CMS:", all?.length);
const ar = (all ?? []).filter((p) => p.slug.includes("augmented"));
console.log("AR slugs:", ar);

const { data: client } = await sb
  .from("clients")
  .select("webhook_url, webhook_secret, webhook_event_format, id")
  .eq("user_id", uid)
  .single();

console.log("Webhook:", client?.webhook_url, "format:", client?.webhook_event_format);

// Fetch blog HTML and count AR list items
const html = await fetch("https://flowproductions.pt/en/blog").then((r) => r.text());
const title = "How Augmented Reality is Shaping Marketing Strategies in 2026";
const count = html.split(title).length - 1;
console.log("AR title occurrences on blog index HTML:", count);

// Check if article page has og:image / cover
const articleHtml = await fetch("https://flowproductions.pt/en/blog/augmented-reality-marketing-2026").then((r) => r.text());
const ogMatch = articleHtml.match(/property="og:image"\s+content="([^"]+)"/);
const heroImg = articleHtml.match(/cover_image|cover-image|hero.*img/i);
console.log("og:image:", ogMatch?.[1] ?? "NOT FOUND");
console.log("cover hints in HTML:", heroImg ? "found" : "none");
