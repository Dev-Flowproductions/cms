/**
 * Diagnose Bizin webhook 401 — compare CMS secret vs site response.
 */
import fs from "fs";
import crypto from "crypto";

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
  .select("id, user_id, domain, webhook_url, webhook_secret, webhook_event_format, cms_api_key")
  .eq("domain", "bizinportugal.com")
  .maybeSingle();

if (!client) {
  console.error("Bizin client not found");
  process.exit(1);
}

console.log("=== Bizin webhook config ===");
console.log("URL:", client.webhook_url);
console.log("Secret configured:", Boolean(client.webhook_secret?.trim()));
console.log("Secret length:", client.webhook_secret?.length ?? 0);
console.log("Event format:", client.webhook_event_format ?? "spec (default)");
console.log("CMS API key set:", Boolean(client.cms_api_key?.trim()));

const { data: posts } = await sb
  .from("posts")
  .select("id, slug, status, webhook_status, webhook_error")
  .eq("author_id", client.user_id)
  .in("status", ["review", "published"])
  .order("updated_at", { ascending: false })
  .limit(5);

console.log("\n=== Recent posts ===");
for (const p of posts ?? []) {
  console.log(p.slug, p.status, p.webhook_status, (p.webhook_error ?? "").slice(0, 80));
}

if (!client.webhook_url) {
  console.log("\nNo webhook URL configured.");
  process.exit(0);
}

// Test 1: no auth
const noAuth = await fetch(client.webhook_url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ test: true }),
  signal: AbortSignal.timeout(15_000),
});
console.log("\n=== Webhook probe (no secret) ===");
console.log("Status:", noAuth.status, (await noAuth.text()).slice(0, 100));

if (!client.webhook_secret?.trim()) {
  console.log("\nCMS has NO webhook_secret — site likely requires one. Set secret in Admin → Users → Bizin → Webhook.");
  process.exit(0);
}

// Test 2: with CMS headers (same as publish route)
const payload = {
  event: "post.published",
  siteId: client.id,
  post: { id: "test", slug: "test", status: "published", updatedAt: new Date().toISOString() },
  timestamp: new Date().toISOString(),
  signatureVersion: "v1",
};
const body = JSON.stringify(payload);
const signature = crypto.createHmac("sha256", client.webhook_secret).update(body).digest("hex");
const withSecret = await fetch(client.webhook_url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-cms-signature": signature,
    "x-cms-timestamp": new Date().toISOString(),
    "x-cms-event": "post.published",
    "x-webhook-secret": client.webhook_secret,
  },
  body,
  signal: AbortSignal.timeout(15_000),
});
console.log("\n=== Webhook probe (CMS headers + secret) ===");
console.log("Status:", withSecret.status, (await withSecret.text()).slice(0, 200));

if (withSecret.status === 401) {
  console.log(`
Likely cause: CMS_WEBHOOK_SECRET on bizinportugal.com does NOT match the secret stored in CMS Admin.
Fix: copy the exact Webhook secret from CMS Admin (Users → Bizin) into the Bizin site's env and redeploy.
`);
} else if (withSecret.ok) {
  console.log("\nWebhook auth OK with current CMS secret — retry Publish to website.");
}
