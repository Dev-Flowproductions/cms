import type {
  FieldDataEntryInput,
  FieldDataInput,
  LocalizationGroupStatusByLocale,
  LocalizationSourceUpdate,
  ManagedCollectionField,
} from "framer-api";
import type { CmsLocale } from "../config.js";
import type { FramerLocaleMap } from "./locales.js";
import type { ResolvedLocaleContent } from "../webhook/types.js";

/**
 * Expected Managed Collection field names (case-insensitive).
 * Must stay aligned with framer-plugin FIELD_DEFS names.
 */
export const EXPECTED_FIELDS = {
  title: "title",
  excerpt: "excerpt",
  content: "content",
  cover: "cover",
  seoTitle: "seoTitle",
  metaDescription: "metaDescription",
} as const;

export type ExpectedFieldKey = keyof typeof EXPECTED_FIELDS;

export interface FieldMap {
  byKey: Partial<Record<ExpectedFieldKey, { id: string; type: string; name: string }>>;
  missing: ExpectedFieldKey[];
}

export function buildFieldMap(fields: readonly ManagedCollectionField[]): FieldMap {
  const byName = new Map(
    fields.map((field) => [field.name.trim().toLowerCase(), field] as const)
  );

  const byKey: FieldMap["byKey"] = {};
  const missing: ExpectedFieldKey[] = [];

  for (const [key, expectedName] of Object.entries(EXPECTED_FIELDS) as Array<
    [ExpectedFieldKey, string]
  >) {
    const field = byName.get(expectedName.toLowerCase());
    if (!field) {
      missing.push(key);
      continue;
    }
    byKey[key] = { id: field.id, type: field.type, name: field.name };
  }

  return { byKey, missing };
}

function valueByLocaleFor(
  byLocale: Partial<Record<CmsLocale, ResolvedLocaleContent>>,
  localeMap: FramerLocaleMap,
  baseLocale: CmsLocale,
  pick: (content: ResolvedLocaleContent) => string
): LocalizationSourceUpdate | undefined {
  const update: LocalizationSourceUpdate = {};
  let hasOther = false;

  for (const [cms, content] of Object.entries(byLocale) as Array<[CmsLocale, ResolvedLocaleContent]>) {
    if (!content) continue;
    const framerId = localeMap[cms];
    if (!framerId) continue;
    if (cms === baseLocale) continue;
    const value = pick(content);
    update[framerId] = { action: "set", value };
    hasOther = true;
  }

  return hasOther ? update : undefined;
}

export function buildFieldDataMultiLocale(
  fieldMap: FieldMap,
  base: ResolvedLocaleContent,
  byLocale: Partial<Record<CmsLocale, ResolvedLocaleContent>>,
  localeMap: FramerLocaleMap
): {
  fieldData: FieldDataInput;
  statusByLocale: LocalizationGroupStatusByLocale;
  used: string[];
  skipped: string[];
  localesApplied: CmsLocale[];
  localesSkipped: string[];
} {
  const fieldData: FieldDataInput = {};
  const used: string[] = [];
  const skipped: string[] = [];
  const localesApplied: CmsLocale[] = [];
  const localesSkipped: string[] = [];

  for (const cms of Object.keys(byLocale) as CmsLocale[]) {
    if (localeMap[cms]) {
      localesApplied.push(cms);
    } else {
      localesSkipped.push(cms);
    }
  }

  const statusByLocale: LocalizationGroupStatusByLocale = {};
  for (const cms of localesApplied) {
    const framerId = localeMap[cms];
    if (framerId) statusByLocale[framerId] = "ready";
  }

  const set = (key: ExpectedFieldKey, entry: FieldDataEntryInput | null) => {
    const meta = fieldMap.byKey[key];
    if (!meta) {
      skipped.push(EXPECTED_FIELDS[key]);
      return;
    }
    if (!entry) {
      skipped.push(meta.name);
      return;
    }
    if (entry.type !== meta.type) {
      skipped.push(`${meta.name}(type mismatch: expected ${meta.type}, got ${entry.type})`);
      return;
    }
    fieldData[meta.id] = entry;
    used.push(meta.name);
  };

  const stringLocale = (pick: (c: ResolvedLocaleContent) => string) =>
    valueByLocaleFor(byLocale, localeMap, base.locale, pick);

  set("title", {
    type: "string",
    value: base.title,
    valueByLocale: stringLocale((c) => c.title),
  });
  set("excerpt", {
    type: "string",
    value: base.excerpt,
    valueByLocale: stringLocale((c) => c.excerpt),
  });
  set("content", {
    type: "formattedText",
    value: base.contentMd,
    contentType: "markdown",
    valueByLocale: stringLocale((c) => c.contentMd),
  });
  // Cover is shared across locales (no per-locale image).
  set(
    "cover",
    base.coverImageUrl
      ? {
          type: "image",
          value: base.coverImageUrl,
          alt: base.coverImageAlt,
        }
      : { type: "image", value: null }
  );
  set("seoTitle", {
    type: "string",
    value: base.seoTitle,
    valueByLocale: stringLocale((c) => c.seoTitle),
  });
  set("metaDescription", {
    type: "string",
    value: base.metaDescription,
    valueByLocale: stringLocale((c) => c.metaDescription),
  });

  return { fieldData, statusByLocale, used, skipped, localesApplied, localesSkipped };
}
