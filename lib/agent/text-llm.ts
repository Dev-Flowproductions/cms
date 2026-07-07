import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getAiProvider, getGeminiTextModelName } from "./ai-config";
import { createEmbeddingService, type EmbeddingService } from "./embedding-service";
import { openAiChatWithModelFallback } from "./openai-chat";
import { recordAiTokenUsage } from "./token-usage";

export type TextLlmProvider = "gemini" | "openai";

export type TextLlmClient = {
  provider: TextLlmProvider;
  modelName: string;
  generateText(options: {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    assistant?: string;
  }): Promise<string>;
};

export type AgentLlmBundle = {
  text: TextLlmClient;
  openai: OpenAI | null;
  embeddings: EmbeddingService;
  gemini: GoogleGenerativeAI | null;
  geminiApiKey: string | null;
};

export function getTextLlmProvider(): TextLlmProvider {
  return getAiProvider();
}

export function stripModelJsonFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function createGeminiTextClient(apiKey: string): TextLlmClient {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = getGeminiTextModelName();
  return {
    provider: "gemini",
    modelName,
    async generateText({ prompt, systemInstruction, temperature, maxOutputTokens, assistant }) {
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(temperature != null || maxOutputTokens != null
          ? {
              generationConfig: {
                ...(temperature != null ? { temperature } : {}),
                ...(maxOutputTokens != null ? { maxOutputTokens } : {}),
              },
            }
          : {}),
      });
      const result = await model.generateContent(prompt);
      const meta = result.response.usageMetadata;
      if (meta) {
        recordAiTokenUsage({
          operation: "chat",
          provider: "gemini",
          model: modelName,
          assistant: assistant ?? "post_writer",
          promptTokens: meta.promptTokenCount ?? 0,
          completionTokens: meta.candidatesTokenCount ?? 0,
          totalTokens: meta.totalTokenCount ?? 0,
        });
      }
      return result.response.text().trim();
    },
  };
}

function createOpenAiTextClient(openai: OpenAI): TextLlmClient {
  let resolvedModel = process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-4.1-mini";
  return {
    provider: "openai",
    get modelName() {
      return resolvedModel;
    },
    async generateText(options) {
      const { text, model } = await openAiChatWithModelFallback(openai, options);
      resolvedModel = model;
      return text;
    },
  };
}

function isOpenAiQuotaOrRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|quota|rate limit|insufficient_quota|billing/i.test(msg);
}

function withOpenAiQuotaFallback(primary: TextLlmClient, secondary: TextLlmClient | null): TextLlmClient {
  if (!secondary) return primary;
  return {
    provider: primary.provider,
    get modelName() {
      return primary.modelName;
    },
    async generateText(options) {
      try {
        return await primary.generateText(options);
      } catch (err) {
        if (!isOpenAiQuotaOrRateLimitError(err)) throw err;
        console.warn(
          `[text-llm] OpenAI quota/rate limit (${err instanceof Error ? err.message : err}) — falling back to Gemini (${secondary.modelName})`,
        );
        return secondary.generateText(options);
      }
    },
  };
}

function withGeminiQuotaFallback(primary: TextLlmClient, secondary: TextLlmClient | null): TextLlmClient {
  if (!secondary) return primary;
  return {
    provider: primary.provider,
    get modelName() {
      return primary.modelName;
    },
    async generateText(options) {
      try {
        return await primary.generateText(options);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const retryable = /429|quota|rate limit|resource exhausted|billing/i.test(msg);
        if (!retryable) throw err;
        console.warn(
          `[text-llm] Gemini quota/rate limit (${msg}) — falling back to OpenAI (${secondary.modelName})`,
        );
        return secondary.generateText(options);
      }
    },
  };
}

/**
 * Gemini-first agent stack (text, embeddings, cover images, vision).
 * Set AI_PROVIDER=openai for the OpenAI stack.
 */
export function createAgentLlmBundle(): AgentLlmBundle {
  const provider = getAiProvider();
  const openaiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const geminiKey = process.env.GEMINI_API_KEY?.trim() ?? "";

  if (provider === "gemini" && !geminiKey) {
    throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini");
  }
  if (provider === "openai" && !openaiKey) {
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
  }

  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
  const gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
  const geminiText = geminiKey ? createGeminiTextClient(geminiKey) : null;
  const openaiText = openai ? createOpenAiTextClient(openai) : null;

  let text: TextLlmClient;
  if (provider === "gemini") {
    text = withGeminiQuotaFallback(geminiText!, openaiText);
  } else {
    text = withOpenAiQuotaFallback(openaiText!, geminiText);
  }

  const embeddings = createEmbeddingService(openai, gemini);

  return { text, openai, embeddings, gemini, geminiApiKey: geminiKey || null };
}

/** Helpers for cover generation and reference vision call sites. */
export function coverImageClientsFromLlm(llm: AgentLlmBundle) {
  return { openai: llm.openai, geminiApiKey: llm.geminiApiKey };
}

export function coverVisionClientsFromLlm(llm: AgentLlmBundle) {
  return { openai: llm.openai, gemini: llm.gemini };
}
