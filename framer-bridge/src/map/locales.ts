import type { Locale } from "framer-api";
import type { CmsLocale } from "../config.js";

const CMS_LOCALES: CmsLocale[] = ["en", "pt", "fr"];

export type FramerLocaleMap = Partial<Record<CmsLocale, string>>;

/**
 * Parse FRAMER_LOCALE_MAP like "pt:abc123,en:def456,fr:ghi789"
 */
export function parseLocaleMapEnv(raw: string | undefined): FramerLocaleMap {
  const out: FramerLocaleMap = {};
  if (!raw?.trim()) return out;

  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    if (colon <= 0) continue;
    const cms = trimmed.slice(0, colon).trim().toLowerCase();
    const framerId = trimmed.slice(colon + 1).trim();
    if ((cms === "pt" || cms === "en" || cms === "fr") && framerId) {
      out[cms] = framerId;
    }
  }
  return out;
}

function languagePrefix(code: string): string {
  return code.trim().toLowerCase().split("-")[0] ?? "";
}

/**
 * Auto-match Framer locales to CMS pt/en/fr by code/slug; env override wins.
 */
export function buildCmsToFramerLocaleMap(
  framerLocales: readonly Locale[],
  override: FramerLocaleMap
): {
  map: FramerLocaleMap;
  skipped: string[];
  matched: CmsLocale[];
} {
  const map: FramerLocaleMap = { ...override };
  const skipped: string[] = [];
  const matched: CmsLocale[] = [];

  for (const cms of CMS_LOCALES) {
    if (map[cms]) {
      const exists = framerLocales.some((locale) => locale.id === map[cms]);
      if (!exists && framerLocales.length > 0) {
        skipped.push(`${cms}(override id not in project)`);
        delete map[cms];
        continue;
      }
      matched.push(cms);
      continue;
    }

    const found = framerLocales.find((locale) => {
      const slug = locale.slug?.trim().toLowerCase();
      const prefix = languagePrefix(locale.code ?? "");
      return slug === cms || prefix === cms;
    });

    if (found) {
      map[cms] = found.id;
      matched.push(cms);
    }
  }

  return { map, skipped, matched };
}
