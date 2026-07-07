/**
 * Generate cover + republish via production internal API.
 * Usage: node scripts/fix-post-cover-remote.mjs <postId>
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

const postId = process.argv[2];
if (!postId) {
  console.error("Usage: node scripts/fix-post-cover-remote.mjs <postId>");
  process.exit(1);
}

const cronSecret = process.env.CRON_SECRET;
if (!cronSecret) {
  console.error("Missing CRON_SECRET");
  process.exit(1);
}

const cmsUrl = (process.env.SCHEDULER_APP_URL ?? "https://cms.witflow.co").replace(/\/$/, "");
const res = await fetch(`${cmsUrl}/api/internal/regenerate-cover`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${cronSecret}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ postId, republish: true }),
});

const text = await res.text();
console.log(res.status, text);
if (!res.ok) process.exit(1);
