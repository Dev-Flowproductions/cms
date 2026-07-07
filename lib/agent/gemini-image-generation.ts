/**
 * Blog cover images via Gemini Nano Banana (Generate Content API — July 2026 GA models).
 */
import { GoogleGenAI, type Part } from "@google/genai";
import { getGeminiImageModelChain } from "./ai-config";
import { recordAiTokenUsage } from "./token-usage";

type ReferenceImagePart = { mimeType: string; base64: string };

export type GeminiCoverImageOptions = {
  apiKey: string;
  prompt: string;
  logLabel: string;
  referenceImages?: ReferenceImagePart[];
  aspectRatio?: string;
  imageSize?: string;
};

function buildContents(prompt: string, referenceImages?: ReferenceImagePart[]): Part[] {
  const refs = referenceImages?.filter((r) => r.base64?.length) ?? [];
  const text =
    refs.length > 0
      ? `${prompt}\n\n` +
        `The ${refs.length} attached image(s) are the client's reference banner examples. ` +
        `Generate a new banner that matches their visual medium, colour mood, composition density, and typography style. ` +
        `Do not copy logos or trademarks.`
      : prompt;

  return [
    { text },
    ...refs.slice(0, 3).map(
      (img): Part => ({
        inlineData: { mimeType: img.mimeType, data: img.base64 },
      }),
    ),
  ];
}

export async function generateGeminiCoverImageBuffer(
  options: GeminiCoverImageOptions,
): Promise<Buffer | null> {
  const ai = new GoogleGenAI({ apiKey: options.apiKey });
  const aspectRatio = options.aspectRatio ?? "16:9";
  const imageSize = options.imageSize ?? "1K";
  const contents = buildContents(options.prompt, options.referenceImages);

  let lastErr: unknown;
  for (const model of getGeminiImageModelChain()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      });

      const imageData = response.data;
      if (!imageData) {
        console.warn(`[${options.logLabel}] Gemini ${model}: no inline image data`);
        continue;
      }

      const usage = response.usageMetadata;
      recordAiTokenUsage({
        operation: "image",
        provider: "gemini",
        model,
        assistant: "cover_image",
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
      });

      return Buffer.from(imageData, "base64");
    } catch (e) {
      lastErr = e;
      console.warn(
        `[${options.logLabel}] Gemini image model ${model} failed:`,
        e instanceof Error ? e.message : e,
      );
    }
  }

  if (lastErr instanceof Error) throw lastErr;
  return null;
}
