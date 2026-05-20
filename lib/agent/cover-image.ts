/**
 * Blog cover image generation (OpenAI — Responses API `image_generation` tool, Images API fallback).
 */
import type OpenAI from "openai";
import { generateOpenAiCoverImageBuffer } from "./openai-image-generation";

export type CoverReferenceImagePart = { mimeType: string; base64: string };

export type CoverGenerationArgs = {
  embedPrefix: string;
  basePrompt: string;
  logLabel: string;
  referenceImages?: CoverReferenceImagePart[];
  referenceVisionBrief?: string | null;
  guidelinesText?: string | null;
  enforcePrimaryInstructionEmbedding?: boolean;
};

const PRIMARY_INSTRUCTIONS_HEADER =
  "═══════════════════════════════════════\n" +
  "PRIMARY INSTRUCTIONS (embedding-ranked — obey before all topic-specific text below)\n" +
  "═══════════════════════════════════════\n\n";

function appendGuidelinesToPrompt(base: string, guidelinesText: string | null | undefined): string {
  const g = guidelinesText?.trim();
  if (!g) return base;
  return `${base}\n\nCLIENT VISUAL GUIDELINES (follow for composition, style, and on-image treatment):\n${g.slice(0, 4000)}\n`;
}

function wrapEmbedPrefix(embedPrefix: string, enforce: boolean): string {
  const e = embedPrefix.trim();
  if (!e) return "";
  return enforce ? `${PRIMARY_INSTRUCTIONS_HEADER}${e}` : e;
}

/**
 * Tries: full prompt with embed prefix → text-only without embed prefix (unless enforce).
 */
export async function generateCoverImageBufferWithEmbedFallback(
  openai: OpenAI,
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
      ? `REFERENCE IMAGES: ${refs.length} example banner(s) were analyzed; match their visual medium, colour mood, and layout density. Do not reproduce logos or trademarks.\n\n`
      : "";
  const embedded = wrapEmbedPrefix(args.embedPrefix, enforce);
  const fullText = withGuide(embedded + visionBlock + refHint + args.basePrompt);

  let buf = await generateOpenAiCoverImageBuffer(openai, fullText, args.logLabel);
  if (buf) return buf;

  if (!enforce && args.embedPrefix.trim()) {
    buf = await generateOpenAiCoverImageBuffer(
      openai,
      withGuide(args.basePrompt),
      `${args.logLabel} retry-no-embed`,
    );
  }
  return buf;
}
