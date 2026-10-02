/**
 * Translate author job title + bio into the target post locale (display name unchanged).
 */
import type { Locale } from "@/lib/types/db";
import type { AuthorForBlock } from "@/lib/agent/internal-link";
import { localeWritingLanguageInstruction } from "@/lib/agent/locale-language";
import { stripModelJsonFences, type TextLlmClient } from "@/lib/agent/text-llm";

export async function localizeAuthorForLocale(
  textLlm: TextLlmClient,
  author: AuthorForBlock | null,
  targetLocale: Locale,
): Promise<AuthorForBlock | null> {
  if (!author?.displayName?.trim()) return author;
  const job = author.jobTitle?.trim() ?? "";
  const bio = author.bio?.trim() ?? "";
  if (!job && !bio) return author;

  const langName = localeWritingLanguageInstruction(targetLocale);
  const raw = await textLlm.generateText({
    temperature: 0.2,
    assistant: "author_localization",
    prompt: `Translate the author byline into ${langName}.
Keep the display name unchanged if it is a person's name or brand.
Translate job title and bio fully into natural ${langName}.

Name: ${author.displayName}
Job title: ${job}
Bio: ${bio}

Return JSON only: {"author_job_title":"...","author_bio":"..."}`,
  });

  const parsed = JSON.parse(stripModelJsonFences(raw)) as {
    author_job_title?: string;
    author_bio?: string;
  };
  return {
    displayName: author.displayName,
    jobTitle: parsed.author_job_title?.trim() || author.jobTitle,
    bio: parsed.author_bio?.trim() || author.bio,
    avatarUrl: author.avatarUrl,
  };
}
