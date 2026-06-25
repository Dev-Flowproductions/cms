/**
 * Remove Flow AR duplicates: delete until one or fewer index links, then single publish.
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

function legacyHeaders(body, secret, event) {
  const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return {
    "Content-Type": "application/json",
    "x-cms-signature": sig,
    "x-cms-timestamp": new Date().toISOString(),
    "x-cms-event": event,
    "x-webhook-secret": secret,
  };
}

async function slugLinkCount() {
  const html = await fetch(`https://flowproductions.pt/en/blog?t=${Date.now()}`).then((r) => r.text());
  return (html.match(new RegExp(`/en/blog/${slug}`, "g")) ?? []).length;
}

async function grayCardCount() {
  const html = await fetch(`https://flowproductions.pt/en/blog?t=${Date.now()}`).then((r) => r.text());
  const chunks = html.split(`href="/en/blog/${slug}"`);
  let gray = 0;
  let withCover = 0;
  for (let i = 1; i < chunks.length; i++) {
    const c = chunks[i].slice(0, 500);
    if (c.includes("bg-gray-200")) gray++;
    else if (c.includes("_next/image") || c.includes("supabase.co")) withCover++;
  }
  return { gray, withCover, total: chunks.length - 1 };
}

const { data: client } = await sb
  .from("clients")
  .select("id, webhook_url, webhook_secret")
  .ilike("domain", "%flowproductions%")
  .single();

console.log("Before:", await grayCardCount(), "links:", await slugLinkCount());

for (let i = 0; i < 10; i++) {
  const deletePayload = {
    event: "cms.post.deleted",
    siteId: client.id,
    action: "delete",
    slug,
    post: { id: postId, slug, status: "deleted", updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    signatureVersion: "v1",
  };
  const deleteBody = JSON.stringify(deletePayload);
  const res = await fetch(client.webhook_url, {
    method: "POST",
    headers: legacyHeaders(deleteBody, client.webhook_secret, "cms.post.deleted"),
    body: deleteBody,
  });
  const text = await res.text();
  console.log(`Delete ${i + 1}:`, text);
  await new Promise((r) => setTimeout(r, 2500));
  const stats = await grayCardCount();
  console.log("  cards:", stats);
  if (text.includes("not_found") && stats.total <= 1) break;
  if (stats.total === 0) break;
}

await sb.from("posts").update({ webhook_status: null }).eq("id", postId);
const pub = await fetch(`https://cms.witflow.co/api/publish/${postId}`, {
  method: "POST",
  headers: { "x-scheduler-internal": "1" },
});
console.log("Publish:", pub.status, await pub.json());

await new Promise((r) => setTimeout(r, 5000));
console.log("After:", await grayCardCount(), "links:", await slugLinkCount());
