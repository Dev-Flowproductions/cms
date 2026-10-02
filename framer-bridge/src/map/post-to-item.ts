import type { CmsLocale } from "../config.js";
import type { ResolvedLocaleContent, WebhookPost } from "../webhook/types.js";

const CMS_LOCALES: CmsLocale[] = ["en", "pt", "fr"];

function normalizeLocale(value: string | undefined | null): CmsLocale | null {
  if (!value) return null;
  const locale = value.trim().toLowerCase();
  if (locale === "pt" || locale === "en" || locale === "fr") return locale;
  return null;
}

function nonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return "";
}

/**
 * All CMS locales present in the webhook payload.
 */
export function collectLocaleContents(
  post: WebhookPost
): Partial<Record<CmsLocale, ResolvedLocaleContent>> {
  const out: Partial<Record<CmsLocale, ResolvedLocaleContent>> = {};
  const translations = post.translations ?? {};
  const coverImageUrl = typeof post.cover_image_url === "string" ? post.cover_image_url : null;
  const coverImageAlt = nonEmpty(post.cover_image_alt, "Cover image");
  const topLocale = normalizeLocale(post.locale);

  for (const locale of CMS_LOCALES) {
    const block = translations[locale];
    const fromTranslation = Boolean(block && typeof block === "object");
    const useTopLevel = !fromTranslation && (!topLocale || topLocale === locale);

    const title = nonEmpty(fromTranslation ? block?.title : undefined, useTopLevel ? post.title : undefined);
    const excerpt = nonEmpty(
      fromTranslation ? block?.excerpt : undefined,
      useTopLevel ? post.excerpt : undefined
    );
    const contentMd = nonEmpty(
      fromTranslation ? block?.content_md : undefined,
      useTopLevel ? post.content_md : undefined
    );
    const seoTitle = nonEmpty(
      fromTranslation ? block?.seo_title : undefined,
      useTopLevel ? post.seo_title : undefined
    );
    const metaDescription = nonEmpty(
      fromTranslation ? block?.meta_description : undefined,
      useTopLevel ? post.meta_description : undefined
    );

    if (!title && !excerpt && !contentMd && !seoTitle && !metaDescription) {
      continue;
    }

    out[locale] = {
      locale,
      title: title || "Untitled",
      excerpt,
      contentMd,
      seoTitle,
      metaDescription,
      coverImageUrl,
      coverImageAlt,
    };
  }

  if (Object.keys(out).length === 0) {
    const locale = topLocale ?? "en";
    if (nonEmpty(post.title, post.excerpt, post.content_md, post.seo_title, post.meta_description)) {
      out[locale] = {
        locale,
        title: nonEmpty(post.title) || "Untitled",
        excerpt: nonEmpty(post.excerpt),
        contentMd: nonEmpty(post.content_md),
        seoTitle: nonEmpty(post.seo_title),
        metaDescription: nonEmpty(post.meta_description),
        coverImageUrl,
        coverImageAlt,
      };
    }
  }

  return out;
}

/**
 * Base locale content for the item `value` fields (DEFAULT_LOCALE preferred).
 */
export function resolveLocaleContent(
  post: WebhookPost,
  defaultLocale: CmsLocale
): ResolvedLocaleContent {
  const byLocale = collectLocaleContents(post);
  const content =
    byLocale[defaultLocale] ??
    (normalizeLocale(post.locale) ? byLocale[normalizeLocale(post.locale)!] : undefined) ??
    CMS_LOCALES.map((locale) => byLocale[locale]).find(Boolean);

  if (!content) {
    return {
      locale: defaultLocale,
      title: "Untitled",
      excerpt: "",
      contentMd: "",
      seoTitle: "",
      metaDescription: "",
      coverImageUrl: typeof post.cover_image_url === "string" ? post.cover_image_url : null,
      coverImageAlt: nonEmpty(post.cover_image_alt, "Cover image"),
    };
  }

  return content;
}

export function slugify(input: string): string {
  return (
    input
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || "post"
  );
}
