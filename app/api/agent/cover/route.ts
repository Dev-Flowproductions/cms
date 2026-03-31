import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { buildCoverInstructionEmbeddingPrefixWithMeta } from "@/lib/agent/instruction-embeddings";
import { combineClientInstructionsForModel } from "@/lib/agent/instructions";
import { buildCoverPrompt, truncateCoverImageSubject } from "@/lib/agent/cover-prompt";
import { generateCoverImageBufferWithEmbedFallback } from "@/lib/agent/gemini-cover-image";
import { loadCoverReferenceImageParts } from "@/lib/agent/cover-reference-images";
import { requireCoverReferenceVisionBrief } from "@/lib/agent/cover-reference-vision";
import { resolveClientBrandColors } from "@/lib/agent/resolve-client-brand-colors";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const genAIEmbed = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

  const admin = createAdminClient();
  let imageBuffer!: ArrayBuffer | Buffer;
  let contentType = "image/jpeg";
  let source = "gemini";

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
    const { data: clientRow } = await admin
      .from("clients")
      .select(
        "domain, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, brand_book, custom_instructions, instruction_reinforcement, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_text",
      )
      .eq("user_id", postRow.author_id)
      .maybeSingle();
    if (clientRow) {
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

  const coverSubject = truncateCoverImageSubject(
    `Editorial illustration for blog topic "${query}": rich, topic-specific visuals; distinctive composition.`,
  );
  const headlineForCover = query.trim().split(/\s+/).slice(0, 4).join(" ");

  const refParts = await loadCoverReferenceImageParts(admin, coverRefPaths);
  let referenceVisionBrief: string | null = null;
  let coverEmbedPrefix: string;
  try {
    if (refParts.length > 0) {
      referenceVisionBrief = await requireCoverReferenceVisionBrief(genAIEmbed, refParts, "[cover] ref-vision");
    }
    const { prefix } = await buildCoverInstructionEmbeddingPrefixWithMeta(
      genAIEmbed,
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
  });

  try {
    const buf = await generateCoverImageBufferWithEmbedFallback(genai, {
      embedPrefix: coverEmbedPrefix,
      basePrompt,
      logLabel: "[cover]",
      referenceImages: refParts.length ? refParts : undefined,
      referenceVisionBrief,
      guidelinesText: brandGuidelinesText,
      enforcePrimaryInstructionEmbedding: true,
    });
    if (!buf) throw new Error("No image returned from Gemini");
    imageBuffer = buf;
    contentType = "image/jpeg";
    source = "gemini";

  } catch (imgErr) {
    // ── Picsum fallback ────────────────────────────────────────────────────
    console.warn("[cover] Imagen failed, falling back to Picsum:", imgErr);
    const seed = query.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const fallbackUrl = `https://picsum.photos/seed/${seed}/1920/1440`;
    const imgRes = await fetch(fallbackUrl, { redirect: "follow" });
    if (!imgRes.ok) return NextResponse.json({ error: "Failed to download fallback image" }, { status: 502 });
    imageBuffer = await imgRes.arrayBuffer();
    contentType = "image/jpeg";
    source = "picsum";
  }

  // ── Upload to Supabase Storage ─────────────────────────────────────────────
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `${post_id}/cover-${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("covers")
    .upload(path, imageBuffer, { contentType, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("posts")
    .update({ cover_image_path: path })
    .eq("id", post_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("covers").getPublicUrl(path);

  return NextResponse.json({
    success: true,
    path,
    publicUrl: urlData.publicUrl,
    source,
  });
}
