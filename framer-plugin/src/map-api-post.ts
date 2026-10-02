import type {
    FieldDataInput,
    LocalizationGroupStatusByLocale,
    LocalizationSourceUpdate,
    ManagedCollectionItemInput,
} from "@framer/plugin"
import { FIELD_IDS } from "./fields"
import type { FramerLocaleMap } from "./locales"
import type { CmsLocale } from "./storage"
import type { ApiPost } from "./witflow-api"

const CMS_LOCALES: CmsLocale[] = ["en", "pt", "fr"]

interface LocaleBlock {
    locale: CmsLocale
    title: string
    excerpt: string
    contentMd: string
    seoTitle: string
    metaDescription: string
}

function nonEmpty(...values: Array<string | null | undefined>): string {
    for (const value of values) {
        if (typeof value === "string" && value.trim() !== "") return value
    }
    return ""
}

function slugify(input: string): string {
    return (
        input
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 120) || "post"
    )
}

function normalizeLocale(value: string | undefined | null): CmsLocale | null {
    if (!value) return null
    const locale = value.trim().toLowerCase()
    if (locale === "pt" || locale === "en" || locale === "fr") return locale
    return null
}

function collectLocaleBlocks(post: ApiPost): Partial<Record<CmsLocale, LocaleBlock>> {
    const out: Partial<Record<CmsLocale, LocaleBlock>> = {}
    const translations = post.translations ?? {}
    const topLocale = normalizeLocale(post.locale)

    for (const locale of CMS_LOCALES) {
        const block = translations[locale]
        const fromTranslation = Boolean(block && typeof block === "object")
        const useTopLevel = !fromTranslation && (!topLocale || topLocale === locale)

        const title = nonEmpty(fromTranslation ? block?.title : undefined, useTopLevel ? post.title : undefined)
        const excerpt = nonEmpty(
            fromTranslation ? block?.excerpt : undefined,
            useTopLevel ? post.excerpt : undefined
        )
        const contentMd = nonEmpty(
            fromTranslation ? block?.content : undefined,
            useTopLevel ? post.content : undefined
        )
        const seoTitle = nonEmpty(
            fromTranslation ? block?.seoTitle : undefined,
            useTopLevel ? post.seoTitle : undefined
        )
        const metaDescription = nonEmpty(
            fromTranslation ? block?.seoDescription : undefined,
            useTopLevel ? post.seoDescription : undefined
        )

        if (!title && !excerpt && !contentMd && !seoTitle && !metaDescription) continue

        out[locale] = {
            locale,
            title: title || "Untitled",
            excerpt,
            contentMd,
            seoTitle,
            metaDescription,
        }
    }

    if (Object.keys(out).length === 0) {
        const locale = topLocale ?? "en"
        out[locale] = {
            locale,
            title: nonEmpty(post.title) || "Untitled",
            excerpt: nonEmpty(post.excerpt),
            contentMd: nonEmpty(post.content),
            seoTitle: nonEmpty(post.seoTitle),
            metaDescription: nonEmpty(post.seoDescription),
        }
    }

    return out
}

function valueByLocaleFor(
    byLocale: Partial<Record<CmsLocale, LocaleBlock>>,
    localeMap: FramerLocaleMap,
    baseLocale: CmsLocale,
    pick: (block: LocaleBlock) => string
): LocalizationSourceUpdate | undefined {
    const update: LocalizationSourceUpdate = {}
    let hasOther = false

    for (const [cms, block] of Object.entries(byLocale) as Array<[CmsLocale, LocaleBlock]>) {
        if (!block || cms === baseLocale) continue
        const framerId = localeMap[cms]
        if (!framerId) continue
        update[framerId] = { action: "set", value: pick(block) }
        hasOther = true
    }

    return hasOther ? update : undefined
}

/**
 * Map API post → Managed item.
 * default_locale = base `value`; other locales → valueByLocale when Framer has matching locales.
 */
export function mapApiPostToItem(
    post: ApiPost,
    defaultLocale: CmsLocale,
    localeMap: FramerLocaleMap
): ManagedCollectionItemInput {
    const byLocale = collectLocaleBlocks(post)
    const base = byLocale[defaultLocale] ?? CMS_LOCALES.map(locale => byLocale[locale]).find(Boolean)
    if (!base) {
        throw new Error(`No locale content for post ${post.id}`)
    }

    const slug = (post.slug?.trim() && slugify(post.slug)) || slugify(base.title)

    const statusByLocale: LocalizationGroupStatusByLocale = {}
    for (const cms of Object.keys(byLocale) as CmsLocale[]) {
        const framerId = localeMap[cms]
        if (framerId) statusByLocale[framerId] = "ready"
    }

    const fieldData: FieldDataInput = {
        [FIELD_IDS.title]: {
            type: "string",
            value: base.title,
            valueByLocale: valueByLocaleFor(byLocale, localeMap, base.locale, b => b.title),
        },
        [FIELD_IDS.excerpt]: {
            type: "string",
            value: base.excerpt,
            valueByLocale: valueByLocaleFor(byLocale, localeMap, base.locale, b => b.excerpt),
        },
        [FIELD_IDS.content]: {
            type: "formattedText",
            value: base.contentMd,
            contentType: "markdown",
            valueByLocale: valueByLocaleFor(byLocale, localeMap, base.locale, b => b.contentMd),
        },
        [FIELD_IDS.cover]: post.coverImageUrl
            ? {
                  type: "image",
                  value: post.coverImageUrl,
                  alt: nonEmpty(post.coverImageAlt, "Cover image"),
              }
            : { type: "image", value: null },
        [FIELD_IDS.seoTitle]: {
            type: "string",
            value: base.seoTitle,
            valueByLocale: valueByLocaleFor(byLocale, localeMap, base.locale, b => b.seoTitle),
        },
        [FIELD_IDS.metaDescription]: {
            type: "string",
            value: base.metaDescription,
            valueByLocale: valueByLocaleFor(byLocale, localeMap, base.locale, b => b.metaDescription),
        },
    }

    return {
        id: post.id,
        slug,
        draft: false,
        fieldData,
        ...(Object.keys(statusByLocale).length > 0 ? { statusByLocale } : {}),
    }
}
