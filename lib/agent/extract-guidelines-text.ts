/**
 * Turn an uploaded guidelines file into plain text for cover prompts.
 * Text formats are read directly; PDF uses a short Gemini pass (no embeddings).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { bufferContainsPdfHeader } from "@/lib/agent/guidelines-upload";

const MAX_TEXT_CHARS = 12_000;
const EXTRACT_MODEL = "gemini-3.1-flash-lite-preview";

export async function extractBrandGuidelinesText(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const lower = mimeType.toLowerCase();
  const nameLower = fileName.toLowerCase();

  if (lower.includes("pdf") || nameLower.endsWith(".pdf") || bufferContainsPdfHeader(buffer)) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: EXTRACT_MODEL });
    const base64 = buffer.toString("base64");
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: { mimeType: "application/pdf", data: base64 },
            },
            {
              text: `Extract brand and visual guidelines from this document as concise plain text: bullet list of rules for illustration style, colours, typography, composition, and anything that must appear or be avoided on marketing banners. Max 2000 words. No preamble — start with bullets.`,
            },
          ],
        },
      ],
    });
    const out = result.response.text().trim();
    return out.slice(0, MAX_TEXT_CHARS);
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
