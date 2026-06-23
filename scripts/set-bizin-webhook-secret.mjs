/**
 * Generate and store webhook secret for Bizin client.
 * Usage: node scripts/set-bizin-webhook-secret.mjs
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
  console.error("Missing Supabase env");
  process.exit(1);
}

const secret = crypto.randomBytes(32).toString("hex");

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await sb
  .from("clients")
  .update({ webhook_secret: secret, updated_at: new Date().toISOString() })
  .eq("domain", "bizinportugal.com")
  .select("domain, webhook_url")
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log("Saved webhook secret for:", data.domain);
console.log("Webhook URL:", data.webhook_url);
console.log("");
console.log("Add this to Bizin site (Vercel env):");
console.log("CMS_WEBHOOK_SECRET=" + secret);
console.log("");
console.log("(Also usable as CMS webhook secret in Admin if you need to re-copy later.)");
