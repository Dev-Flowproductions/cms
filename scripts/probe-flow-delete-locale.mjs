/**
 * Try Flow delete webhook with locale / translation / repeat variants.
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

const postId = "c74e24c7-cd35-4a66-ad44-c547cff515b4";
const slug = "augmented-reality-marketing-2026";

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: client } = await sb
  .from("clients")
  .select("id, webhook_url, webhook_secret")
  .ilike("domain", "%flowproductions%")
  .single();

async function cardStats() {
  const html = await fetch(`https://flowproductions.pt/en/blog?t=${Date.now()}`).then((r) => r.text());
  const chunks = html.split(`href="/en/blog/${slug}"`);
  let gray = 0;
  let withCover = 0;
  for (let i = 1; i < chunks.length; i++) {
    const c = chunks[i].slice(0, 500);
    if (c.includes("bg-gray-200")) gray++;
    else if (c.includes("_next/image") || c.includes("supabase.co")) withCover++;
  }
  return { total: chunks.length - 1, gray, withCover };
}

async function sendDelete(label, extra) {
  const payload = {
    event: "cms.post.deleted",
    siteId: client.id,
    action: "delete",
    slug,
    post: { id: postId, slug, status: "deleted", updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    signatureVersion: "v1",
    ...extra,
  };
  const body = JSON.stringify(payload);
  const sig = crypto.createHmac("sha256", client.webhook_secret).update(body).digest("hex");
  const res = await fetch(client.webhook_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cms-signature": sig,
      "x-cms-timestamp": new Date().toISOString(),
      "x-cms-event": "cms.post.deleted",
      "x-webhook-secret": client.webhook_secret,
    },
    body,
  });
  const text = await res.text();
  console.log(label, res.status, text, "→", await cardStats());
}

console.log("Start:", await cardStats());

const attempts = [
  ["locale en", { locale: "en" }],
  ["locale pt", { locale: "pt" }],
  ["locale fr", { locale: "fr" }],
  ["post.locale en", { post: { id: postId, slug, locale: "en", status: "deleted" } }],
  ["allLocales", { allLocales: true }],
  ["purgeDuplicates", { purgeDuplicates: true }],
  ["deleteOrphans", { deleteOrphans: true }],
  ["indexOnly", { indexOnly: true }],
  ["repeat slug 1", {}],
  ["repeat slug 2", {}],
  ["repeat slug 3", {}],
];

for (const [label, extra] of attempts) {
  await sendDelete(label, extra);
  await new Promise((r) => setTimeout(r, 2000));
}

console.log("End:", await cardStats());
