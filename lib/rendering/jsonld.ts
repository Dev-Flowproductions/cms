import type { Locale } from "@/lib/types/db";

type PostForJsonLd = {
  slug: string;
  published_at: string | null;
  cover_image_path: string | null;
  profiles: unknown;
};

type LocalizationForJsonLd = {
  title: string;
  excerpt: string;
  locale: string;
};

export function buildArticleJsonLd(
  post: PostForJsonLd,
  localization: LocalizationForJsonLd,
  baseUrl: string,
  locale: Locale,
  imageUrl?: string | null,
  authorNameOverride?: string | null
) {
  const url = `${baseUrl}/${locale}/blog/${post.slug}`;
  const image = imageUrl ? [imageUrl] : undefined;
  const authorName = authorNameOverride ?? (() => {
    const p = post.profiles;
    if (Array.isArray(p) && p[0]) return (p[0] as { display_name: string | null }).display_name;
    if (p && typeof p === "object" && "display_name" in p) return (p as { display_name: string | null }).display_name;
    return "Unknown";
  })();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: localization.title || post.slug,
    description: localization.excerpt || undefined,
    image: image ? [image] : undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.published_at || undefined,
    author: {
      "@type": "Person",
      name: authorName,
    },
    url,
    inLanguage: locale,
  };
}
