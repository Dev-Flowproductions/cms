/**
 * Probe Flow delete webhook payload variants for orphan duplicate cards.
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

function send(label, payload) {
  const body = JSON.stringify(payload);
  const sig = crypto.createHmac("sha256", client.webhook_secret).update(body).digest("hex");
  return fetch(client.webhook_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cms-signature": sig,
      "x-cms-timestamp": new Date().toISOString(),
      "x-cms-event": "cms.post.deleted",
      "x-webhook-secret": client.webhook_secret,
    },
    body,
  }).then(async (r) => ({ label, status: r.status, text: await r.text() }));
}

async function cardStats() {
  const html = await fetch(`https://flowproductions.pt/en/blog?t=${Date.now()}`).then((r) => r.text());
  const chunks = html.split(`href="/en/blog/${slug}"`);
  let june23 = 0;
  let june25 = 0;
  for (let i = 1; i < chunks.length; i++) {
    const c = chunks[i].slice(0, 800);
    if (c.includes("23 June 2026")) june23++;
    if (c.includes("25 June 2026")) june25++;
  }
  return { total: chunks.length - 1, june23, june25 };
}

console.log("Before:", await cardStats());

const variants = [
  ["slug only", { event: "cms.post.deleted", siteId: client.id, action: "delete", slug }],
  ["id only", { event: "cms.post.deleted", siteId: client.id, action: "delete", post: { id: postId } }],
  ["slug + publishedAt 23", { event: "cms.post.deleted", siteId: client.id, action: "delete", slug, publishedAt: "2026-06-23T13:24:03.919+00:00" }],
  ["post id + slug", { event: "cms.post.deleted", siteId: client.id, action: "delete", slug, post: { id: postId, slug, status: "deleted", updatedAt: new Date().toISOString() } }],
];

for (const [label, payload] of variants) {
  const res = await send(label, { ...payload, timestamp: new Date().toISOString(), signatureVersion: "v1" });
  console.log(res.label, res.status, res.text);
  await new Promise((r) => setTimeout(r, 2000));
  console.log("  stats:", await cardStats());
}
