/**
 * Fix Bizin webhook URL and republish review posts.
 * Usage: node scripts/fix-bizin-publish.mjs [--apply]
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

const apply = process.argv.includes("--apply");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://cms.witflow.co";
const fixedWebhook = "https://bizinportugal.com/api/cms-webhook";

if (!url || !serviceKey) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: client } = await sb
  .from("clients")
  .select("id, user_id, domain, webhook_url, auto_publish, last_generation_error")
  .eq("domain", "bizinportugal.com")
  .maybeSingle();

if (!client) {
  console.error("Bizin client not found");
  process.exit(1);
}

console.log("Current webhook:", client.webhook_url);
console.log("Fixed webhook:  ", fixedWebhook);
console.log("auto_publish:", client.auto_publish);
console.log("last_generation_error:", client.last_generation_error);

const { data: posts } = await sb
  .from("posts")
  .select("id, slug, status, webhook_status, webhook_error")
  .eq("author_id", client.user_id)
  .eq("status", "review");

console.log("\nReview posts:", posts);

if (!apply) {
  console.log("\nDry run. Re-run with --apply to update webhook and republish.");
  process.exit(0);
}

const { error: whErr } = await sb
  .from("clients")
  .update({ webhook_url: fixedWebhook, updated_at: new Date().toISOString() })
  .eq("id", client.id);
if (whErr) {
  console.error("Webhook update failed:", whErr.message);
  process.exit(1);
}
console.log("\nWebhook URL updated.");

for (const post of posts ?? []) {
  const res = await fetch(`${appUrl}/api/publish/${post.id}`, {
    method: "POST",
    headers: { "x-scheduler-internal": "1" },
    signal: AbortSignal.timeout(60_000),
  });
  const body = await res.json().catch(() => ({}));
  console.log(
    res.ok ? "OK" : "FAIL",
    post.slug,
    res.status,
    body.error ?? body.success ?? "",
  );
}
