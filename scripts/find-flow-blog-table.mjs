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

const tables = [
  "blog_posts",
  "posts_index",
  "site_posts",
  "webhook_posts",
  "cms_posts",
  "published_posts",
  "blog_entries",
];

for (const table of tables) {
  const { data, error } = await sb.from(table).select("*").ilike("slug", "%augmented%").limit(5);
  if (!error && data?.length) {
    console.log(`TABLE ${table}:`, JSON.stringify(data, null, 2));
  } else if (error) {
    console.log(`TABLE ${table}:`, error.code, error.message.slice(0, 80));
  }
}

// Try RPC or search posts with flow domain
const { data: clients } = await sb.from("clients").select("id, domain, webhook_url").ilike("domain", "%flow%");
console.log("clients:", clients);
