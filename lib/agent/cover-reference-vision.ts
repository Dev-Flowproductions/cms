/**
 * Vision-language summary of client reference banner images (OpenAI vision by default).
 */
import type OpenAI from "openai";
import type { CoverReferenceImagePart } from "./cover-image";
import { openAiVisionWithModelFallback } from "./openai-chat";

const MAX_BRIEF_CHARS = 1200;

export const COVER_REFERENCE_VISION_TIMEOUT_MS = (() => {
  const raw = process.env.OPENAI_VISION_TIMEOUT_MS?.trim() ?? process.env.GEMINI_COVER_VISION_TIMEOUT_MS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 60_000;
})();

const VISION_PROMPT = `You help keep blog header banners on-brand. The attached image(s) are EXAMPLES this client uses (or wants to emulate).

Write dense instructions for an image generator (not marketing prose).

FIRST LINE (mandatory): start with "MEDIUM: " followed by exactly one of PHOTOGRAPHY | ILLUSTRATION | FLAT DESIGN | 3D RENDER | MIXED-MEDIA — choose the dominant medium in the references.

Then cover:
- Medium details: realism vs stylized; line work; flat vs textured; level of detail
- Colour: dominant hues, contrast, background vs foreground
- Composition: layout, safe areas for headline text, symmetry
- On-image typography if visible: weight, case, placement
- Mood and sector vibe
- End with: "Do not copy any logo, watermark, or trademark pixels."

Format: 4–8 short bullet lines after the MEDIUM line. No title or preamble. Max 900 characters of body.`;

export async function buildCoverReferenceVisionBrief(
  openai: OpenAI,
  referenceImages: CoverReferenceImagePart[],
  logLabel: string,
): Promise<string | null> {
  const refs = referenceImages.filter((r) => r.base64?.length);
  if (!refs.length) return null;

  try {
    const text = await openAiVisionWithModelFallback(openai, VISION_PROMPT, refs);
    if (!text) return null;
    return text.slice(0, MAX_BRIEF_CHARS);
  } catch (e) {
    console.warn(`[${logLabel}] cover-reference-vision failed:`, e);
    return null;
  }
}

export function buildCoverReferenceVisionBriefWithTimeout(
  openai: OpenAI,
  referenceImages: CoverReferenceImagePart[],
  logLabel: string,
): Promise<string | null> {
  return Promise.race([
    buildCoverReferenceVisionBrief(openai, referenceImages, logLabel),
    new Promise<string | null>((resolve) =>
      setTimeout(() => resolve(null), COVER_REFERENCE_VISION_TIMEOUT_MS),
    ),
  ]);
}

export async function requireCoverReferenceVisionBrief(
  openai: OpenAI,
  referenceImages: CoverReferenceImagePart[],
  logLabel: string,
): Promise<string> {
  const refs = referenceImages.filter((r) => r.base64?.length);
  if (!refs.length) {
    throw new Error("requireCoverReferenceVisionBrief called with no usable reference images");
  }
  let brief = await buildCoverReferenceVisionBrief(openai, refs, logLabel);
  if (!brief?.trim()) {
    console.warn(`[${logLabel}] cover-reference-vision empty or failed, retrying once`);
    brief = await buildCoverReferenceVisionBrief(openai, refs, `${logLabel} retry`);
  }
  if (!brief?.trim()) {
    throw new Error(
      "Reference banner image analysis failed after retry. Cannot generate cover without a vision brief when reference images are provided.",
    );
  }
  return brief.trim();
}
