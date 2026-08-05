import type { Locale } from "@/lib/types/db";
import { stripModelJsonFences, createAgentLlmBundle } from "@/lib/agent/text-llm";
import { normalizeFaqHeading } from "@/lib/agent/faq-heading";
import { localeWritingLanguageInstruction } from "@/lib/agent/locale-language";

const IMPROVE_SYSTEM = `You are an expert blog editor. Improve the given field while preserving the author's intent.
- Match the client's brand voice when instructions are provided.
- For title: make it clearer, more compelling, and SEO-friendly (sentence case, no clickbait).
- For content: polish prose, fix grammar, improve scannability — keep existing ## / ### structure, lists, and FAQ section.
- Never add an H1 (# heading) — the title is stored separately.
- Never add author bio, date, or cover image placeholders.
- When the language is Portuguese, use European Portuguese (Portugal / pt-PT) only — never Brazilian Portuguese (prefer «estar a + infinitivo», utilizador, ficheiro, ecrã, telemóvel, autocarro, equipa, contacto).
- Output ONLY valid JSON.`;

export async function improveManualField(options: {
  field: "title" | "content";
  locale: Locale;
  title: string;
  content_md: string;
  brandName?: string | null;
  customInstructions?: string | null;
}): Promise<{ title?: string; content_md?: string }> {
  const llm = createAgentLlmBundle();
  const brandLine = options.brandName?.trim() ? `Brand: ${options.brandName.trim()}` : "";
  const clientBlock = options.customInstructions?.trim()
    ? `\nCLIENT INSTRUCTIONS:\n${options.customInstructions.trim().slice(0, 4000)}`
    : "";
  const language = localeWritingLanguageInstruction(options.locale);

  const fieldPrompt =
    options.field === "title"
      ? `Improve ONLY the post title. Language: ${language}.
Current title: ${JSON.stringify(options.title)}
Context (first 500 chars of body): ${JSON.stringify(options.content_md.slice(0, 500))}
${brandLine}${clientBlock}

Return JSON: { "title": "..." }`
      : `Improve ONLY the markdown body. Language: ${language}.
Post title: ${JSON.stringify(options.title)}
Current content_md:
${options.content_md.slice(0, 12000)}
${brandLine}${clientBlock}

Return JSON: { "content_md": "..." }`;

  const raw = await llm.text.generateText({
    prompt: fieldPrompt,
    systemInstruction: IMPROVE_SYSTEM,
    temperature: 0.4,
    maxOutputTokens: options.field === "title" ? 256 : 8192,
    assistant: "other",
  });

  const parsed = JSON.parse(stripModelJsonFences(raw)) as {
    title?: string;
    content_md?: string;
  };

  if (options.field === "title" && typeof parsed.title === "string" && parsed.title.trim()) {
    return { title: parsed.title.trim() };
  }
  if (options.field === "content" && typeof parsed.content_md === "string" && parsed.content_md.trim()) {
    return { content_md: normalizeFaqHeading(parsed.content_md.trim(), options.locale) };
  }

  throw new Error("Model returned an empty improvement");
}
