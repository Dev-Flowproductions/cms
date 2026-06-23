import type { Locale } from "@/lib/types/db";
import { formatStructureGuideForPrompt } from "@/lib/agent/post-structure-guide";
import { stripModelJsonFences, createAgentLlmBundle } from "@/lib/agent/text-llm";

const COACH_SYSTEM = `You are a friendly, concise writing coach inside a CMS post composer.
You know the required blog post structure (provided in each request). Your job is NOT to rewrite the post — only give brief, actionable advice.

Rules:
- Return 2–4 tips maximum.
- Each tip is one short sentence (under 140 characters), specific to what the author has written so far.
- Say what is missing, weak, or should come next (intro, FAQ, H2 questions, word count, bold definition, etc.).
- If the draft is empty or very short, encourage the next concrete step.
- Match the post language given in the request (pt, en, or fr).
- Never suggest adding H1, date, cover image, or author bio in markdown.
- Output ONLY valid JSON: { "tips": ["...", "..."] }`;

export async function getComposerWritingTips(options: {
  locale: Locale;
  title: string;
  content_md: string;
  brandName?: string | null;
}): Promise<string[]> {
  const llm = createAgentLlmBundle();
  const structure = formatStructureGuideForPrompt(options.locale, "hero");
  const wordCount = options.content_md.trim() ? options.content_md.trim().split(/\s+/).length : 0;
  const brandLine = options.brandName?.trim() ? `Brand: ${options.brandName.trim()}` : "";

  const prompt = `Post language: ${options.locale}
${brandLine}

REQUIRED STRUCTURE:
${structure}

CURRENT DRAFT:
Title: ${JSON.stringify(options.title || "(empty)")}
Word count: ${wordCount}
Body (markdown):
${options.content_md.slice(0, 8000) || "(empty)"}

Give 2–4 specific tips for this draft. JSON only.`;

  const raw = await llm.text.generateText({
    prompt,
    systemInstruction: COACH_SYSTEM,
    temperature: 0.5,
    maxOutputTokens: 512,
    assistant: "other",
  });

  const parsed = JSON.parse(stripModelJsonFences(raw)) as { tips?: unknown };
  if (!Array.isArray(parsed.tips)) return [];

  return parsed.tips
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .map((t) => t.trim())
    .slice(0, 4);
}
