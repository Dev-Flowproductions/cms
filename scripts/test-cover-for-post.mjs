/**
 * Reproduce cover generation for a post (diagnostic).
 * Usage: node scripts/test-cover-for-post.mjs <postId>
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

const postId = process.argv[2] ?? "0f71dff9-baa1-4a44-81be-34d4d65e4165";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { createAgentLlmBundle } = await import("../lib/agent/text-llm.ts");
const { loadCoverReferenceImageParts } = await import("../lib/agent/cover-reference-images.ts");
const { requireCoverReferenceVisionBrief } = await import("../lib/agent/cover-reference-vision.ts");
const { buildCoverInstructionEmbeddingPrefixWithMeta } = await import("../lib/agent/instruction-embeddings.ts");
const { combineClientInstructionsForModel } = await import("../lib/agent/instructions.ts");
const { buildCoverPrompt, truncateCoverImageSubject } = await import("../lib/agent/cover-prompt.ts");
const { generateCoverImageBufferWithEmbedFallback } = await import("../lib/agent/cover-image.ts");
const { resolveClientBrandColors } = await import("../lib/agent/resolve-client-brand-colors.ts");

const { data: post } = await admin
  .from("posts")
  .select("id, slug, author_id, primary_locale")
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

const { data: client } = await admin
  .from("clients")
  .select("*")
  .eq("user_id", post.author_id)
  .single();

console.log("Post:", post.slug, "locale:", post.primary_locale);
console.log("Client:", client.domain);

const llm = createAgentLlmBundle();
const refPaths = [
  client.cover_reference_image_1,
  client.cover_reference_image_2,
  client.cover_reference_image_3,
];
console.log("Ref paths:", refPaths.filter(Boolean));

const refParts = await loadCoverReferenceImageParts(admin, refPaths);
console.log("Ref parts loaded:", refParts.length);

let referenceVisionBrief = null;
try {
  if (refParts.length > 0) {
    console.log("Running requireCoverReferenceVisionBrief...");
    const t0 = Date.now();
    referenceVisionBrief = await requireCoverReferenceVisionBrief(
      llm.openai,
      refParts,
      "[test] ref-vision",
    );
    console.log("Vision brief OK in", Date.now() - t0, "ms:", referenceVisionBrief?.slice(0, 120));
  }
} catch (e) {
  console.error("Vision brief FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
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

console.log("Building embed prefix...");
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
console.log("Embed prefix length:", coverEmbedPrefix.length);

const resolvedBrandColors = resolveClientBrandColors({
  domain: client.domain ?? "",
  primary_color: client.primary_color,
  secondary_color: client.secondary_color,
  tertiary_color: client.tertiary_color,
  alternative_color: client.alternative_color,
  colorPaletteText: null,
});

const brandStyle = {
  primaryColor: resolvedBrandColors.primaryColor,
  secondaryColor: resolvedBrandColors.secondaryColor,
  tertiaryColor: resolvedBrandColors.tertiaryColor,
  alternativeColor: resolvedBrandColors.alternativeColor,
  fontStyle: client.font_style ?? "modern",
  brandVoice: client.brand_voice ?? "professional",
};

const baseCoverPrompt = buildCoverPrompt(
  coverSubject,
  title.trim().split(/\s+/).slice(0, 4).join(" "),
  brandStyle,
  null,
  { headlineMayBeNonEnglish: true, hasReferenceImages: refParts.length > 0 },
);

console.log("Generating cover image...");
const t1 = Date.now();
const buffer = await generateCoverImageBufferWithEmbedFallback(llm.openai, {
  embedPrefix: coverEmbedPrefix,
  basePrompt: baseCoverPrompt,
  logLabel: "[test] cover",
  referenceImages: refParts.length ? refParts : undefined,
  referenceVisionBrief,
  guidelinesText: client.brand_guidelines_text ?? null,
  enforcePrimaryInstructionEmbedding: true,
});
console.log("Cover result:", buffer ? `OK ${buffer.length} bytes in ${Date.now() - t1}ms` : "NULL (no buffer)");
