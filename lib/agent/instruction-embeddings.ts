/**
 * Gemini Embedding 2 ranks **middle** instruction sections by similarity to a task query.
 * Chunk text lives in `instruction-chunks.ts`; this file only builds queries, embeds, and orders ids.
 */

import type { EmbeddingService } from "./embedding-service";
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
import { NO_COVER_ON_IMAGE_TEXT_OVERRIDE } from "./cover-text-policy";

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

/** Active embedding model id (OpenAI or Gemini depending on AI_PROVIDER). */
export function getEmbeddingModelName(embeddings: EmbeddingService): string {
  return embeddings.modelName;
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

/**
 * Returns ranked chunk ids sorted by similarity to the task query.
 * Excludes internal_links when not applicable.
 */
export async function rankGeneralInstructionChunkIds(
  embeddings: EmbeddingService,
  ctx: InstructionSelectionContext,
): Promise<string[]> {
  const candidates = GENERAL_INSTRUCTION_RANKED_CHUNKS.filter(
    (c) => !c.onlyWithInternalLinks || ctx.hasInternalLinks,
  );

  const qVec = await embeddings.embedQuery(buildInstructionRetrievalQuery(ctx));
  const docEmbeddings = await embeddings.embedDocuments(
    candidates.map((c) => ({ id: c.id, text: c.text })),
  );

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
  embeddings: EmbeddingService,
  ctx: InstructionSelectionContext,
): Promise<string> {
  const order = await rankGeneralInstructionChunkIds(embeddings, ctx);
  return joinGeneralInstructionsInOrder(order);
}

/** Metadata for observability — Gemini Embedding 2 ranking for cover raster prompts. */
export type CoverInstructionPrefixMeta = {
  fullRankOrder: string[];
  pickedGeneralChunkIds: string[];
  clientSectionsRanked: boolean;
  clientInstructionChunkCount: number;
};

export type CoverInstructionPrefixOptions = {
  /** When true, skip default CMS headline rules and inject a no-text override. */
  omitOnImageText?: boolean;
};

async function buildCoverInstructionEmbeddingPrefixCore(
  embeddings: EmbeddingService,
  partial: Pick<InstructionSelectionContext, "focusKeywordOrTopic"> &
    Partial<Omit<InstructionSelectionContext, "focusKeywordOrTopic">>,
  clientInstructionsRaw?: string | null,
  referenceVisionBrief?: string | null,
  options?: CoverInstructionPrefixOptions,
): Promise<{ prefix: string; meta: CoverInstructionPrefixMeta }> {
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
  let clientSectionsRanked = false;
  let clientInstructionChunkCount = 0;

  if (clientInstructionsRaw?.trim()) {
    const cChunks = parseClientInstructionsIntoChunks(clientInstructionsRaw);
    clientInstructionChunkCount = cChunks.length;
    if (cChunks.length > 0) {
      try {
        const ranked =
          cChunks.length === 1
            ? cChunks[0]!.text
            : await buildClientInstructionsWithEmbeddingOrder(embeddings, cChunks, retrievalQuery);
        clientSectionsRanked = cChunks.length > 1;
        if (ranked?.trim()) segments.push(`BRAND CONTEXT (embedding-ranked for cover task):\n${ranked}`);
      } catch (e) {
        console.warn("[instruction-embeddings] Client cover prefix embedding failed, using raw text:", e);
        segments.push(`BRAND CONTEXT:\n${clientInstructionsRaw.trim()}`);
      }
    }
  }

  const fullRankOrder = await rankGeneralInstructionChunkIds(embeddings, ctx);
  const omitOnImageText = options?.omitOnImageText === true;
  const pickedGeneralChunkIds = omitOnImageText
    ? fullRankOrder.filter((id) => id === "formatting")
    : fullRankOrder.filter((id) => id === "cover" || id === "formatting");
  const text = joinRankedInstructionChunksInOrder(pickedGeneralChunkIds);
  if (!text?.trim() && !omitOnImageText) {
    throw new Error("Cover instruction embedding: no cover/formatting chunk text after ranking");
  }
  if (text?.trim()) {
    segments.push(`EDITORIAL IMAGE RULES (CMS — follow exactly):\n${text}`);
  }
  if (omitOnImageText) {
    segments.unshift(NO_COVER_ON_IMAGE_TEXT_OVERRIDE);
  }

  const prefix = `${segments.join("\n\n")}\n\n`;
  const meta: CoverInstructionPrefixMeta = {
    fullRankOrder,
    pickedGeneralChunkIds,
    clientSectionsRanked,
    clientInstructionChunkCount,
  };

  console.info(
    "[cover] instruction embedding selection",
    JSON.stringify({
      embeddingModel: embeddings.modelName,
      embeddingProvider: embeddings.provider,
      task: "cover_raster",
      focusKeywordOrTopic: ctx.focusKeywordOrTopic,
      hasReferenceVisionBrief: Boolean(ctx.referenceVisionBrief?.trim()),
      ...meta,
    }),
  );

  return { prefix, meta };
}

/**
 * Strict cover prefix + ranking metadata. Throws if Embedding 2 cannot produce general cover/formatting rules.
 */
export async function buildCoverInstructionEmbeddingPrefixWithMeta(
  embeddings: EmbeddingService,
  partial: Pick<InstructionSelectionContext, "focusKeywordOrTopic"> &
    Partial<Omit<InstructionSelectionContext, "focusKeywordOrTopic">>,
  clientInstructionsRaw?: string | null,
  referenceVisionBrief?: string | null,
  options?: CoverInstructionPrefixOptions,
): Promise<{ prefix: string; meta: CoverInstructionPrefixMeta }> {
  try {
    return await buildCoverInstructionEmbeddingPrefixCore(
      embeddings,
      partial,
      clientInstructionsRaw,
      referenceVisionBrief,
      options,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Cover instruction embedding failed: ${msg}`);
  }
}

/**
 * Text prepended to the raster cover prompt:
 * 1) Optional **client** sections (`custom_instructions`), embedding-ranked for `taskKind: cover`.
 * 2) General **cover** + **formatting** chunks from `instruction-chunks.ts`, embedding-ranked.
 * The rendered brief still comes mostly from `buildCoverPrompt`.
 *
 * On failure returns `null` (legacy / lenient callers).
 */
export async function buildCoverInstructionEmbeddingPrefix(
  embeddings: EmbeddingService,
  partial: Pick<InstructionSelectionContext, "focusKeywordOrTopic"> &
    Partial<Omit<InstructionSelectionContext, "focusKeywordOrTopic">>,
  clientInstructionsRaw?: string | null,
  referenceVisionBrief?: string | null,
  options?: CoverInstructionPrefixOptions,
): Promise<string | null> {
  try {
    const { prefix } = await buildCoverInstructionEmbeddingPrefixCore(
      embeddings,
      partial,
      clientInstructionsRaw,
      referenceVisionBrief,
      options,
    );
    return prefix;
  } catch (e) {
    console.warn("[instruction-embeddings] Cover instruction embedding failed:", e);
    return null;
  }
}

const COVER_INSTRUCTION_EMBED_TIMEOUT_MS = 8000;

/** Same as {@link buildCoverInstructionEmbeddingPrefix} but resolves to null if embedding work exceeds the timeout (avoids blocking serverless runs). */
export function buildCoverInstructionEmbeddingPrefixWithTimeout(
  embeddings: EmbeddingService,
  partial: Parameters<typeof buildCoverInstructionEmbeddingPrefix>[1],
  clientInstructionsRaw?: string | null,
  referenceVisionBrief?: string | null,
  options?: CoverInstructionPrefixOptions,
): Promise<string | null> {
  return Promise.race([
    buildCoverInstructionEmbeddingPrefix(embeddings, partial, clientInstructionsRaw, referenceVisionBrief, options),
    new Promise<string | null>((resolve) =>
      setTimeout(() => resolve(null), COVER_INSTRUCTION_EMBED_TIMEOUT_MS),
    ),
  ]);
}
