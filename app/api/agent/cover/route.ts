import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildCoverInstructionEmbeddingPrefixWithMeta } from "@/lib/agent/instruction-embeddings";
import { combineClientInstructionsForModel } from "@/lib/agent/instructions";
import { buildCoverPrompt, truncateCoverImageSubject } from "@/lib/agent/cover-prompt";
import { generateCoverImageBufferWithEmbedFallback } from "@/lib/agent/cover-image";
import { loadCoverReferenceImageParts } from "@/lib/agent/cover-reference-images";
import { requireCoverReferenceVisionBrief } from "@/lib/agent/cover-reference-vision";
import { resolveClientBrandColors } from "@/lib/agent/resolve-client-brand-colors";
import { createAgentLlmBundle } from "@/lib/agent/text-llm";
import { bindAiUsageContext } from "@/lib/agent/token-usage";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { post_id: string; query: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { post_id, query } = body;
  if (!post_id || !query) {
    return NextResponse.json({ error: "post_id and query are required" }, { status: 400 });
  }

  let llm: ReturnType<typeof createAgentLlmBundle>;
  try {
    llm = createAgentLlmBundle();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI not configured";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const admin = createAdminClient();
  let imageBuffer!: ArrayBuffer | Buffer;
  let contentType = "image/jpeg";
  let source = "openai";

  let customInstructions: string | null = null;
  let brandGuidelinesText: string | null = null;
  let coverRefPaths: Array<string | null | undefined> = [];
  let brandStyle: {
    primaryColor: string;
    secondaryColor: string | null;
    tertiaryColor: string | null;
    alternativeColor: string | null;
    fontStyle: string;
    brandVoice: string;
  } | null = null;
  let visualIdentity: { colorPalette?: string; aestheticStyle?: string; imageStyle?: string } | null = null;

  const { data: postRow } = await admin.from("posts").select("author_id").eq("id", post_id).maybeSingle();
  if (postRow?.author_id) {
    bindAiUsageContext({ userId: postRow.author_id, postId: post_id });
    const { data: clientRow } = await admin
      .from("clients")
      .select(
        "id, domain, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, brand_book, custom_instructions, instruction_reinforcement, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_text",
      )
      .eq("user_id", postRow.author_id)
      .maybeSingle();
    if (clientRow) {
      bindAiUsageContext({ clientId: clientRow.id });
      customInstructions = combineClientInstructionsForModel(
        clientRow.custom_instructions,
        clientRow.instruction_reinforcement,
      );
      brandGuidelinesText = clientRow.brand_guidelines_text ?? null;
      coverRefPaths = [
        clientRow.cover_reference_image_1,
        clientRow.cover_reference_image_2,
        clientRow.cover_reference_image_3,
      ];
      const rawBook = clientRow.brand_book as {
        visualIdentity?: { aestheticStyle?: string; imageStyle?: string; colorPalette?: string };
      } | null | undefined;
      const resolved = resolveClientBrandColors({
        domain: clientRow.domain ?? "",
        primary_color: clientRow.primary_color,
        secondary_color: clientRow.secondary_color,
        tertiary_color: clientRow.tertiary_color,
        alternative_color: clientRow.alternative_color,
        colorPaletteText: rawBook?.visualIdentity?.colorPalette ?? null,
      });
      brandStyle = {
        primaryColor: resolved.primaryColor,
        secondaryColor: resolved.secondaryColor,
        tertiaryColor: resolved.tertiaryColor,
        alternativeColor: resolved.alternativeColor,
        fontStyle: clientRow.font_style ?? "modern",
        brandVoice: clientRow.brand_voice ?? "professional",
      };
      if (rawBook?.visualIdentity) {
        visualIdentity = {
          colorPalette: rawBook.visualIdentity.colorPalette,
          aestheticStyle: rawBook.visualIdentity.aestheticStyle,
          imageStyle: rawBook.visualIdentity.imageStyle,
        };
      }
    }
  }

  const refParts = await loadCoverReferenceImageParts(admin, coverRefPaths);
  const coverSubject = truncateCoverImageSubject(
    refParts.length > 0
      ? `Blog hero banner for topic "${query}": match the attached reference banner style; topic-specific visuals.`
      : `Blog hero banner for topic "${query}": rich, topic-specific visuals; distinctive composition.`,
  );
  const headlineForCover = query.trim().split(/\s+/).slice(0, 4).join(" ");

  let referenceVisionBrief: string | null = null;
  let coverEmbedPrefix: string;
  try {
    if (refParts.length > 0) {
      referenceVisionBrief = await requireCoverReferenceVisionBrief(llm.openai, refParts, "[cover] ref-vision");
    }
    const { prefix } = await buildCoverInstructionEmbeddingPrefixWithMeta(
      llm.embeddings,
      { focusKeywordOrTopic: query },
      customInstructions,
      referenceVisionBrief,
    );
    coverEmbedPrefix = prefix;
  } catch (prepErr) {
    const m = prepErr instanceof Error ? prepErr.message : String(prepErr);
    return NextResponse.json(
      { error: m },
      { status: 503 },
    );
  }

  const basePrompt = buildCoverPrompt(coverSubject, headlineForCover, brandStyle, visualIdentity, {
    headlineMayBeNonEnglish: true,
    hasReferenceImages: refParts.length > 0,
  });

  try {
    const buf = await generateCoverImageBufferWithEmbedFallback(llm.openai, {
      embedPrefix: coverEmbedPrefix,
      basePrompt,
      logLabel: "[cover]",
      referenceImages: refParts.length ? refParts : undefined,
      referenceVisionBrief,
      guidelinesText: brandGuidelinesText,
      enforcePrimaryInstructionEmbedding: true,
    });
    if (!buf) throw new Error("No image returned from OpenAI");
    imageBuffer = buf;
    contentType = "image/jpeg";
    source = "openai";

  } catch (imgErr) {
    // ── Picsum fallback ────────────────────────────────────────────────────
    console.warn("[cover] OpenAI image failed, falling back to Picsum:", imgErr);
    const seed = query.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const picsumUrl = `https://picsum.photos/seed/${seed}/1536/864`;
    const picsumRes = await fetch(picsumUrl);
    if (!picsumRes.ok) {
      return NextResponse.json({ error: "Cover generation failed" }, { status: 502 });
    }
    imageBuffer = await picsumRes.arrayBuffer();
    contentType = picsumRes.headers.get("content-type") ?? "image/jpeg";
    source = "picsum";
  }

  const coverPath = `${post_id}/cover-${Date.now()}.jpg`;
  const { error: uploadErr } = await admin.storage
    .from("covers")
    .upload(coverPath, imageBuffer, { contentType, upsert: true });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  await admin.from("posts").update({ cover_image_path: coverPath }).eq("id", post_id);

  const { data: urlData } = admin.storage.from("covers").getPublicUrl(coverPath);

  return NextResponse.json({
    cover_image_path: coverPath,
    cover_image_url: urlData.publicUrl,
    publicUrl: urlData.publicUrl,
    source,
  });
}
