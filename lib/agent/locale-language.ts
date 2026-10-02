/**
 * Human-readable language labels for generation / translation prompts.
 * Locale `pt` always means European Portuguese (Portugal), never Brazilian.
 */
import type { Locale } from "@/lib/types/db";

/** Short label for embeddings / lightweight prompts. */
export function localeLanguageShortName(locale: Locale | string): string {
  switch (locale) {
    case "pt":
      return "European Portuguese (Portugal / pt-PT)";
    case "en":
      return "English";
    case "fr":
      return "French";
    default:
      return String(locale);
  }
}

/**
 * Full writing-language instruction for post generation and translation.
 * Keep vocabulary + grammar differences explicit so models do not default to pt-BR.
 */
export function localeWritingLanguageInstruction(locale: Locale | string): string {
  switch (locale) {
    case "pt":
      return [
        "European Portuguese from Portugal (pt-PT) — NEVER Brazilian Portuguese (pt-BR).",
        "Vocabulary (Portugal, not Brazil): utilizador (not usuário), ficheiro (not arquivo for computer files), ecrã (not tela), telemóvel (not celular), autocarro (not ônibus), comboio (not trem), pequeno-almoço (not café da manhã), equipa (not time), descarregar (not baixar), aplicação/app (prefer European phrasing), contacto (not contato), aspeto (not aspecto).",
        "Grammar (Portugal): prefer «estar a + infinitivo» (estou a trabalhar, está a crescer) — NOT the Brazilian gerund «estou trabalhando / está crescendo». Prefer European pronoun placement and register suitable for Portugal audiences.",
        "Do not use Brazilian slang, Brazilian marketing clichés, or pt-BR-only spellings/idioms. If unsure between pt-PT and pt-BR, always choose Portugal.",
      ].join(" ");
    case "en":
      return "English";
    case "fr":
      return "French";
    default:
      return String(locale);
  }
}
