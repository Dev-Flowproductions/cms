/**
 * Backfill FAQ section headings to match each localization's locale.
 *
 * Usage:
 *   node scripts/normalize-faq-headings.mjs           # dry run
 *   node scripts/normalize-faq-headings.mjs --apply   # write updates
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (.env.local).
 */
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

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

const FAQ_HEADING_BY_LOCALE = {
  en: "## Frequently asked questions",
  pt: "## Perguntas frequentes",
  fr: "## Questions fréquentes",
};

const FAQ_HEADING_PATTERNS = [
  /^##\s*Perguntas frequentes\s*$/gim,
  /^##\s*Frequently asked questions\s*$/gim,
  /^##\s*Questions fréquentes\s*$/gim,
  /^##\s*FAQ\s*$/gim,
];

function normalizeFaqHeading(contentMd, locale) {
  const target = FAQ_HEADING_BY_LOCALE[locale] ?? FAQ_HEADING_BY_LOCALE.en;
  for (const pattern of FAQ_HEADING_PATTERNS) {
    const updated = contentMd.replace(pattern, target);
    if (updated !== contentMd) return updated;
  }
  return contentMd;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes("--apply");

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: rows, error } = await supabase
  .from("post_localizations")
  .select("post_id, locale, content_md");

if (error) {
  console.error("Fetch failed:", error.message);
  process.exit(1);
}

let changed = 0;

for (const row of rows ?? []) {
  const content = row.content_md ?? "";
  if (!content.includes("##")) continue;

  const next = normalizeFaqHeading(content, row.locale);
  if (next === content) continue;

  changed += 1;
  console.log(`[${apply ? "UPDATE" : "DRY-RUN"}] post=${row.post_id} locale=${row.locale}`);

  if (apply) {
    const { error: updateErr } = await supabase
      .from("post_localizations")
      .update({ content_md: next })
      .eq("post_id", row.post_id)
      .eq("locale", row.locale);

    if (updateErr) {
      console.error("  failed:", updateErr.message);
    }
  }
}

console.log(`\nDone. ${changed} localization(s) ${apply ? "updated" : "would be updated"}.`);
if (!apply && changed > 0) {
  console.log("Re-run with --apply to write changes.");
}
