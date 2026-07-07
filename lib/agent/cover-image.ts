/**
 * Blog cover image generation — Gemini (default) or OpenAI fallback.
 */
import type OpenAI from "openai";
import { getAiProvider } from "./ai-config";
import { generateGeminiCoverImageBuffer } from "./gemini-image-generation";
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

export type CoverImageClients = {
  openai: OpenAI | null;
  geminiApiKey: string | null;
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

function mediumLockFromVisionBrief(brief: string | null | undefined): string {
  const line = brief?.split("\n").find((l) => l.trim().toUpperCase().startsWith("MEDIUM:"));
  if (!line) return "";
  const medium = line.replace(/^medium:\s*/i, "").trim();
  if (!medium) return "";
  return `MEDIUM LOCK (from reference analysis): ${medium}. Do NOT switch to illustration or vector art if the medium is PHOTOGRAPHY. Do NOT switch to photography if the medium is ILLUSTRATION or FLAT DESIGN.\n\n`;
}

function wrapEmbedPrefix(embedPrefix: string, enforce: boolean): string {
  const e = embedPrefix.trim();
  if (!e) return "";
  return enforce ? `${PRIMARY_INSTRUCTIONS_HEADER}${e}` : e;
}

function buildFullCoverPrompt(args: CoverGenerationArgs): string {
  const enforce = args.enforcePrimaryInstructionEmbedding === true;
  if (enforce && !args.embedPrefix.trim()) {
    throw new Error("enforcePrimaryInstructionEmbedding requires a non-empty embedPrefix");
  }

  const withGuide = (t: string) => appendGuidelinesToPrompt(t, args.guidelinesText);
  const refs = args.referenceImages?.filter((r) => r.base64?.length) ?? [];
  const visionBlock = args.referenceVisionBrief?.trim()
    ? `${mediumLockFromVisionBrief(args.referenceVisionBrief)}REFERENCE EXAMPLES — VISUAL ANALYSIS (align the new banner with this look-and-feel):\n${args.referenceVisionBrief.trim()}\n\n`
    : "";
  const refHint =
    refs.length > 0
      ? `REFERENCE IMAGES ATTACHED: ${refs.length} example banner(s) are included in this request. Match their visual medium, colour mood, layout density, and typography — not just brand colours in prose. Do not reproduce logos or trademarks.\n\n`
      : "";
  const embedded = wrapEmbedPrefix(args.embedPrefix, enforce);
  return withGuide(embedded + visionBlock + refHint + args.basePrompt);
}

/**
 * Tries: full prompt with embed prefix → text-only without embed prefix (unless enforce).
 */
export async function generateCoverImageBufferWithEmbedFallback(
  clients: CoverImageClients,
  args: CoverGenerationArgs,
): Promise<Buffer | null> {
  const provider = getAiProvider();
  const fullText = buildFullCoverPrompt(args);
  const enforce = args.enforcePrimaryInstructionEmbedding === true;
  const refs = args.referenceImages?.filter((r) => r.base64?.length) ?? [];

  if (provider === "gemini") {
    if (!clients.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is required for cover generation when AI_PROVIDER=gemini");
    }

    let buf = await generateGeminiCoverImageBuffer({
      apiKey: clients.geminiApiKey,
      prompt: fullText,
      logLabel: args.logLabel,
      referenceImages: refs.length ? refs : undefined,
    });
    if (buf) return buf;

    if (!enforce && args.embedPrefix.trim()) {
      buf = await generateGeminiCoverImageBuffer({
        apiKey: clients.geminiApiKey,
        prompt: appendGuidelinesToPrompt(args.basePrompt, args.guidelinesText),
        logLabel: `${args.logLabel} retry-no-embed`,
      });
    }
    return buf;
  }

  if (!clients.openai) {
    throw new Error("OPENAI_API_KEY is required for cover generation when AI_PROVIDER=openai");
  }

  let buf = await generateOpenAiCoverImageBuffer(
    clients.openai,
    fullText,
    args.logLabel,
    refs.length ? refs : undefined,
  );
  if (buf) return buf;

  if (!enforce && args.embedPrefix.trim()) {
    buf = await generateOpenAiCoverImageBuffer(
      clients.openai,
      appendGuidelinesToPrompt(args.basePrompt, args.guidelinesText),
      `${args.logLabel} retry-no-embed`,
    );
  }
  return buf;
}
