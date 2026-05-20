/**
 * Applies clients_frequency_check so "every3days" is allowed.
 *
 * Option A (recommended): Supabase Dashboard → SQL Editor → paste scripts/apply-frequency-every3days.sql
 *
 * Option B: Management API (personal access token with database:write):
 *   SUPABASE_ACCESS_TOKEN=... node scripts/apply-frequency-every3days.mjs
 *
 * Token: https://supabase.com/dashboard/account/tokens
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "lltufugrmmzdagqypscg";
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "apply-frequency-every3days.sql");
const query = fs.readFileSync(sqlPath, "utf8");

async function main() {
  if (!token) {
    console.error(
      "Set SUPABASE_ACCESS_TOKEN, or run the SQL file in the Supabase SQL Editor.",
    );
    console.error(`SQL file: ${sqlPath}`);
    process.exit(1);
  }

  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Management API error:", res.status, text);
    process.exit(1);
  }

  console.log("Migration applied. clients_frequency_check now allows every3days.");
  if (text) console.log(text);
}

main();
