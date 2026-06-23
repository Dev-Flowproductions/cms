/**
 * Try multiple auth header patterns against Bizin webhook.
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

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: client } = await sb
  .from("clients")
  .select("id, webhook_url, webhook_secret")
  .eq("domain", "bizinportugal.com")
  .single();

const url = client.webhook_url;
const secret = client.webhook_secret;
const payload = {
  event: "post.published",
  siteId: client.id,
  post: { id: "probe", slug: "probe", status: "published", updatedAt: new Date().toISOString() },
  timestamp: new Date().toISOString(),
  signatureVersion: "v1",
};
const body = JSON.stringify(payload);
const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");

const tests = [
  ["x-webhook-secret only", { "Content-Type": "application/json", "x-webhook-secret": secret }],
  ["Authorization Bearer", { "Content-Type": "application/json", Authorization: `Bearer ${secret}` }],
  ["x-cms-signature only", { "Content-Type": "application/json", "x-cms-signature": sig, "x-cms-event": "post.published" }],
  ["CMS full (publish route)", {
    "Content-Type": "application/json",
    "x-cms-signature": sig,
    "x-cms-timestamp": new Date().toISOString(),
    "x-cms-event": "post.published",
    "x-webhook-secret": secret,
  }],
];

console.log("URL:", url);
console.log("Secret length:", secret?.length);
console.log("");

for (const [name, headers] of tests) {
  const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(15000) });
  const text = (await res.text()).slice(0, 120);
  console.log(`${name}: ${res.status} ${text}`);
}
