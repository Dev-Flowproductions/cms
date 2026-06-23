/**
 * Translate author job title + bio into the target post locale (display name unchanged).
 */
import type OpenAI from "openai";
import type { Locale } from "@/lib/types/db";
import type { AuthorForBlock } from "@/lib/agent/internal-link";
import { recordAiTokenUsage } from "@/lib/agent/token-usage";

const LOCALE_NAME: Record<Locale, string> = {
  en: "English",
  pt: "Portuguese",
  fr: "French",
};

export async function localizeAuthorForLocale(
  openai: OpenAI,
  author: AuthorForBlock | null,
  targetLocale: Locale,
): Promise<AuthorForBlock | null> {
  if (!author?.displayName?.trim()) return author;
  const job = author.jobTitle?.trim() ?? "";
  const bio = author.bio?.trim() ?? "";
  if (!job && !bio) return author;

  const langName = LOCALE_NAME[targetLocale] ?? targetLocale;
  const model = "gpt-4.1-mini";
  const res = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `Translate the author byline into ${langName}.
Keep the display name unchanged if it is a person's name or brand.
Translate job title and bio fully into natural ${langName}.

Name: ${author.displayName}
Job title: ${job}
Bio: ${bio}

Return JSON: {"author_job_title":"...","author_bio":"..."}`,
      },
    ],
  });

  const usage = res.usage;
  if (usage) {
    recordAiTokenUsage({
      operation: "chat",
      provider: "openai",
      model,
      assistant: "author_localization",
      promptTokens: usage.prompt_tokens ?? 0,
      completionTokens: usage.completion_tokens ?? 0,
      totalTokens: usage.total_tokens ?? 0,
    });
  }

  const text = res.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as { author_job_title?: string; author_bio?: string };
  return {
    displayName: author.displayName,
    jobTitle: parsed.author_job_title?.trim() || author.jobTitle,
    bio: parsed.author_bio?.trim() || author.bio,
    avatarUrl: author.avatarUrl,
  };
}
