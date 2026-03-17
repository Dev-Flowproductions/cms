import type {
  ApiPost,
  ApiPostListItem,
  ApiAuthor,
  ApiSitemapEntry,
} from "./types";

type AdminClient = ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>;

function getCoverUrl(admin: AdminClient, coverPath: string | null): string | null {
  if (!coverPath) return null;
  const { data } = admin.storage.from("covers").getPublicUrl(coverPath);
  return data?.publicUrl ?? null;
}

function mapAuthor(profile: { id: string; display_name: string | null } | null): ApiAuthor | null {
  if (!profile) return null;
  const name = profile.display_name ?? "Unknown";
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return {
    id: profile.id,
    name,
    slug: slug || "author",
    bio: null,
    avatarUrl: null,
  };
}

/**
 * List published posts for a site (client). Scoped by author_id = client's user_id.
 */
export async function getPublishedPosts(
  admin: AdminClient,
  userId: string,
  opts: { page?: number; limit?: number; sort?: string } = {}
): Promise<{ posts: ApiPostListItem[]; total: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
  const from = (page - 1) * limit;

  const { data: posts, error } = await admin
    .from("posts")
    .select(
      `
      id, slug, cover_image_path, published_at, updated_at,
      post_localizations ( locale, title, excerpt, seo_title ),
      profiles ( id, display_name )
    `
    )
    .eq("author_id", userId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw error;

  const { count } = await admin
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .eq("status", "published");

  const list: ApiPostListItem[] = (posts ?? []).map((p: any) => {
    const locs = p.post_localizations ?? [];
    const primary = locs.find((l: any) => l.locale === "pt") ?? locs.find((l: any) => l.locale === "en") ?? locs[0];
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
    return {
      id: p.id,
      title: primary?.title ?? "",
      slug: p.slug,
      excerpt: primary?.excerpt ?? "",
      coverImageUrl: getCoverUrl(admin, p.cover_image_path),
      coverImageAlt: "Cover image",
      publishedAt: p.published_at,
      updatedAt: p.updated_at,
      author: mapAuthor(profile),
      categories: [],
      seoTitle: primary?.seo_title ?? null,
    };
  });

  return { posts: list, total: count ?? 0 };
}

/**
 * Get a single published post by slug for a site.
 */
export async function getPublishedPostBySlug(
  admin: AdminClient,
  userId: string,
  slug: string
): Promise<ApiPost | null> {
  const { data: post, error } = await admin
    .from("posts")
    .select(
      `
      id, slug, cover_image_path, published_at, updated_at,
      post_localizations ( locale, title, excerpt, content_md, seo_title, seo_description, jsonld ),
      profiles ( id, display_name )
    `
    )
    .eq("author_id", userId)
    .eq("status", "published")
    .eq("slug", slug)
    .single();

  if (error || !post) return null;

  const locs = (post as any).post_localizations ?? [];
  const primary =
    locs.find((l: any) => l.locale === "pt") ??
    locs.find((l: any) => l.locale === "en") ??
    locs[0];
  const profile = Array.isArray((post as any).profiles) ? (post as any).profiles[0] : (post as any).profiles;
  const coverUrl = getCoverUrl(admin, (post as any).cover_image_path);

  const translations: ApiPost["translations"] = {};
  for (const l of locs) {
    translations[l.locale] = {
      title: l.title ?? "",
      excerpt: l.excerpt ?? "",
      content: l.content_md ?? "",
      seoTitle: l.seo_title ?? null,
      seoDescription: l.seo_description ?? null,
    };
  }

  return {
    id: (post as any).id,
    title: primary?.title ?? "",
    slug: (post as any).slug,
    excerpt: primary?.excerpt ?? "",
    coverImageUrl: coverUrl,
    coverImageAlt: "Cover image",
    publishedAt: (post as any).published_at,
    updatedAt: (post as any).updated_at,
    author: mapAuthor(profile),
    categories: [],
    seoTitle: primary?.seo_title ?? null,
    content: primary?.content_md ?? "",
    seoDescription: primary?.seo_description ?? null,
    canonicalUrl: null,
    ogImageUrl: coverUrl,
    structuredData: primary?.jsonld ?? null,
    locale: primary?.locale ?? "en",
    translations,
  };
}

/**
 * Get authors that have published posts for this site.
 */
export async function getAuthors(admin: AdminClient, userId: string): Promise<ApiAuthor[]> {
  const { data, error } = await admin
    .from("posts")
    .select("profiles ( id, display_name )")
    .eq("author_id", userId)
    .eq("status", "published");

  if (error) return [];

  const seen = new Set<string>();
  const authors: ApiAuthor[] = [];
  for (const row of data ?? []) {
    const p = (row as any).profiles;
    const profile = Array.isArray(p) ? p[0] : p;
    if (profile && !seen.has(profile.id)) {
      seen.add(profile.id);
      const a = mapAuthor(profile);
      if (a) authors.push(a);
    }
  }
  return authors;
}

/**
 * Get sitemap entries (slug + dates) for published posts.
 */
export async function getSitemapEntries(
  admin: AdminClient,
  userId: string
): Promise<ApiSitemapEntry[]> {
  const { data, error } = await admin
    .from("posts")
    .select("slug, updated_at, published_at")
    .eq("author_id", userId)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((r: any) => ({
    slug: r.slug,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
  }));
}
