/**
 * Vision-language summary of client reference banner images.
 * Feeds (1) embedding retrieval query for cover instructions and (2) the image model text prompt.
 */
import type { GoogleGenerativeAI } from "@google/generative-ai";
import type { CoverReferenceImagePart } from "./gemini-cover-image";

/** Same text/vision stack as post generation (`scheduler` / `generate` routes). */
const VISION_MODEL =
  process.env.GEMINI_COVER_VISION_MODEL?.trim() || "gemini-3.1-flash-lite-preview";
const MAX_BRIEF_CHARS = 1200;
export const COVER_REFERENCE_VISION_TIMEOUT_MS = 12_000;

const VISION_PROMPT = `You help keep blog header banners on-brand. The attached image(s) are EXAMPLES this client uses (or wants to emulate).

Write dense instructions for an image generator (not marketing prose). Cover:
- Medium: illustration vs photo vs 3D; line work; flat vs textured; level of detail
- Colour: dominant hues, contrast, background vs foreground
- Composition: layout, safe areas for headline text, symmetry
- On-image typography if visible: weight, case, placement
- Mood and sector vibe
- End with: "Do not copy any logo, watermark, or trademark pixels."

Format: 3–7 short bullet lines. No title or preamble. Max 900 characters of body.`;

export async function buildCoverReferenceVisionBrief(
  genAI: GoogleGenerativeAI,
  referenceImages: CoverReferenceImagePart[],
  logLabel: string,
): Promise<string | null> {
  const refs = referenceImages.filter((r) => r.base64?.length);
  if (!refs.length) return null;

  const model = genAI.getGenerativeModel({ model: VISION_MODEL });
  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [
    { text: VISION_PROMPT },
    ...refs.slice(0, 3).map((r) => ({
      inlineData: { mimeType: r.mimeType, data: r.base64 },
    })),
  ];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });
    const text = result.response.text()?.trim();
    if (!text) return null;
    return text.slice(0, MAX_BRIEF_CHARS);
  } catch (e) {
    console.warn(`[${logLabel}] cover-reference-vision failed:`, e);
    return null;
  }
}

export function buildCoverReferenceVisionBriefWithTimeout(
  genAI: GoogleGenerativeAI,
  referenceImages: CoverReferenceImagePart[],
  logLabel: string,
): Promise<string | null> {
  return Promise.race([
    buildCoverReferenceVisionBrief(genAI, referenceImages, logLabel),
    new Promise<string | null>((resolve) =>
      setTimeout(() => resolve(null), COVER_REFERENCE_VISION_TIMEOUT_MS),
    ),
  ]);
}
