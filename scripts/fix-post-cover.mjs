/**
 * Generate cover for a post missing cover_image_path and republish webhook.
 * Usage: node scripts/fix-post-cover.mjs <postId>
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
  console.error("Usage: node scripts/fix-post-cover.mjs <postId>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cmsUrl =
  process.env.CMS_PUBLISH_BASE_URL?.replace(/\/$/, "") ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "") ||
  (process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")
    ? "https://cms.witflow.co"
    : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")) ||
  "https://cms.witflow.co";

if (!url || !serviceKey) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { createAgentLlmBundle, coverImageClientsFromLlm, coverVisionClientsFromLlm } = await import("../lib/agent/text-llm.ts");
const { loadCoverReferenceImageParts } = await import("../lib/agent/cover-reference-images.ts");
const { requireCoverReferenceVisionBrief } = await import("../lib/agent/cover-reference-vision.ts");
const { buildCoverInstructionEmbeddingPrefixWithMeta } = await import("../lib/agent/instruction-embeddings.ts");
const { combineClientInstructionsForModel } = await import("../lib/agent/instructions.ts");
const { buildCoverPrompt, truncateCoverImageSubject } = await import("../lib/agent/cover-prompt.ts");
const { generateCoverImageBufferWithEmbedFallback } = await import("../lib/agent/cover-image.ts");
const { resolveClientBrandColors } = await import("../lib/agent/resolve-client-brand-colors.ts");
const { bindAiUsageContext } = await import("../lib/agent/token-usage.ts");

const { data: post } = await admin
  .from("posts")
  .select("id, slug, author_id, primary_locale, cover_image_path, status")
  .eq("id", postId)
  .single();

if (!post) {
  console.error("Post not found");
  process.exit(1);
}
if (post.cover_image_path) {
  console.log("Post already has cover:", post.cover_image_path);
  process.exit(0);
}

const { data: loc } = await admin
  .from("post_localizations")
  .select("title, focus_keyword")
  .eq("post_id", postId)
  .eq("locale", post.primary_locale ?? "en")
  .maybeSingle();

const { data: client } = await admin.from("clients").select("*").eq("user_id", post.author_id).single();
if (!client) {
  console.error("Client not found");
  process.exit(1);
}

bindAiUsageContext({ userId: post.author_id, clientId: client.id, postId: post.id });

console.log("Generating cover for", post.slug, "...");
const llm = createAgentLlmBundle();
const refParts = await loadCoverReferenceImageParts(admin, [
  client.cover_reference_image_1,
  client.cover_reference_image_2,
  client.cover_reference_image_3,
]);

let referenceVisionBrief = null;
if (refParts.length > 0) {
  referenceVisionBrief = await requireCoverReferenceVisionBrief(
    coverVisionClientsFromLlm(llm),
    refParts,
    "[fix-cover] ref-vision",
  );
}

const combinedInstructions = combineClientInstructionsForModel(
  client.custom_instructions,
  client.instruction_reinforcement,
);

const title = loc?.title ?? post.slug;
const keyword = loc?.focus_keyword ?? title;
const coverSubject = truncateCoverImageSubject(
  `Blog hero banner for "${keyword}": rich, topic-specific visuals; distinctive composition.`,
);

const { prefix: coverEmbedPrefix } = await buildCoverInstructionEmbeddingPrefixWithMeta(
  llm.embeddings,
  {
    focusKeywordOrTopic: keyword,
    contentType: "hero",
    locale: post.primary_locale ?? "en",
    hasInternalLinks: false,
  },
  combinedInstructions,
  referenceVisionBrief,
);

const resolvedBrandColors = resolveClientBrandColors({
  domain: client.domain ?? "",
  primary_color: client.primary_color,
  secondary_color: client.secondary_color,
  tertiary_color: client.tertiary_color,
  alternative_color: client.alternative_color,
  colorPaletteText: null,
});

const buffer = await generateCoverImageBufferWithEmbedFallback(coverImageClientsFromLlm(llm), {
  embedPrefix: coverEmbedPrefix,
  basePrompt: buildCoverPrompt(
    coverSubject,
    title.trim().split(/\s+/).slice(0, 4).join(" "),
    {
      primaryColor: resolvedBrandColors.primaryColor,
      secondaryColor: resolvedBrandColors.secondaryColor,
      tertiaryColor: resolvedBrandColors.tertiaryColor,
      alternativeColor: resolvedBrandColors.alternativeColor,
      fontStyle: client.font_style ?? "modern",
      brandVoice: client.brand_voice ?? "professional",
    },
    null,
    { headlineMayBeNonEnglish: true, hasReferenceImages: refParts.length > 0 },
  ),
  logLabel: "[fix-cover]",
  referenceImages: refParts.length ? refParts : undefined,
  referenceVisionBrief,
  guidelinesText: client.brand_guidelines_text ?? null,
  enforcePrimaryInstructionEmbedding: true,
});

if (!buffer) {
  console.error("Cover generation returned no buffer");
  process.exit(1);
}

const coverPath = `${postId}/cover-${Date.now()}.jpg`;
const { error: uploadErr } = await admin.storage
  .from("covers")
  .upload(coverPath, buffer, { contentType: "image/jpeg", upsert: true });

if (uploadErr) {
  console.error("Upload failed:", uploadErr.message);
  process.exit(1);
}

await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", postId);
const { data: urlData } = admin.storage.from("covers").getPublicUrl(coverPath);
console.log("Cover saved:", coverPath);
console.log("Public URL:", urlData?.publicUrl);

if (post.status === "published") {
  const publishUrl = `${cmsUrl.replace(/\/$/, "")}/api/publish/${postId}`;
  console.log("Republishing webhook...", publishUrl);
  const res = await fetch(publishUrl, {
    method: "POST",
    headers: { "x-scheduler-internal": "1" },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Republish failed:", res.status, json);
    process.exit(1);
  }
  console.log("Republish OK:", json);
}

console.log("Done.");
