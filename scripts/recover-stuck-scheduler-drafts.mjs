/**
 * Remove stranded scheduler drafts and force regeneration for affected clients.
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

const forceOnly = process.argv.includes("--force-only");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cronSecret = process.env.CRON_SECRET;
const appUrl = (process.env.SCHEDULER_APP_URL ?? "https://cms.witflow.co").replace(/\/$/, "");

if (!url || !serviceKey) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const strandedSlugRe = /^draft-[0-9a-f]{8}-\d+$/;
const domains = ["witflow.co", "flowproductions.pt", "bizinportugal.com"];

const { data: clients } = await sb
  .from("clients")
  .select("id, user_id, domain")
  .in("domain", domains);

console.log("=== Cleanup stranded drafts ===\n");
if (!forceOnly) {
  for (const client of clients ?? []) {
    const { data: drafts } = await sb
      .from("posts")
      .select("id, slug, post_localizations(id)")
      .eq("author_id", client.user_id)
      .eq("status", "draft");

    for (const draft of drafts ?? []) {
      const locCount = draft.post_localizations?.length ?? 0;
      if (locCount === 0 && strandedSlugRe.test(draft.slug ?? "")) {
        const { error } = await sb.from("posts").delete().eq("id", draft.id);
        console.log(client.domain, draft.slug, error ? `DELETE FAILED: ${error.message}` : "deleted");
      }
    }
  }
  console.log("");
}

if (!cronSecret) {
  console.log("\nNo CRON_SECRET — cleanup done; deploy scheduler fix and run scheduler manually.");
  process.exit(0);
}

console.log("\n=== Force scheduler for affected clients ===\n");
for (const client of clients ?? []) {
  const res = await fetch(`${appUrl}/api/scheduler?force=true&userId=${client.user_id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cronSecret}` },
  });
  const body = await res.text();
  console.log(client.domain, res.status, body.slice(0, 400));
}
