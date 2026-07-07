/**
 * Central AI provider + model defaults (2026).
 * Default provider is Gemini; set AI_PROVIDER=openai for the OpenAI stack.
 */

export type AiProvider = "openai" | "gemini";

export function getAiProvider(): AiProvider {
  const forced =
    process.env.AI_PROVIDER?.trim().toLowerCase() ??
    process.env.AI_TEXT_PROVIDER?.trim().toLowerCase();
  if (forced === "openai") return "openai";
  if (forced === "gemini") return "gemini";
  return "gemini";
}

/** GA text model (replaces shut-down gemini-3.1-flash-lite-preview). */
export const GEMINI_TEXT_MODEL_DEFAULT = "gemini-3.1-flash-lite";

/** GA multimodal embeddings (replaces gemini-embedding-2-preview). */
export const GEMINI_EMBEDDING_MODEL_DEFAULT = "gemini-embedding-2";

/** Nano Banana 2 — blog covers at 16:9 (replaces gemini-3.1-flash-image-preview). */
export const GEMINI_IMAGE_MODEL_DEFAULT = "gemini-3.1-flash-image";

export const GEMINI_IMAGE_MODEL_FALLBACKS = ["gemini-3-pro-image", "gemini-2.5-flash-image"] as const;

/** Vision for reference-banner analysis (multimodal input). */
export const GEMINI_VISION_MODEL_DEFAULT = "gemini-3.1-flash-lite";

export function getGeminiTextModelName(): string {
  return process.env.GEMINI_TEXT_MODEL?.trim() || GEMINI_TEXT_MODEL_DEFAULT;
}

export function getGeminiEmbeddingModelName(): string {
  return process.env.GEMINI_EMBEDDING_MODEL?.trim() || GEMINI_EMBEDDING_MODEL_DEFAULT;
}

export function getGeminiVisionModelName(): string {
  return process.env.GEMINI_VISION_MODEL?.trim() || GEMINI_VISION_MODEL_DEFAULT;
}

export function getGeminiImageModelChain(): string[] {
  const primary = process.env.GEMINI_IMAGE_MODEL?.trim() || GEMINI_IMAGE_MODEL_DEFAULT;
  const chain = [primary, ...GEMINI_IMAGE_MODEL_FALLBACKS];
  return [...new Set(chain)];
}

/** Primary OpenAI chat model (instruction-following, JSON, vision). */
export const OPENAI_TEXT_MODEL_DEFAULT = "gpt-4.1-mini";

/** Fallback chat models if primary is unavailable or rate-limited. */
export const OPENAI_TEXT_MODEL_FALLBACKS = ["gpt-5.5", "gpt-4.1", "gpt-4o-mini"] as const;

/**
 * Models that orchestrate the `image_generation` tool (Responses API — see GPT 5.5 images/vision guide).
 * Not the same as the raster model on the tool (`OPENAI_IMAGE_MODEL_*`).
 */
export const OPENAI_RESPONSES_IMAGE_MODEL_DEFAULT = "gpt-5.5";

export const OPENAI_RESPONSES_IMAGE_MODEL_FALLBACKS = ["gpt-4.1-mini", "gpt-4.1"] as const;

/** GPT Image model on the `image_generation` tool / Images API (16:9-friendly sizes). */
export const OPENAI_IMAGE_MODEL_DEFAULT = "gpt-image-2";

export const OPENAI_IMAGE_MODEL_FALLBACKS = [
  "gpt-image-2-2026-04-21",
  "gpt-image-1.5",
  "gpt-image-1",
] as const;

/** 16:9 blog cover — width/height divisible by 16 (GPT image models). */
export const OPENAI_COVER_IMAGE_SIZE = "1536x864";

export const OPENAI_EMBEDDING_MODEL_DEFAULT = "text-embedding-3-large";

export const OPENAI_EMBEDDING_MODEL_FALLBACKS = ["text-embedding-3-small"] as const;

export function getOpenAiTextModelChain(): string[] {
  const primary = process.env.OPENAI_TEXT_MODEL?.trim() || OPENAI_TEXT_MODEL_DEFAULT;
  const chain = [primary, ...OPENAI_TEXT_MODEL_FALLBACKS];
  return [...new Set(chain)];
}

export function getOpenAiImageModelChain(): string[] {
  const primary = process.env.OPENAI_IMAGE_MODEL?.trim() || OPENAI_IMAGE_MODEL_DEFAULT;
  const chain = [primary, ...OPENAI_IMAGE_MODEL_FALLBACKS];
  return [...new Set(chain)];
}

/** Models passed to `responses.create({ model })` when generating images via the tool. */
export function getOpenAiResponsesImageModelChain(): string[] {
  const primary =
    process.env.OPENAI_RESPONSES_IMAGE_MODEL?.trim() || OPENAI_RESPONSES_IMAGE_MODEL_DEFAULT;
  const chain = [primary, ...OPENAI_RESPONSES_IMAGE_MODEL_FALLBACKS];
  return [...new Set(chain)];
}

export function getOpenAiEmbeddingModelChain(): string[] {
  const primary = process.env.OPENAI_EMBEDDING_MODEL?.trim() || OPENAI_EMBEDDING_MODEL_DEFAULT;
  const chain = [primary, ...OPENAI_EMBEDDING_MODEL_FALLBACKS];
  return [...new Set(chain)];
}

export function getOpenAiVisionModelChain(): string[] {
  const primary =
    process.env.OPENAI_VISION_MODEL?.trim() ||
    process.env.OPENAI_TEXT_MODEL?.trim() ||
    OPENAI_TEXT_MODEL_DEFAULT;
  const chain = [primary, ...OPENAI_TEXT_MODEL_FALLBACKS];
  return [...new Set(chain)];
}
