/**
 * Backfill translated author job title + bio on non-primary post localizations.
 *
 * Usage:
 *   node scripts/retranslate-author-bios.mjs           # dry run
 *   node scripts/retranslate-author-bios.mjs --apply  # write updates
 *   node scripts/retranslate-author-bios.mjs --apply --post-id=<uuid>
 *
 * Requires OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import fs from "fs";
import OpenAI from "openai";

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

const ABOUT_AUTHOR = {
  en: "About the author",
  pt: "Sobre o autor",
  fr: "À propos de l'auteur",
};

const AUTHOR_DIV_RE =
  /<div[^>]*(?:\bid\s*=\s*["']author-block["']|\sclass\s*=\s*["'][^"']*author-block[^"']*["'])[^>]*>[\s\S]*?<\/div>/gi;

function stripAuthorBlocks(contentMd) {
  let s = contentMd;
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(AUTHOR_DIV_RE, "");
    for (const heading of Object.values(ABOUT_AUTHOR)) {
      const re = new RegExp(
        `(?:^|\\n)#{1,3}\\s*(?:\\*\\*)?\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(?:\\*\\*)?\\s*\\n[\\s\\S]*?(?=\\n#{1,3}\\s|$)`,
        "gi",
      );
      s = s.replace(re, "");
    }
  }
  return s.trimEnd();
}

function extractAuthor(contentMd) {
  const name =
    contentMd.match(/class\s*=\s*["']author-name["'][^>]*>([^<]*)/i)?.[1]?.trim() ?? "";
  const job =
    contentMd.match(/class\s*=\s*["']author-job["'][^>]*>([^<]*)/i)?.[1]?.trim() ?? "";
  const bio =
    contentMd
      .match(/class\s*=\s*["']author-bio["'][^>]*>([\s\S]*?)<\/p>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ")
      .trim() ?? "";
  return { name, job, bio };
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function appendAuthorBlock(contentMd, locale, author) {
  if (!author.name) return contentMd;
  const heading = ABOUT_AUTHOR[locale] ?? ABOUT_AUTHOR.en;
  const avatarUrl = author.avatarUrl?.trim();
  const initial = author.name.charAt(0).toUpperCase();
  const avatarInner = avatarUrl
    ? `<img src="${esc(avatarUrl)}" alt="${esc(author.name)}" width="56" height="56" />`
    : `<span class="author-initial" aria-hidden="true">${esc(initial)}</span>`;
  const avatarHtml = `<div class="author-avatar">${avatarInner}</div>`;
  const nameHtml = `<p class="author-name">${esc(author.name)}</p>`;
  const jobHtml = author.job ? `<p class="author-job">${esc(author.job)}</p>` : "";
  const bioHtml = author.bio ? `<p class="author-bio">${esc(author.bio)}</p>` : "";
  const block = `\n\n## ${heading}\n\n<div id="author-block" class="author-block"><div class="author-block-header">${avatarHtml}<div class="author-block-titles">${nameHtml}${jobHtml}</div></div>${bioHtml}</div>`;
  return `${stripAuthorBlocks(contentMd).trimEnd()}${block}`;
}

const localeName = { en: "English", pt: "Portuguese", fr: "French" };

async function translateAuthorFields(openai, toLocale, author) {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `Detect the language of the job title and bio below. Translate them into ${localeName[toLocale] ?? toLocale}.
Keep the display name unchanged if it is a person's name or brand. Translate job title and bio fully.

Name: ${author.name}
Job title: ${author.job}
Bio: ${author.bio}

Return JSON: {"author_job_title":"...","author_bio":"..."}`,
      },
    ],
  });
  const text = res.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text);
  return {
    name: author.name,
    job: parsed.author_job_title?.trim() || author.job,
    bio: parsed.author_bio?.trim() || author.bio,
    avatarUrl: author.avatarUrl,
  };
}

const apply = process.argv.includes("--apply");
const postIdFilter = process.argv.find((a) => a.startsWith("--post-id="))?.slice("--post-id=".length);
const domainFilter = process.argv.find((a) => a.startsWith("--domain="))?.slice("--domain=".length);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!url || !serviceKey || !openaiKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OPENAI_API_KEY");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const openai = new OpenAI({ apiKey: openaiKey });

let authorIdFilter = null;
if (domainFilter) {
  const { data: client } = await sb
    .from("clients")
    .select("user_id")
    .ilike("domain", `%${domainFilter}%`)
    .maybeSingle();
  authorIdFilter = client?.user_id ?? null;
  if (!authorIdFilter) {
    console.error("No client matched domain:", domainFilter);
    process.exit(1);
  }
}

let query = sb
  .from("posts")
  .select("id, author_id, primary_locale, post_localizations(locale, content_md)")
  .eq("status", "published");

if (postIdFilter) query = query.eq("id", postIdFilter);
if (authorIdFilter) query = query.eq("author_id", authorIdFilter);

const { data: posts, error } = await query;
if (error) {
  console.error(error.message);
  process.exit(1);
}

let updated = 0;

for (const post of posts ?? []) {
  const locs = post.post_localizations ?? [];
  if (!locs.length) continue;

  const { data: profile } = await sb
    .from("profiles")
    .select("display_name, job_title, bio, avatar_url")
    .eq("id", post.author_id)
    .maybeSingle();
  if (!profile?.display_name?.trim()) continue;

  const canonical = {
    name: profile.display_name.trim(),
    job: profile.job_title?.trim() ?? "",
    bio: profile.bio?.trim() ?? "",
    avatarUrl: profile.avatar_url?.trim() ?? null,
  };
  if (!canonical.bio && !canonical.job) continue;

  const avatarMatch = locs
    .map((l) => l.content_md?.match(/class\s*=\s*["']author-avatar["'][^>]*>[\s\S]*?<img[^>]+src\s*=\s*["']([^"']+)["']/i)?.[1])
    .find(Boolean);
  if (avatarMatch) canonical.avatarUrl = avatarMatch;

  for (const loc of locs) {
    const current = extractAuthor(loc.content_md ?? "");
    const translated = await translateAuthorFields(openai, loc.locale, canonical);
    if (translated.bio === current.bio && translated.job === current.job) continue;

    console.log(`[${apply ? "UPDATE" : "DRY-RUN"}] post=${post.id} locale=${loc.locale}`);
    const nextMd = appendAuthorBlock(stripAuthorBlocks(loc.content_md ?? ""), loc.locale, translated);
    if (apply) {
      const { error: updateErr } = await sb
        .from("post_localizations")
        .update({ content_md: nextMd })
        .eq("post_id", post.id)
        .eq("locale", loc.locale);
      if (updateErr) console.error("  failed:", updateErr.message);
    }
    updated += 1;
  }
}

console.log(`\nDone. ${updated} localization(s) ${apply ? "updated" : "would be updated"}.`);
if (!apply && updated > 0) console.log("Re-run with --apply to write changes.");
