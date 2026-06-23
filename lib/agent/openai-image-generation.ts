/**
 * OpenAI image generation — Responses API + `image_generation` tool (recommended in 2026 docs),
 * with Images API (`/v1/images/generations`) as fallback.
 */
import type OpenAI from "openai";
import type { Response } from "openai/resources/responses/responses";
import {
  getOpenAiImageModelChain,
  getOpenAiResponsesImageModelChain,
  OPENAI_COVER_IMAGE_SIZE,
} from "./ai-config";
import { recordAiTokenUsage } from "./token-usage";

const COVER_SIZE_FALLBACKS = [OPENAI_COVER_IMAGE_SIZE, "1536x1024", "1024x1024"] as const;

type ReferenceImagePart = { mimeType: string; base64: string };

export function extractBase64FromImageGenerationResponse(response: Response): string | null {
  for (const item of response.output ?? []) {
    if (item.type === "image_generation_call") {
      const result = item.result;
      if (typeof result === "string" && result.length > 0) return result;
    }
  }
  return null;
}

function buildResponsesInput(
  prompt: string,
  referenceImages?: ReferenceImagePart[],
): string | OpenAI.Responses.ResponseInput {
  const trimmed = prompt.slice(0, 32_000);
  const refs = referenceImages?.filter((r) => r.base64?.length) ?? [];
  if (!refs.length) return trimmed;

  return [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text:
            `${trimmed}\n\n` +
            `The ${refs.length} attached image(s) are the client's reference banner examples. ` +
            `Generate a new banner that matches their visual medium, colour mood, composition density, and typography style. ` +
            `Do not copy logos or trademarks.`,
        },
        ...refs.slice(0, 3).map((img) => ({
          type: "input_image" as const,
          image_url: `data:${img.mimeType};base64,${img.base64}`,
        })),
      ],
    },
  ] as OpenAI.Responses.ResponseInput;
}

async function generateViaResponsesApi(
  openai: OpenAI,
  prompt: string,
  logLabel: string,
  referenceImages?: ReferenceImagePart[],
): Promise<Buffer | null> {
  const responseModels = getOpenAiResponsesImageModelChain();
  const imageModels = getOpenAiImageModelChain();
  const input = buildResponsesInput(prompt, referenceImages);

  for (const responseModel of responseModels) {
    for (const imageModel of imageModels) {
      for (const size of COVER_SIZE_FALLBACKS) {
        try {
          const response = await openai.responses.create({
            model: responseModel,
            input,
            tools: [
              {
                type: "image_generation",
                model: imageModel,
                size,
                quality: "high",
                background: "opaque",
              },
            ],
          });
          const b64 = extractBase64FromImageGenerationResponse(response);
          if (b64) {
            const usage = response.usage;
            if (usage) {
              recordAiTokenUsage({
                operation: "image",
                provider: "openai",
                model: responseModel,
                assistant: "cover_image",
                promptTokens: usage.input_tokens ?? 0,
                completionTokens: usage.output_tokens ?? 0,
                totalTokens: usage.total_tokens ?? 0,
              });
            }
            const mode = referenceImages?.length ? "multimodal" : "text";
            console.info(
              `[${logLabel}] Cover via Responses API (${mode}, model=${responseModel}, image_tool=${imageModel}, size=${size})`,
            );
            return Buffer.from(b64, "base64");
          }
          console.warn(
            `[${logLabel}] Responses API returned no image (model=${responseModel}, image_tool=${imageModel})`,
          );
        } catch (e) {
          console.warn(
            `[${logLabel}] Responses image failed (model=${responseModel}, image_tool=${imageModel}, size=${size}):`,
            e instanceof Error ? e.message : e,
          );
        }
      }
    }
  }
  return null;
}

async function generateViaImagesApi(
  openai: OpenAI,
  prompt: string,
  logLabel: string,
): Promise<Buffer | null> {
  const models = getOpenAiImageModelChain();
  const trimmed = prompt.slice(0, 32_000);

  for (const model of models) {
    for (const size of COVER_SIZE_FALLBACKS) {
      try {
        const res = await openai.images.generate({
          model,
          prompt: trimmed,
          n: 1,
          size,
          quality: "high",
        });
        const b64 = res.data?.[0]?.b64_json;
        if (b64) {
          recordAiTokenUsage({
            operation: "image",
            provider: "openai",
            model,
            assistant: "cover_image",
            totalTokens: 0,
          });
          console.info(`[${logLabel}] Cover via Images API (${model} @ ${size})`);
          return Buffer.from(b64, "base64");
        }
        console.warn(`[${logLabel}] Images API ${model} @ ${size} returned no bytes`);
      } catch (e) {
        console.warn(
          `[${logLabel}] Images API ${model} @ ${size} failed:`,
          e instanceof Error ? e.message : e,
        );
      }
    }
  }
  return null;
}

/** Preferred path: Responses API (`image_generation` tool), then Images API. */
export async function generateOpenAiCoverImageBuffer(
  openai: OpenAI,
  prompt: string,
  logLabel: string,
  referenceImages?: ReferenceImagePart[],
): Promise<Buffer | null> {
  const viaResponses = await generateViaResponsesApi(openai, prompt, logLabel, referenceImages);
  if (viaResponses) return viaResponses;
  return generateViaImagesApi(openai, prompt, logLabel);
}
