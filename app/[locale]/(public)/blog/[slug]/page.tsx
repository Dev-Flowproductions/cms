import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link as IntlLink } from "@/lib/navigation";
import { getPublishedPostBySlug, getPublishedPostLocales } from "@/lib/data/post-detail";
import { markdownToHtml } from "@/lib/rendering/md";
import { stripAuthorBlocksFromContentMd } from "@/lib/agent/internal-link";
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
  const html = await markdownToHtml(stripAuthorBlocksFromContentMd(localization.content_md ?? ""));
  type ProfileShape = { display_name?: string | null; avatar_url?: string | null; bio?: string | null; job_title?: string | null };
  const rawProfiles = post.profiles;
  const author: ProfileShape | null = rawProfiles == null
    ? null
    : Array.isArray(rawProfiles) && rawProfiles[0]
      ? (rawProfiles[0] as ProfileShape)
      : typeof rawProfiles === "object"
        ? (rawProfiles as ProfileShape)
        : null;
  const authorName = author?.display_name?.trim() || (post.author_id ? "Author" : null);
  const authorJobTitle = author?.job_title?.trim() ?? null;
  const authorBio = author?.bio?.trim() || null;
  const authorAvatarUrl = author?.avatar_url?.trim() || null;
  const authorInitial = authorName ? authorName.charAt(0).toUpperCase() : null;

  const imageUrl = post.cover_image_path && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${post.cover_image_path}`
    : undefined;
  const jsonLd = buildArticleJsonLd(post, localization, baseUrl, locale, imageUrl, authorName);
  const tBlog = await getTranslations("blog");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-6 pt-20 pb-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
            {localization.title || post.slug}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-faint)" }}>
            {post.published_at && (
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString(locale)}
              </time>
            )}
            {authorName && <span>· {authorName}</span>}
            {authorJobTitle && <span>· {authorJobTitle}</span>}
          </div>
          {localization.excerpt && (
            <p className="mt-3 text-base leading-relaxed max-w-xl" style={{ color: "var(--text-muted)" }}>
              {localization.excerpt}
            </p>
          )}
        </header>
        <div
          className="prose max-w-none"
          style={{ color: "var(--text)" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <footer className="mt-10 pt-6 space-y-6" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Author card — only when name is available */}
          {authorName && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-base font-bold"
                  style={{ background: "var(--accent-soft, var(--border))", color: "var(--accent)" }}
                >
                  {authorAvatarUrl ? (
                    <img src={authorAvatarUrl} alt={authorName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{authorInitial}</span>
                  )}
                </div>
                {/* Name + title */}
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{authorName}</p>
                  {authorJobTitle && (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{authorJobTitle}</p>
                  )}
                </div>
              </div>
              {/* Bio — only when available */}
              {authorBio && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {authorBio}
                </p>
              )}
            </div>
          )}

          <IntlLink
            href="/blog"
            className="text-xs font-semibold hover:underline"
            style={{ color: "var(--accent)" }}
          >
            {tBlog("backToBlog")}
          </IntlLink>
        </footer>
      </article>
    </>
  );
}
