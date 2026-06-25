/**
 * Inspect latest Witflow post cover state.
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: clients } = await sb
  .from("clients")
  .select(
    "id, user_id, domain, company_name, brand_name, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_text",
  )
  .or("domain.ilike.%witflow%,company_name.ilike.%witflow%,brand_name.ilike.%witflow%");

const client =
  clients?.find((c) => (c.domain ?? "").toLowerCase().includes("witflow")) ?? clients?.[0];

if (!client) {
  console.error("Witflow client not found");
  process.exit(1);
}

console.log("Client:", client.domain, client.user_id);
console.log(
  "Reference images:",
  [client.cover_reference_image_1, client.cover_reference_image_2, client.cover_reference_image_3].filter(Boolean).length,
);

const { data: posts, error } = await sb
  .from("posts")
  .select(
    "id, slug, status, created_at, published_at, updated_at, cover_image_path, webhook_status, webhook_error, webhook_sent_at, primary_locale",
  )
  .eq("author_id", client.user_id)
  .order("created_at", { ascending: false })
  .limit(8);

if (error) {
  console.error(error.message);
  process.exit(1);
}

const latest = posts?.[0];
if (!latest) {
  console.log("No posts");
  process.exit(0);
}

console.log("\n=== Latest post (by created_at) ===");
console.log(JSON.stringify(latest, null, 2));

const { data: locs } = await sb
  .from("post_localizations")
  .select("locale, title, seo_score")
  .eq("post_id", latest.id);

console.log("\nLocalizations:", locs);

if (latest.cover_image_path) {
  const { data: urlData } = sb.storage.from("covers").getPublicUrl(latest.cover_image_path);
  console.log("\nCover path:", latest.cover_image_path);
  console.log("Cover public URL:", urlData?.publicUrl ?? null);
} else {
  console.log("\nNO cover_image_path on post");
}

const primaryLoc = locs?.find((l) => l.locale === (latest.primary_locale ?? "pt")) ?? locs?.[0];
const { data: contentRow } = await sb
  .from("post_localizations")
  .select("content_md")
  .eq("post_id", latest.id)
  .eq("locale", primaryLoc?.locale ?? "pt")
  .maybeSingle();

const md = contentRow?.content_md ?? "";
console.log("\nPrimary content_md cover:");
console.log("  placeholder:", md.includes("{COVER_IMAGE_PLACEHOLDER}"));
console.log("  cover img tag:", /!\[Cover image\]\(/i.test(md));

console.log("\n=== Last 8 posts cover summary ===");
for (const p of posts ?? []) {
  console.log(
    `- ${p.created_at?.slice(0, 10)} ${p.slug} | cover=${p.cover_image_path ? "yes" : "NO"} | status=${p.status} | pub=${p.published_at?.slice(0, 10) ?? "—"}`,
  );
}

const { data: runs } = await sb
  .from("agent_runs")
  .select("created_at, status, model, error, input, output")
  .eq("post_id", latest.id)
  .order("created_at", { ascending: true });

console.log("\n=== Agent runs ===");
for (const r of runs ?? []) {
  const out = r.output;
  const coverDesc =
    out && typeof out === "object" && "cover_image_description" in out
      ? String(out.cover_image_description).slice(0, 60)
      : "";
  console.log(
    `${r.created_at?.slice(0, 19)} | ${r.status} | ${r.model ?? "?"} | err=${(r.error ?? "").slice(0, 100)} | coverDesc=${coverDesc}`,
  );
}

const { data: tokens } = await sb
  .from("ai_token_usage")
  .select("created_at, operation, assistant, model, total_tokens, error, metadata")
  .eq("post_id", latest.id)
  .order("created_at", { ascending: true });

console.log("\n=== AI token usage (image/cover) ===");
for (const t of tokens ?? []) {
  if (t.assistant?.includes("cover") || t.operation === "image" || t.assistant === "cover_image") {
    console.log(
      `${t.created_at?.slice(0, 19)} | ${t.assistant} | ${t.operation} | ${t.model} | err=${t.error ?? ""}`,
    );
  }
}

const noCoverCount = (posts ?? []).filter((p) => !p.cover_image_path).length;
console.log(`\nPosts without cover in last 8: ${noCoverCount}/${posts?.length ?? 0}`);

const { data: clientMeta } = await sb
  .from("clients")
  .select("last_generation_error, last_generation_error_at, last_post_generated_at")
  .eq("id", client.id)
  .single();
console.log("\nClient generation meta:", clientMeta);

const { data: allTokens } = await sb
  .from("ai_token_usage")
  .select("created_at, assistant, operation, model, error, total_tokens")
  .eq("post_id", latest.id)
  .order("created_at", { ascending: true });
console.log(`\n=== All AI token usage (${allTokens?.length ?? 0} rows) ===`);
for (const t of allTokens ?? []) {
  console.log(
    `${t.created_at?.slice(0, 19)} | ${t.assistant} | ${t.operation} | ${t.model} | tokens=${t.total_tokens} | err=${t.error ?? ""}`,
  );
}

console.log("\n=== First agent run cover fields ===");
const firstRun = runs?.[0];
if (firstRun?.output && typeof firstRun.output === "object") {
  const o = firstRun.output;
  for (const k of ["cover_image_description", "cover_image_headline", "title", "focus_keyword"]) {
    if (k in o) console.log(`  ${k}:`, String(o[k]).slice(0, 120));
  }
}

console.log("\n=== Timeline ===");
console.log("Post created:", latest.created_at);
console.log("Published:", latest.published_at);
console.log("Last agent run:", runs?.[runs.length - 1]?.created_at);
console.log("Note: scheduler publishes BEFORE cover gen; cover runs after publish.");
