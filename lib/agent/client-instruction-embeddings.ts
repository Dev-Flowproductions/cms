/**
 * Ranks **client-specific** instruction sections (from `clients.custom_instructions`) with Gemini Embedding 2.
 * Callers pass the same retrieval query text as for general chunks (`buildInstructionRetrievalQuery(ctx)`).
 * All sections are kept — only order changes.
 *
 * Section boundaries rely on headers from `generateClientSpecificInstructions` (BRAND …, WEBSITE, etc.).
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";
import { TaskType } from "@google/generative-ai";

export type ClientInstructionChunk = { id: string; text: string };

function djb2Key(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i)!;
  }
  return `${s.length}:${(h >>> 0).toString(16)}`;
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

const clientChunkVecCache = new Map<string, Map<string, number[]>>();

/** Same default as `instruction-embeddings` (avoid importing that module — cycle). */
function getGeminiEmbedding2ModelName(): string {
  return process.env.GEMINI_EMBEDDING_MODEL?.trim() || "gemini-embedding-2-preview";
}

function vecCacheForModel(model: string): Map<string, number[]> {
  let m = clientChunkVecCache.get(model);
  if (!m) {
    m = new Map();
    clientChunkVecCache.set(model, m);
  }
  return m;
}

/**
 * Split stored client instructions into sections. If the text does not match known headers (e.g. admin freeform),
 * returns a single chunk so behaviour stays correct without reorder benefit.
 */
export function parseClientInstructionsIntoChunks(raw: string | null | undefined): ClientInstructionChunk[] {
  const t = raw?.trim();
  if (!t) return [];

  const splitRe =
    /\n(?=BRAND (?:IDENTITY|VISUAL|ANALYSIS|\(fallback\))|WEBSITE|CLIENT-SPECIFIC INSTRUCTIONS)/;
  const parts = t.split(splitRe).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return [];

  return parts.map((text, idx) => {
    const id = text.split("\n")[0]?.slice(0, 120).trim() || `client_section_${idx}`;
    return { id, text };
  });
}

/** Join chunks in parse order (fallback). */
export function joinClientInstructionChunksCanonical(chunks: ClientInstructionChunk[]): string {
  return chunks.map((c) => c.text).join("\n\n").trim();
}

/**
 * Reorder client sections by similarity to `retrievalQueryText` (use `buildInstructionRetrievalQuery(ctx)` from caller).
 */
export async function buildClientInstructionsWithEmbeddingOrder(
  genAI: GoogleGenerativeAI,
  chunks: ClientInstructionChunk[],
  retrievalQueryText: string,
): Promise<string> {
  if (chunks.length === 0) return "";
  if (chunks.length === 1) return chunks[0]!.text;

  const modelName = getGeminiEmbedding2ModelName();
  const model = genAI.getGenerativeModel({ model: modelName });
  const queryRes = await model.embedContent({
    content: { role: "user", parts: [{ text: retrievalQueryText }] },
    taskType: TaskType.RETRIEVAL_QUERY,
  });
  const qVec = queryRes.embedding.values;
  if (!qVec?.length) {
    return joinClientInstructionChunksCanonical(chunks);
  }

  const cache = vecCacheForModel(modelName);
  const missing = chunks.filter((c) => !cache.has(djb2Key(c.text)));

  if (missing.length > 0) {
    const { embeddings } = await model.batchEmbedContents({
      requests: missing.map((c) => ({
        content: { role: "user", parts: [{ text: c.text }] },
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: c.id.slice(0, 50),
      })),
    });
    missing.forEach((c, i) => {
      const values = embeddings[i]?.values;
      if (values?.length) cache.set(djb2Key(c.text), values);
    });
  }

  const scored = chunks.map((c) => {
    const vec = cache.get(djb2Key(c.text));
    if (!vec?.length) return { c, score: 0 };
    return { c, score: cosineSimilarity(qVec, vec) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.c.text).join("\n\n").trim();
}
