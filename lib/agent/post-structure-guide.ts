import type { Locale } from "@/lib/types/db";
import { FAQ_HEADING_BY_LOCALE } from "@/lib/agent/faq-heading";
import { CONTENT_TYPE_PROMPT_HINT } from "@/lib/agent/instruction-chunks";

export type PostStructureSection = {
  title: string;
  items: string[];
};

/** Human-readable structure checklist for manual / admin post editing. */
export function getPostStructureGuide(
  locale: Locale,
  contentType: "hero" | "hub" | "hygiene"
): PostStructureSection[] {
  const faqHeading = FAQ_HEADING_BY_LOCALE[locale] ?? FAQ_HEADING_BY_LOCALE.en;
  const wordHint = CONTENT_TYPE_PROMPT_HINT[contentType] ?? CONTENT_TYPE_PROMPT_HINT.hero;

  return [
    {
      title: "Before you start",
      items: [
        "The post title is stored separately — do not put an H1 in the markdown body.",
        "Do not add a date line or cover image in markdown — the template renders those.",
        "Do not add an author bio section — the platform appends it after publish.",
        `Target length: ${wordHint}.`,
      ],
    },
    {
      title: "Body order (content_md)",
      items: [
        "1. Intro — 2–3 sentences with one data-backed claim and a bold definition of the focus term.",
        "2–4. Body — ## H2 and ### H3 sections; short paragraphs; mix lists and punchline lines; at least 2 question-style H2s with 40–60 word direct answers.",
        `5. FAQ — required H2: ${faqHeading.replace(/^##\s*/, "")} — exactly 5 Q&As as **Question** then answer (40–60 words each).`,
        "6. Conclusion — ## action-oriented heading, 2 paragraphs, specific CTA.",
      ],
    },
    {
      title: "SEO fields",
      items: [
        "Focus keyword in title, first paragraph, 2+ H2s, seo_title, and seo_description.",
        "SEO title: 50–60 characters. Meta description: 145–158 characters.",
        "Headings in markdown are ## or ### only — never #.",
      ],
    },
  ];
}

export function formatStructureGuideForPrompt(
  locale: Locale,
  contentType: "hero" | "hub" | "hygiene" = "hero"
): string {
  return getPostStructureGuide(locale, contentType)
    .map((section) => `${section.title}:\n${section.items.map((i) => `- ${i}`).join("\n")}`)
    .join("\n\n");
}

export function previewFontFamily(fontStyle: string | null | undefined): string {
  const s = (fontStyle ?? "modern").toLowerCase();
  if (s.includes("serif") || s.includes("classic") || s.includes("traditional")) {
    return '"Georgia", "Times New Roman", serif';
  }
  if (s.includes("mono") || s.includes("technical")) {
    return '"JetBrains Mono", "Fira Code", monospace';
  }
  if (s.includes("playful") || s.includes("rounded")) {
    return '"Nunito", "Segoe UI", sans-serif';
  }
  return '"Inter", system-ui, -apple-system, sans-serif';
}
