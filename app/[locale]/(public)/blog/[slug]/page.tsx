import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Link as IntlLink } from "@/lib/navigation";
import { getPublishedPostBySlug, getPublishedPostLocales } from "@/lib/data/post-detail";
import { markdownToHtml } from "@/lib/rendering/md";
import { buildArticleJsonLd } from "@/lib/rendering/jsonld";
import type { Locale } from "@/lib/types/db";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const data = await getPublishedPostBySlug(slug, locale);
  if (!data) return { title: "Not found" };

  const { post, localization } = data;
  const locales = await getPublishedPostLocales(slug);
  const title = localization.title || post.slug;
  const description = localization.excerpt || undefined;
  const imageUrl = post.cover_image_path && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${post.cover_image_path}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      locale,
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `${baseUrl}/${loc}/blog/${slug}`])
      ),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const data = await getPublishedPostBySlug(slug, locale);
  if (!data) notFound();

  const { post, localization } = data;
  const html = await markdownToHtml(localization.content_md ?? "");
  const authorName =
    post.profiles && !Array.isArray(post.profiles)
      ? (post.profiles as { display_name: string | null }).display_name
      : null;

  const imageUrl = post.cover_image_path && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${post.cover_image_path}`
    : undefined;
  const jsonLd = buildArticleJsonLd(post, localization, baseUrl, locale, imageUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{localization.title || post.slug}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {post.published_at && (
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString(locale)}
              </time>
            )}
            {authorName && <span>{authorName}</span>}
          </div>
          {localization.excerpt && (
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">{localization.excerpt}</p>
          )}
        </header>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <IntlLink href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
            ← Back to blog
          </IntlLink>
        </footer>
      </article>
    </>
  );
}
