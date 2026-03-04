"use server";

import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/types/db";

const PAGE_SIZE = 20;

export async function getPublishedPostsList(locale: Locale, page = 1) {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, slug, primary_locale, published_at, post_localizations(title, excerpt, locale)")
    .eq("status", "published")
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const locsArray = (p: { post_localizations: unknown }) =>
    Array.isArray(p.post_localizations) ? p.post_localizations : [];

  const items = (posts ?? []).map((p: { id: string; slug: string; primary_locale: string; published_at: string | null; post_localizations: { title: string; excerpt: string; locale: string }[] }) => {
    const locs = locsArray(p) as { title: string; excerpt: string; locale: string }[];
    const loc = locs.find((l) => l.locale === locale) ?? locs.find((l) => l.locale === p.primary_locale) ?? locs[0];
    return {
      id: p.id,
      slug: p.slug,
      published_at: p.published_at,
      title: loc?.title ?? "",
      excerpt: loc?.excerpt ?? "",
    };
  });

  return { items, hasMore: (posts?.length ?? 0) === PAGE_SIZE };
}
