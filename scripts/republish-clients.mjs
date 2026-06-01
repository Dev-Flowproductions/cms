/**
 * Re-publish published posts for specific client domains (webhook refresh).
 *
 * Usage:
 *   node scripts/republish-clients.mjs witflow flow
 *   node scripts/republish-clients.mjs --dry-run witflow
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

const dryRun = process.argv.includes("--dry-run");
const domainFilters = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (!domainFilters.length) {
  console.error("Usage: node scripts/republish-clients.mjs [--dry-run] <domain-substring> [...]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "") ||
  "https://cms.witflow.co";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: clients, error: clientErr } = await sb
  .from("clients")
  .select("id, user_id, domain, webhook_url")
  .not("webhook_url", "is", null);

if (clientErr) {
  console.error(clientErr.message);
  process.exit(1);
}

const matched = (clients ?? []).filter((c) => {
  const d = (c.domain ?? "").toLowerCase();
  return domainFilters.some((f) => d.includes(f.toLowerCase()));
});

if (!matched.length) {
  console.log("No clients matched:", domainFilters.join(", "));
  process.exit(0);
}

console.log(`CMS: ${appUrl}`);
console.log(`Clients: ${matched.map((c) => c.domain || c.id).join(", ")}\n`);

let ok = 0;
let fail = 0;

for (const client of matched) {
  const { data: posts, error: postErr } = await sb
    .from("posts")
    .select("id, slug, status, webhook_status")
    .eq("author_id", client.user_id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (postErr) {
    console.error(`Posts query failed for ${client.domain}:`, postErr.message);
    continue;
  }

  console.log(`[${client.domain}] ${posts?.length ?? 0} published post(s)`);

  for (const post of posts ?? []) {
    const label = `${client.domain} / ${post.slug} (${post.id})`;
    if (dryRun) {
      console.log(`  DRY-RUN ${label}`);
      ok += 1;
      continue;
    }

    try {
      const res = await fetch(`${appUrl}/api/publish/${post.id}`, {
        method: "POST",
        headers: { "x-scheduler-internal": "1" },
        signal: AbortSignal.timeout(60_000),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`  OK ${label}`);
        ok += 1;
      } else {
        console.log(`  FAIL ${label} — ${res.status}: ${body.error ?? res.statusText}`);
        fail += 1;
      }
    } catch (e) {
      console.log(`  FAIL ${label} — ${e instanceof Error ? e.message : e}`);
      fail += 1;
    }
  }
}

console.log(`\nDone. ${ok} ok, ${fail} failed${dryRun ? " (dry run)" : ""}.`);
