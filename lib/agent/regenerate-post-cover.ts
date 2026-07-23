import type { SupabaseClient } from "@supabase/supabase-js";
import { buildCoverInstructionEmbeddingPrefixWithMeta } from "@/lib/agent/instruction-embeddings";
import { combineClientInstructionsForModel } from "@/lib/agent/instructions";
import { buildCoverPrompt, truncateCoverImageSubject } from "@/lib/agent/cover-prompt";
import { clientDisallowsCoverOnImageText } from "@/lib/agent/cover-text-policy";
import { generateCoverImageBufferWithEmbedFallback } from "@/lib/agent/cover-image";
import { loadCoverReferenceImageParts } from "@/lib/agent/cover-reference-images";
import { requireCoverReferenceVisionBrief, buildCoverReferenceVisionBriefWithTimeout } from "@/lib/agent/cover-reference-vision";
import { resolveClientBrandColors } from "@/lib/agent/resolve-client-brand-colors";
import {
  coverImageClientsFromLlm,
  coverVisionClientsFromLlm,
  type AgentLlmBundle,
} from "@/lib/agent/text-llm";
import { bindAiUsageContext } from "@/lib/agent/token-usage";
import { requestInternalPublishPost } from "@/lib/publish/request-internal-publish";

export type RegeneratePostCoverResult = {
  postId: string;
  coverPath: string;
  coverUrl: string;
  republished: boolean;
  republishError?: string;
};

export async function regeneratePostCover(
  admin: SupabaseClient,
  llm: AgentLlmBundle,
  postId: string,
  options: { republish?: boolean; logLabel?: string; allowMissingReferenceVision?: boolean } = {},
): Promise<RegeneratePostCoverResult> {
  const logLabel = options.logLabel ?? "[regenerate-cover]";

  const { data: post, error: postError } = await admin
    .from("posts")
    .select("id, slug, author_id, primary_locale, cover_image_path, status")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    throw new Error("Post not found");
  }

  const { data: loc } = await admin
    .from("post_localizations")
    .select("title, focus_keyword")
    .eq("post_id", postId)
    .eq("locale", post.primary_locale ?? "en")
    .maybeSingle();

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("*")
    .eq("user_id", post.author_id)
    .single();

  if (clientError || !client) {
    throw new Error("Client not found for post author");
  }

  bindAiUsageContext({ userId: post.author_id, clientId: client.id, postId: post.id });

  const refParts = await loadCoverReferenceImageParts(admin, [
    client.cover_reference_image_1,
    client.cover_reference_image_2,
    client.cover_reference_image_3,
  ]);

  let referenceVisionBrief: string | null = null;
  if (refParts.length > 0) {
    if (options.allowMissingReferenceVision) {
      referenceVisionBrief = await buildCoverReferenceVisionBriefWithTimeout(
        coverVisionClientsFromLlm(llm),
        refParts,
        `${logLabel} ref-vision`,
      );
      if (!referenceVisionBrief?.trim()) {
        console.warn(
          `${logLabel} reference vision unavailable — generating cover from reference images only`,
        );
      }
    } else {
      referenceVisionBrief = await requireCoverReferenceVisionBrief(
        coverVisionClientsFromLlm(llm),
        refParts,
        `${logLabel} ref-vision`,
      );
    }
  }

  const combinedInstructions = combineClientInstructionsForModel(
    client.custom_instructions,
    client.instruction_reinforcement,
  );
  const omitOnImageText = clientDisallowsCoverOnImageText(combinedInstructions);

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
    logLabel,
    referenceImages: refParts.length ? refParts : undefined,
    referenceVisionBrief,
    guidelinesText: client.brand_guidelines_text ?? null,
    enforcePrimaryInstructionEmbedding: true,
  });

  if (!buffer) {
    throw new Error("Cover generation returned no image");
  }

  const coverPath = `${postId}/cover-${Date.now()}.jpg`;
  const { error: uploadErr } = await admin.storage
    .from("covers")
    .upload(coverPath, buffer, { contentType: "image/jpeg", upsert: true });

  if (uploadErr) {
    throw new Error(`Cover upload failed: ${uploadErr.message}`);
  }

  await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", postId);
  const { data: urlData } = admin.storage.from("covers").getPublicUrl(coverPath);

  let republished = false;
  let republishError: string | undefined;
  if (options.republish !== false && post.status === "published") {
    const pub = await requestInternalPublishPost(postId);
    republished = pub.ok;
    if (!pub.ok) {
      republishError = pub.error ?? `HTTP ${pub.status}`;
    }
  }

  return {
    postId,
    coverPath,
    coverUrl: urlData?.publicUrl ?? "",
    republished,
    republishError,
  };
}
