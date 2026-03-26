/**
 * Gemini Embedding 2 ranks **middle** instruction sections by similarity to a task query.
 * Chunk text lives in `instruction-chunks.ts`; this file only builds queries, embeds, and orders ids.
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";
import { TaskType } from "@google/generative-ai";
import {
  buildClientInstructionsWithEmbeddingOrder,
  parseClientInstructionsIntoChunks,
} from "./client-instruction-embeddings";
import {
  CONTENT_TYPE_EMBEDDING_HINT,
  GENERAL_INSTRUCTION_RANKED_CHUNKS,
  joinGeneralInstructionsInOrder,
  joinRankedInstructionChunksInOrder,
} from "./instruction-chunks";

export type InstructionTaskKind =
  | "post_generation"
  | "translation"
  | "cover"
  | "quality_loop";

export type InstructionSelectionContext = {
  contentType: string;
  locale: string;
  focusKeywordOrTopic: string;
  hasInternalLinks: boolean;
  /** Defaults to post_generation. */
  taskKind?: InstructionTaskKind;
  /**
   * Gemini vision summary of the client's example banner images — steers embedding retrieval for `cover` tasks.
   */
  referenceVisionBrief?: string | null;
};

/** Gemini Embedding 2 only (override with GEMINI_EMBEDDING_MODEL if Google renames the model id). */
export function getGeminiEmbedding2ModelName(): string {
  return process.env.GEMINI_EMBEDDING_MODEL?.trim() || "gemini-embedding-2-preview";
}

/** Task-specific text used as the embedding **query** (same model as document embeddings). */
export function buildInstructionRetrievalQuery(ctx: InstructionSelectionContext): string {
  const taskKind = ctx.taskKind ?? "post_generation";
  const typeHint = CONTENT_TYPE_EMBEDDING_HINT[ctx.contentType] ?? `Blog content type: ${ctx.contentType}.`;
  const linkHint = ctx.hasInternalLinks
    ? "Must embed exactly three internal markdown links to site pages; match anchors semantically to page titles."
    : "No internal site URL list — do not add internal links.";

  if (taskKind === "translation") {
    return [
      "Professional translation task for CMS blog content.",
      `Target language context: ${ctx.locale}.`,
      "Preserve markdown structure, heading levels, FAQ layout.",
      "Keep every internal link URL character-for-character; translate only anchor text in brackets.",
      "Do not add or remove facts, statistics, or claims.",
      `Source topic hint: ${ctx.focusKeywordOrTopic || "article"}.`,
      linkHint,
    ].join(" ");
  }

  if (taskKind === "cover") {
    const visionHint = ctx.referenceVisionBrief?.trim()
      ? `Client example-banner visual style (from images): ${ctx.referenceVisionBrief.trim().slice(0, 700)}`
      : "";
    return [
      "Editorial blog hero image generation brief.",
      "Graphic illustration banner 16:9, not photography.",
      "Primary brand colour background, sparse composition, centered headline text in English, European sentence case.",
      "cover_image_description and cover_image_headline rules; brand font mood and illustration style.",
      `Topic: ${ctx.focusKeywordOrTopic || "blog article"}.`,
      visionHint,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (taskKind === "quality_loop") {
    return [
      "Editor task: score, review, and revise an existing blog post for SEO, AEO, and GEO quality.",
      "Strict 90+ criteria: keywords, meta lengths, core argument, definitions, FAQs, bold claims, attributed statistics, named entities.",
      "Minimal edits only when revising; preserve internal links exactly.",
      typeHint,
      `Locale: ${ctx.locale}.`,
      `Topic: ${ctx.focusKeywordOrTopic || "article"}.`,
      linkHint,
    ].join(" ");
  }

  return [
    "Blog post generation task for a CMS.",
    typeHint,
    `Language/locale: ${ctx.locale}.`,
    `Topic / focus area: ${ctx.focusKeywordOrTopic || "(derive from context)"}.`,
    linkHint,
    "Requirements: SEO meta and headings, AEO citability (definitions, FAQs, bold claims), GEO attributed statistics and named entities, JSON output schema, cover image brief.",
  ].join(" ");
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

type DocCache = Map<string, number[]>;
const documentEmbeddingCache = new Map<string, DocCache>();

function getDocCache(model: string): DocCache {
  let m = documentEmbeddingCache.get(model);
  if (!m) {
    m = new Map();
    documentEmbeddingCache.set(model, m);
  }
  return m;
}

async function embedDocumentsForModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
): Promise<Map<string, number[]>> {
  const cache = getDocCache(modelName);
  const missing = GENERAL_INSTRUCTION_RANKED_CHUNKS.filter((c) => !cache.has(c.id));
  if (missing.length === 0) return cache;

  const model = genAI.getGenerativeModel({ model: modelName });
  const { embeddings } = await model.batchEmbedContents({
    requests: missing.map((c) => ({
      content: { role: "user", parts: [{ text: c.text }] },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: c.id,
    })),
  });

  missing.forEach((c, i) => {
    const values = embeddings[i]?.values;
    if (values?.length) cache.set(c.id, values);
  });

  return cache;
}

/**
 * Returns ranked chunk ids sorted by similarity to the task query.
 * Excludes internal_links when not applicable.
 */
export async function rankGeneralInstructionChunkIds(
  genAI: GoogleGenerativeAI,
  ctx: InstructionSelectionContext,
): Promise<string[]> {
  const modelName = getGeminiEmbedding2ModelName();
  const candidates = GENERAL_INSTRUCTION_RANKED_CHUNKS.filter(
    (c) => !c.onlyWithInternalLinks || ctx.hasInternalLinks,
  );

  const model = genAI.getGenerativeModel({ model: modelName });
  const queryRes = await model.embedContent({
    content: { role: "user", parts: [{ text: buildInstructionRetrievalQuery(ctx) }] },
    taskType: TaskType.RETRIEVAL_QUERY,
  });
  const qVec = queryRes.embedding.values;
  if (!qVec?.length) throw new Error("Empty query embedding");

  const docEmbeddings = await embedDocumentsForModel(genAI, modelName);

  const scored = candidates.map((c) => {
    const dVec = docEmbeddings.get(c.id);
    if (!dVec?.length) throw new Error(`Missing document embedding for ${c.id}`);
    return { id: c.id, score: cosineSimilarity(qVec, dVec) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.id);
}

/** Full general instructions (prefix + ranked middle + JSON suffix). */
export async function buildGeneralInstructionsWithEmbeddingOrder(
  genAI: GoogleGenerativeAI,
  ctx: InstructionSelectionContext,
): Promise<string> {
  const order = await rankGeneralInstructionChunkIds(genAI, ctx);
  return joinGeneralInstructionsInOrder(order);
}

/**
 * Text prepended to the raster cover prompt:
 * 1) Optional **client** sections (`custom_instructions`), embedding-ranked for `taskKind: cover`.
 * 2) General **cover** + **formatting** chunks from `instruction-chunks.ts`, embedding-ranked.
 * The rendered brief still comes mostly from `buildCoverPrompt`.
 */
export async function buildCoverInstructionEmbeddingPrefix(
  genAI: GoogleGenerativeAI,
  partial: Pick<InstructionSelectionContext, "focusKeywordOrTopic"> &
    Partial<Omit<InstructionSelectionContext, "focusKeywordOrTopic">>,
  clientInstructionsRaw?: string | null,
  referenceVisionBrief?: string | null,
): Promise<string | null> {
  const ctx: InstructionSelectionContext = {
    contentType: partial.contentType ?? "hero",
    locale: partial.locale ?? "en",
    focusKeywordOrTopic: partial.focusKeywordOrTopic,
    hasInternalLinks: partial.hasInternalLinks ?? false,
    taskKind: "cover",
    referenceVisionBrief: referenceVisionBrief ?? partial.referenceVisionBrief,
  };

  const segments: string[] = [];

  const retrievalQuery = buildInstructionRetrievalQuery(ctx);

  if (clientInstructionsRaw?.trim()) {
    try {
      const cChunks = parseClientInstructionsIntoChunks(clientInstructionsRaw);
      if (cChunks.length > 0) {
        const ranked =
          cChunks.length === 1
            ? cChunks[0]!.text
            : await buildClientInstructionsWithEmbeddingOrder(genAI, cChunks, retrievalQuery);
        if (ranked) segments.push(`BRAND CONTEXT (embedding-ranked for cover task):\n${ranked}`);
      }
    } catch (e) {
      console.warn("[instruction-embeddings] Client cover prefix embedding failed, using raw text:", e);
      segments.push(`BRAND CONTEXT:\n${clientInstructionsRaw.trim()}`);
    }
  }

  try {
    const order = await rankGeneralInstructionChunkIds(genAI, ctx);
    const pick = order.filter((id) => id === "cover" || id === "formatting");
    const text = joinRankedInstructionChunksInOrder(pick);
    if (text) {
      segments.push(`EDITORIAL IMAGE RULES (CMS — follow exactly):\n${text}`);
    }
    if (segments.length === 0) return null;
    return `${segments.join("\n\n")}\n\n`;
  } catch (e) {
    console.warn("[instruction-embeddings] Cover instruction embedding failed:", e);
    if (segments.length > 0) return `${segments.join("\n\n")}\n\n`;
    return null;
  }
}

const COVER_INSTRUCTION_EMBED_TIMEOUT_MS = 8000;

/** Same as {@link buildCoverInstructionEmbeddingPrefix} but resolves to null if embedding work exceeds the timeout (avoids blocking serverless runs). */
export function buildCoverInstructionEmbeddingPrefixWithTimeout(
  genAI: GoogleGenerativeAI,
  partial: Parameters<typeof buildCoverInstructionEmbeddingPrefix>[1],
  clientInstructionsRaw?: string | null,
  referenceVisionBrief?: string | null,
): Promise<string | null> {
  return Promise.race([
    buildCoverInstructionEmbeddingPrefix(genAI, partial, clientInstructionsRaw, referenceVisionBrief),
    new Promise<string | null>((resolve) =>
      setTimeout(() => resolve(null), COVER_INSTRUCTION_EMBED_TIMEOUT_MS),
    ),
  ]);
}
