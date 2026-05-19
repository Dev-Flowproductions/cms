/**
 * Ranks **client-specific** instruction sections with embedding similarity.
 */

import type { EmbeddingService } from "./embedding-service";

export type ClientInstructionChunk = { id: string; text: string };

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
  embeddings: EmbeddingService,
  chunks: ClientInstructionChunk[],
  retrievalQueryText: string,
): Promise<string> {
  if (chunks.length === 0) return "";
  if (chunks.length === 1) return chunks[0]!.text;

  const qVec = await embeddings.embedQuery(retrievalQueryText);
  const docMap = await embeddings.embedDocuments(chunks.map((c) => ({ id: c.id, text: c.text })));

  const scored = chunks.map((c) => {
    const vec = docMap.get(c.id);
    if (!vec?.length) return { c, score: 0 };
    return { c, score: cosineSimilarity(qVec, vec) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.c.text).join("\n\n").trim();
}
