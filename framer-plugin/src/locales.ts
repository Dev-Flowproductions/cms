import type { Locale } from "@framer/plugin"
import type { CmsLocale } from "./storage"

const CMS_LOCALES: CmsLocale[] = ["en", "pt", "fr"]

export type FramerLocaleMap = Partial<Record<CmsLocale, string>>

function languagePrefix(code: string): string {
    return code.trim().toLowerCase().split("-")[0] ?? ""
}

/**
 * Auto-match Framer locales to CMS pt/en/fr by code/slug (no UI map).
 */
export function buildCmsToFramerLocaleMap(framerLocales: readonly Locale[]): {
    map: FramerLocaleMap
    matched: CmsLocale[]
    skipped: CmsLocale[]
} {
    const map: FramerLocaleMap = {}
    const matched: CmsLocale[] = []
    const skipped: CmsLocale[] = []

    for (const cms of CMS_LOCALES) {
        const found = framerLocales.find(locale => {
            const slug = locale.slug?.trim().toLowerCase()
            const prefix = languagePrefix(locale.code ?? "")
            return slug === cms || prefix === cms
        })
        if (found) {
            map[cms] = found.id
            matched.push(cms)
        } else {
            skipped.push(cms)
        }
    }

    return { map, matched, skipped }
}
