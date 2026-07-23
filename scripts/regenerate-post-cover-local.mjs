/**
 * Regenerate cover for a post (even if one exists) using local agent code, then republish.
 * Usage: node scripts/regenerate-post-cover-local.mjs <postId>
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
  console.error("Usage: node scripts/regenerate-post-cover-local.mjs <postId>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cmsUrl =
  process.env.CMS_PUBLISH_BASE_URL?.replace(/\/$/, "") ||
  process.env.SCHEDULER_APP_URL?.replace(/\/$/, "") ||
  "https://cms.witflow.co";

if (!url || !serviceKey) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { createAgentLlmBundle, coverImageClientsFromLlm, coverVisionClientsFromLlm } = await import(
  "../lib/agent/text-llm.ts",
);
const { loadCoverReferenceImageParts } = await import("../lib/agent/cover-reference-images.ts");
const { buildCoverReferenceVisionBriefWithTimeout } = await import("../lib/agent/cover-reference-vision.ts");
const { buildCoverInstructionEmbeddingPrefixWithMeta } = await import("../lib/agent/instruction-embeddings.ts");
const { combineClientInstructionsForModel } = await import("../lib/agent/instructions.ts");
const { buildCoverPrompt, truncateCoverImageSubject } = await import("../lib/agent/cover-prompt.ts");
const { clientDisallowsCoverOnImageText } = await import("../lib/agent/cover-text-policy.ts");
const { generateCoverImageBufferWithEmbedFallback } = await import("../lib/agent/cover-image.ts");
const { resolveClientBrandColors } = await import("../lib/agent/resolve-client-brand-colors.ts");
const { bindAiUsageContext, flushAiTokenUsageWrites } = await import("../lib/agent/token-usage.ts");

const { data: post } = await admin
  .from("posts")
  .select("id, slug, author_id, primary_locale, cover_image_path, status")
  .eq("id", postId)
  .single();

if (!post) {
  console.error("Post not found");
  process.exit(1);
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

const combinedInstructions = combineClientInstructionsForModel(
  client.custom_instructions,
  client.instruction_reinforcement,
);
const omitOnImageText = clientDisallowsCoverOnImageText(combinedInstructions);

console.log("Regenerating cover for", post.slug, omitOnImageText ? "(no on-image text)" : "");

const llm = createAgentLlmBundle();
const refParts = await loadCoverReferenceImageParts(admin, [
  client.cover_reference_image_1,
  client.cover_reference_image_2,
  client.cover_reference_image_3,
]);

let referenceVisionBrief = null;
if (refParts.length > 0) {
  referenceVisionBrief = await buildCoverReferenceVisionBriefWithTimeout(
    coverVisionClientsFromLlm(llm),
    refParts,
    "[regenerate-cover-local] ref-vision",
  );
}

const title = loc?.title ?? post.slug;
const keyword = loc?.focus_keyword ?? title;
const coverSubject = truncateCoverImageSubject(
  refParts.length > 0
    ? `Blog hero banner for "${keyword}": match reference banner style; topic-specific visuals.`
    : `Blog hero banner for "${keyword}": rich, topic-specific visuals; distinctive composition.`,
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
  { omitOnImageText },
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
    omitOnImageText ? "" : title.trim().split(/\s+/).slice(0, 4).join(" "),
    {
      primaryColor: resolvedBrandColors.primaryColor,
      secondaryColor: resolvedBrandColors.secondaryColor,
      tertiaryColor: resolvedBrandColors.tertiaryColor,
      alternativeColor: resolvedBrandColors.alternativeColor,
      fontStyle: client.font_style ?? "modern",
      brandVoice: client.brand_voice ?? "professional",
    },
    null,
    {
      headlineMayBeNonEnglish: !omitOnImageText,
      hasReferenceImages: refParts.length > 0,
      omitOnImageText,
    },
  ),
  logLabel: "[regenerate-cover-local]",
  referenceImages: refParts.length ? refParts : undefined,
  referenceVisionBrief,
  guidelinesText: client.brand_guidelines_text ?? null,
  enforcePrimaryInstructionEmbedding: true,
});

await flushAiTokenUsageWrites();

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
console.log("Cover saved:", urlData?.publicUrl);

const publishUrl = `${cmsUrl.replace(/\/$/, "")}/api/publish/${postId}`;
console.log("Republishing...", publishUrl);
const res = await fetch(publishUrl, {
  method: "POST",
  headers: { "x-scheduler-internal": "1" },
});
const text = await res.text();
console.log(res.status, text);
if (!res.ok) process.exit(1);

console.log("Done.");
