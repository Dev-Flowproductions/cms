import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getAiProvider } from "./ai-config";
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
  openai: OpenAI;
  embeddings: EmbeddingService;
  /** Only set when AI_PROVIDER=gemini and GEMINI_API_KEY is configured. */
  gemini: GoogleGenerativeAI | null;
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
  const modelName = process.env.GEMINI_TEXT_MODEL?.trim() || "gemini-3.1-flash-lite-preview";
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

/** When OpenAI is out of quota, retry with Gemini if configured. */
function withGeminiQuotaFallback(primary: TextLlmClient, gemini: TextLlmClient | null): TextLlmClient {
  if (!gemini) return primary;
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
          `[text-llm] OpenAI quota/rate limit (${err instanceof Error ? err.message : err}) — falling back to Gemini (${gemini.modelName})`,
        );
        return gemini.generateText(options);
      }
    },
  };
}

/**
 * OpenAI-first agent stack (text, embeddings, cover images, vision).
 * Set AI_PROVIDER=gemini to restore Google Gemini for text/embeddings (covers still need OpenAI unless extended).
 */
export function createAgentLlmBundle(): AgentLlmBundle {
  const provider = getAiProvider();
  const openaiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const geminiKey = process.env.GEMINI_API_KEY?.trim() ?? "";

  if (!openaiKey) {
    throw new Error("OPENAI_API_KEY is required (default AI provider is OpenAI)");
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

  let text: TextLlmClient;
  const geminiText = geminiKey ? createGeminiTextClient(geminiKey) : null;
  if (provider === "gemini") {
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini");
    }
    text = createGeminiTextClient(geminiKey);
  } else {
    text = withGeminiQuotaFallback(createOpenAiTextClient(openai), geminiText);
  }

  const embeddings = createEmbeddingService(openai, gemini);

  return { text, openai, embeddings, gemini };
}
