import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
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
  type ProfileShape = { display_name?: string | null; avatar_url?: string | null; bio?: string | null; job_title?: string | null };
  const rawProfiles = post.profiles;
  const author: ProfileShape | null = rawProfiles == null
    ? null
    : Array.isArray(rawProfiles) && rawProfiles[0]
      ? (rawProfiles[0] as ProfileShape)
      : typeof rawProfiles === "object"
        ? (rawProfiles as ProfileShape)
        : null;
  // Always show an author when the post has one; use profile data or fallback "Author"
  const authorName = author?.display_name?.trim() || (post.author_id ? "Author" : null);
  const authorAvatar = author?.avatar_url ?? null;
  const authorBio = author?.bio ?? null;
  const authorJobTitle = author?.job_title ?? null;
  const showAuthorBlock = !!post.author_id;

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
      <article className="max-w-3xl mx-auto px-6 py-12">
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
            <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {localization.excerpt}
            </p>
          )}
        </header>
        <div
          className="prose max-w-none"
          style={{ color: "var(--text)" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {showAuthorBlock && (
          <section className="mt-10" aria-labelledby="author-heading">
            <h2 id="author-heading" className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>
              {tBlog("aboutAuthor")}
            </h2>
            <div className="flex gap-4 items-start">
              {authorAvatar ? (
                <img src={authorAvatar} alt="" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-semibold" style={{ background: "var(--border)", color: "var(--text-muted)" }} aria-hidden>
                  {(authorName ?? "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                {authorName && <p className="font-semibold text-base" style={{ color: "var(--text)" }}>{authorName}</p>}
                {authorJobTitle && <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{authorJobTitle}</p>}
                {authorBio && <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>{authorBio}</p>}
              </div>
            </div>
          </section>
        )}
        <footer className="mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
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
