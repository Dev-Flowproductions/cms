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

const secret = process.env.CRON_SECRET;
const base = process.env.SCHEDULER_TEST_URL ?? "http://localhost:3000";
const userId = process.env.SCHEDULER_TEST_USER_ID ?? "2dc0ae1a-5543-4551-b9dd-07252ecf3243";
const runForce = process.argv.includes("--force");

async function req(method, url, auth) {
  const r = await fetch(url, {
    method,
    headers: auth ? { Authorization: `Bearer ${auth}` } : {},
  });
  const text = await r.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: r.status, body };
}

console.log("=== 1. Health GET /api/scheduler ===");
const health = await req("GET", `${base}/api/scheduler`);
console.log("status:", health.status);
console.log(JSON.stringify(health.body, null, 2));

if (!secret) {
  console.error("CRON_SECRET missing in .env.local");
  process.exit(1);
}

console.log("\n=== 2. Due check POST (no force) ===");
const due = await req("POST", `${base}/api/scheduler`, secret);
console.log("status:", due.status);
console.log(JSON.stringify(due.body, null, 2));

if (runForce) {
  console.log(`\n=== 3. Force POST userId=${userId} ===`);
  const forced = await req(
    "POST",
    `${base}/api/scheduler?userId=${encodeURIComponent(userId)}&force=true`,
    secret,
  );
  console.log("status:", forced.status);
  console.log(JSON.stringify(forced.body, null, 2));
} else {
  console.log("\n(Skipping force run — pass --force to generate for test user)");
}
