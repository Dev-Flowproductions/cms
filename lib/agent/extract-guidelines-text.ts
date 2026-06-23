/**
 * Turn an uploaded guidelines file into plain text for cover prompts.
 * Text formats are read directly; PDF uses OpenAI vision (no Gemini).
 */

import OpenAI from "openai";
import { getOpenAiVisionModelChain } from "./ai-config";
import { bufferContainsPdfHeader } from "@/lib/agent/guidelines-upload";
import { openAiVisionWithModelFallback } from "./openai-chat";

const MAX_TEXT_CHARS = 12_000;

const PDF_EXTRACT_PROMPT = `Extract brand and visual guidelines from this document as concise plain text: bullet list of rules for illustration style, colours, typography, composition, and anything that must appear or be avoided on marketing banners. Max 2000 words. No preamble — start with bullets.`;

export async function extractBrandGuidelinesText(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const lower = mimeType.toLowerCase();
  const nameLower = fileName.toLowerCase();

  if (lower.includes("pdf") || nameLower.endsWith(".pdf") || bufferContainsPdfHeader(buffer)) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return "";

    const openai = new OpenAI({ apiKey });
    const base64 = buffer.toString("base64");
    try {
      const out = await openAiVisionWithModelFallback(
        openai,
        PDF_EXTRACT_PROMPT,
        [{ mimeType: "application/pdf", base64 }],
        getOpenAiVisionModelChain(),
        "guidelines_vision",
      );
      return out.slice(0, MAX_TEXT_CHARS);
    } catch (e) {
      console.warn("[extract-guidelines] OpenAI PDF extract failed:", e);
      return "";
    }
  }

  if (
    lower.includes("text/plain") ||
    lower.includes("text/markdown") ||
    nameLower.endsWith(".md") ||
    nameLower.endsWith(".txt")
  ) {
    const t = buffer.toString("utf8").trim();
    return t.slice(0, MAX_TEXT_CHARS);
  }

  return "";
}
