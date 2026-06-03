/**
 * Translate author job title + bio into the target post locale (display name unchanged).
 */
import type OpenAI from "openai";
import type { Locale } from "@/lib/types/db";
import type { AuthorForBlock } from "@/lib/agent/internal-link";

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
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
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

  const text = res.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as { author_job_title?: string; author_bio?: string };
  return {
    displayName: author.displayName,
    jobTitle: parsed.author_job_title?.trim() || author.jobTitle,
    bio: parsed.author_bio?.trim() || author.bio,
    avatarUrl: author.avatarUrl,
  };
}
