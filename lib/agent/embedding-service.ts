import type OpenAI from "openai";
import type { GoogleGenerativeAI } from "@google/generative-ai";
import { TaskType } from "@google/generative-ai";
import { getAiProvider, getOpenAiEmbeddingModelChain } from "./ai-config";
import { recordAiTokenUsage } from "./token-usage";

export type EmbeddingChunk = { id: string; text: string };

export interface EmbeddingService {
  readonly provider: "openai" | "gemini";
  readonly modelName: string;
  embedQuery(text: string): Promise<number[]>;
  embedDocuments(chunks: EmbeddingChunk[]): Promise<Map<string, number[]>>;
}

function djb2Key(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i)!;
  }
  return `${s.length}:${(h >>> 0).toString(16)}`;
}

const openAiDocCache = new Map<string, Map<string, number[]>>();
const geminiDocCache = new Map<string, Map<string, number[]>>();

function vecCacheForModel(
  store: Map<string, Map<string, number[]>>,
  model: string,
): Map<string, number[]> {
  let m = store.get(model);
  if (!m) {
    m = new Map();
    store.set(model, m);
  }
  return m;
}

export function createOpenAiEmbeddingService(openai: OpenAI): EmbeddingService {
  const models = getOpenAiEmbeddingModelChain();
  let activeModel = models[0]!;

  async function embedInputs(inputs: string[]): Promise<number[][]> {
    let lastErr: unknown;
    for (const model of models) {
      try {
        const res = await openai.embeddings.create({ model, input: inputs });
        activeModel = model;
        if (res.usage?.total_tokens) {
          recordAiTokenUsage({
            operation: "embedding",
            provider: "openai",
            model,
            assistant: "instruction_embedding",
            promptTokens: res.usage.prompt_tokens ?? res.usage.total_tokens,
            totalTokens: res.usage.total_tokens,
          });
        }
        return res.data.map((row) => row.embedding);
      } catch (e) {
        lastErr = e;
        console.warn(`[embeddings] OpenAI model ${model} failed:`, e instanceof Error ? e.message : e);
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error("OpenAI embedding failed for all models");
  }

  return {
    provider: "openai",
    get modelName() {
      return activeModel;
    },
    async embedQuery(text) {
      const [vec] = await embedInputs([text]);
      if (!vec?.length) throw new Error("Empty query embedding");
      return vec;
    },
    async embedDocuments(chunks) {
      const cache = vecCacheForModel(openAiDocCache, activeModel);
      const missing = chunks.filter((c) => !cache.has(djb2Key(c.text)));
      if (missing.length > 0) {
        const vectors = await embedInputs(missing.map((c) => c.text));
        missing.forEach((c, i) => {
          const v = vectors[i];
          if (v?.length) cache.set(djb2Key(c.text), v);
        });
      }
      const out = new Map<string, number[]>();
      for (const c of chunks) {
        const v = cache.get(djb2Key(c.text));
        if (v?.length) out.set(c.id, v);
      }
      return out;
    },
  };
}

function getGeminiEmbeddingModelName(): string {
  return process.env.GEMINI_EMBEDDING_MODEL?.trim() || "gemini-embedding-2-preview";
}

export function createGeminiEmbeddingService(genAI: GoogleGenerativeAI): EmbeddingService {
  const modelName = getGeminiEmbeddingModelName();
  const model = genAI.getGenerativeModel({ model: modelName });

  return {
    provider: "gemini",
    modelName,
    async embedQuery(text) {
      const queryRes = await model.embedContent({
        content: { role: "user", parts: [{ text }] },
        taskType: TaskType.RETRIEVAL_QUERY,
      });
      const qVec = queryRes.embedding.values;
      if (!qVec?.length) throw new Error("Empty query embedding");
      return qVec;
    },
    async embedDocuments(chunks) {
      const cache = vecCacheForModel(geminiDocCache, modelName);
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
      const out = new Map<string, number[]>();
      for (const c of chunks) {
        const v = cache.get(djb2Key(c.text));
        if (v?.length) out.set(c.id, v);
      }
      return out;
    },
  };
}

export function createEmbeddingService(openai: OpenAI, gemini: GoogleGenerativeAI | null): EmbeddingService {
  if (getAiProvider() === "gemini") {
    if (!gemini) throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini");
    return createGeminiEmbeddingService(gemini);
  }
  return createOpenAiEmbeddingService(openai);
}
