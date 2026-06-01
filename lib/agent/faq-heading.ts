import type { Locale } from "@/lib/types/db";

export const FAQ_HEADING_BY_LOCALE: Record<Locale, string> = {
  en: "## Frequently asked questions",
  pt: "## Perguntas frequentes",
  fr: "## Questions fréquentes",
};

const FAQ_HEADING_PATTERNS = [
  /^##\s*Perguntas frequentes\s*$/gim,
  /^##\s*Frequently asked questions\s*$/gim,
  /^##\s*Questions fréquentes\s*$/gim,
  /^##\s*FAQ\s*$/gim,
];

/** Replace any FAQ H2 with the heading for the target locale. */
export function normalizeFaqHeading(contentMd: string, locale: string): string {
  const target = FAQ_HEADING_BY_LOCALE[locale as Locale] ?? FAQ_HEADING_BY_LOCALE.en;
  for (const pattern of FAQ_HEADING_PATTERNS) {
    const updated = contentMd.replace(pattern, target);
    if (updated !== contentMd) return updated;
  }
  return contentMd;
}
