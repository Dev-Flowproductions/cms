import type OpenAI from "openai";
import { getOpenAiTextModelChain, getOpenAiVisionModelChain } from "./ai-config";

export type OpenAiChatOptions = {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export async function openAiChatWithModelFallback(
  openai: OpenAI,
  options: OpenAiChatOptions,
  modelChain: string[] = getOpenAiTextModelChain(),
): Promise<{ text: string; model: string }> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (options.systemInstruction?.trim()) {
    messages.push({ role: "system", content: options.systemInstruction.trim() });
  }
  messages.push({ role: "user", content: options.prompt });

  let lastErr: unknown;
  for (const model of modelChain) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages,
        ...(options.temperature != null ? { temperature: options.temperature } : {}),
        ...(options.maxOutputTokens != null ? { max_tokens: options.maxOutputTokens } : {}),
      });
      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      if (text) return { text, model };
    } catch (e) {
      lastErr = e;
      console.warn(`[openai-chat] model ${model} failed:`, e instanceof Error ? e.message : e);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("OpenAI chat failed for all models in chain");
}

export type OpenAiVisionImagePart = { mimeType: string; base64: string };

export async function openAiVisionWithModelFallback(
  openai: OpenAI,
  systemOrUserText: string,
  images: OpenAiVisionImagePart[],
  modelChain: string[] = getOpenAiVisionModelChain(),
): Promise<string> {
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: systemOrUserText },
    ...images.slice(0, 5).map((img) => ({
      type: "image_url" as const,
      image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
    })),
  ];

  let lastErr: unknown;
  for (const model of modelChain) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content }],
        max_tokens: 1024,
      });
      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      if (text) return text;
    } catch (e) {
      lastErr = e;
      console.warn(`[openai-vision] model ${model} failed:`, e instanceof Error ? e.message : e);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("OpenAI vision failed for all models in chain");
}
