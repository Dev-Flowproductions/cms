/**
 * Gemini image API calls for blog covers. Prompt body: `cover-prompt.ts`.
 * Text prefix from `buildCoverInstructionEmbeddingPrefixWithMeta` / `buildCoverInstructionEmbeddingPrefix` (embedding-ranked client brand block + cover+formatting chunks).
 */
import type { GoogleGenAI } from "@google/genai";

export const GEMINI_COVER_IMAGE_MODEL = "gemini-3.1-flash-image-preview";

export type CoverReferenceImagePart = { mimeType: string; base64: string };

export function extractInlineImageBufferFromGeminiResponse(response: unknown): Buffer | null {
  if (typeof response !== "object" || response === null) return null;
  const r = response as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string } }> };
    }>;
  };
  const parts = r.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const d = part.inlineData?.data;
    if (d) return Buffer.from(d, "base64");
  }
  return null;
}

export function logGeminiCoverImageEmptyResponse(logLabel: string, response: unknown): void {
  try {
    const r = response as {
      candidates?: Array<{
        finishReason?: string;
        content?: { parts?: Array<{ text?: string; inlineData?: unknown }> };
      }>;
      promptFeedback?: unknown;
    };
    const c0 = r.candidates?.[0];
    const partKinds = (c0?.content?.parts ?? []).map((p) =>
      p.inlineData ? "inlineData" : p.text != null ? "text" : "other",
    );
    console.warn(`[${logLabel}] Cover image API returned no inline image`, {
      finishReason: c0?.finishReason,
      partKinds,
      promptFeedback: r.promptFeedback,
    });
  } catch {
    console.warn(`[${logLabel}] Cover image API returned no inline image (could not inspect response)`);
  }
}

export async function generateGeminiCoverImageBuffer(
  imagenAI: GoogleGenAI,
  coverPrompt: string,
  logLabel: string,
): Promise<Buffer | null> {
  const imgResponse = await imagenAI.models.generateContent({
    model: GEMINI_COVER_IMAGE_MODEL,
    contents: coverPrompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
    },
  });
  const buf = extractInlineImageBufferFromGeminiResponse(imgResponse);
  if (buf) return buf;
  logGeminiCoverImageEmptyResponse(logLabel, imgResponse);
  return null;
}

/** Multimodal: text prompt + company reference images (Gemini 3 image models). */
export async function generateGeminiCoverImageBufferWithReferences(
  imagenAI: GoogleGenAI,
  textPrompt: string,
  referenceImages: CoverReferenceImagePart[],
  logLabel: string,
): Promise<Buffer | null> {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text: textPrompt },
    ...referenceImages.map((img) => ({
      inlineData: { mimeType: img.mimeType, data: img.base64 },
    })),
  ];
  try {
    const imgResponse = await imagenAI.models.generateContent({
      model: GEMINI_COVER_IMAGE_MODEL,
      contents: parts,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
      },
    });
    const buf = extractInlineImageBufferFromGeminiResponse(imgResponse);
    if (buf) return buf;
    logGeminiCoverImageEmptyResponse(`${logLabel} multimodal`, imgResponse);
    return null;
  } catch (e) {
    console.warn(`[${logLabel}] Multimodal cover generation threw — falling back to text-only:`, e instanceof Error ? e.message : String(e));
    return null;
  }
}

function appendGuidelinesToPrompt(base: string, guidelinesText: string | null | undefined): string {
  const g = guidelinesText?.trim();
  if (!g) return base;
  return `${base}\n\nCLIENT VISUAL GUIDELINES (follow for composition, style, and on-image treatment):\n${g.slice(0, 4000)}\n`;
}

export type CoverGenerationArgs = {
  embedPrefix: string;
  basePrompt: string;
  logLabel: string;
  /** Up to 3 company reference images — same model as banner output, for style/composition alignment. */
  referenceImages?: CoverReferenceImagePart[];
  /** Gemini vision summary of reference images — reinforces style in the text prompt (with images). */
  referenceVisionBrief?: string | null;
  /** Plain text from uploaded guidelines (txt/md/PDF extract). */
  guidelinesText?: string | null;
  /**
   * When true: prefix Embedding 2 block is mandatory, wrapped as PRIMARY instructions before topic text;
   * no fallback generation without the embed prefix.
   */
  enforcePrimaryInstructionEmbedding?: boolean;
};

const PRIMARY_INSTRUCTIONS_HEADER =
  "═══════════════════════════════════════\n" +
  "PRIMARY INSTRUCTIONS (Gemini Embedding 2 — obey before all topic-specific text below)\n" +
  "═══════════════════════════════════════\n\n";

function wrapEmbedPrefix(embedPrefix: string, enforce: boolean): string {
  const e = embedPrefix.trim();
  if (!e) return "";
  return enforce ? `${PRIMARY_INSTRUCTIONS_HEADER}${e}` : e;
}

/**
 * Tries: multimodal (refs + full text) → text-only full prompt → text-only without embed prefix.
 */
export async function generateCoverImageBufferWithEmbedFallback(
  imagenAI: GoogleGenAI,
  args: CoverGenerationArgs,
): Promise<Buffer | null> {
  const enforce = args.enforcePrimaryInstructionEmbedding === true;
  if (enforce && !args.embedPrefix.trim()) {
    throw new Error("enforcePrimaryInstructionEmbedding requires a non-empty embedPrefix");
  }

  const withGuide = (t: string) => appendGuidelinesToPrompt(t, args.guidelinesText);
  const refs = args.referenceImages?.filter((r) => r.base64?.length) ?? [];
  const visionBlock = args.referenceVisionBrief?.trim()
    ? `REFERENCE EXAMPLES — VISUAL ANALYSIS (align the new banner with this look-and-feel):\n${args.referenceVisionBrief.trim()}\n\n`
    : "";
  const refHint =
    refs.length > 0
      ? `REFERENCE IMAGES: The following ${refs.length} image(s) are examples of this company's visual style. Match their illustration language, colour mood, and layout density. Do not reproduce logos or trademarks. Generate one new 16:9 editorial banner for the article described in the text below.\n\n`
      : "";
  const embedded = wrapEmbedPrefix(args.embedPrefix, enforce);
  const fullText = withGuide(embedded + visionBlock + refHint + args.basePrompt);

  if (refs.length > 0) {
    console.info(`[${args.logLabel}] Attempting multimodal cover (${refs.length} reference image(s))`);
    let buf = await generateGeminiCoverImageBufferWithReferences(
      imagenAI,
      fullText,
      refs.slice(0, 10),
      args.logLabel,
    );
    if (buf) {
      console.info(`[${args.logLabel}] Cover generated successfully with reference images`);
      return buf;
    }
    console.warn(`[${args.logLabel}] Multimodal cover returned no image — falling back to text-only (refs skipped)`);
    buf = await generateGeminiCoverImageBuffer(imagenAI, fullText, `${args.logLabel} retry-no-ref-images`);
    if (buf) return buf;
  } else {
    let buf = await generateGeminiCoverImageBuffer(imagenAI, fullText, args.logLabel);
    if (buf) return buf;
  }

  if (!enforce && args.embedPrefix.trim()) {
    return generateGeminiCoverImageBuffer(
      imagenAI,
      withGuide(args.basePrompt),
      `${args.logLabel} retry-no-embed`,
    );
  }
  return null;
}
