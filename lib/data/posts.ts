"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PostStatus } from "@/lib/types/db";

export type UserWithPostCount = {
  user_id: string;
  account_name: string;
  domain: string | null;
  post_count: number;
};

/** Users (clients) that have at least one post, with post count. For admin posts landing. */
export async function getUsersWithPostCount(): Promise<UserWithPostCount[]> {
  const admin = createAdminClient();
  const { data: rawCounts } = await admin.from("posts").select("author_id");
  const counts = rawCounts ?? [];
  const byUser = counts.reduce(
    (acc, p) => {
      acc[p.author_id] = (acc[p.author_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const userIds = Object.keys(byUser);
  if (userIds.length === 0) return [];
  const { data: clients } = await admin
    .from("clients")
    .select("user_id, company_name, brand_name, domain")
    .in("user_id", userIds);
  return (clients ?? []).map((c) => ({
    user_id: c.user_id,
    account_name: (c.company_name ?? c.brand_name ?? "")?.trim() || "—",
    domain: c.domain ?? null,
    post_count: byUser[c.user_id] ?? 0,
  }));
}

export async function getPostsForAdmin(filters?: { status?: PostStatus; userId?: string }) {
  const admin = createAdminClient();
  let query = admin
    .from("posts")
    .select(`
      id, slug, status, primary_locale, author_id, updated_at,
      profiles(display_name),
      post_localizations(locale, seo_title, focus_keyword, faq_blocks,
        jsonld, seo_score)
    `)
    .order("updated_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.userId) {
    query = query.eq("author_id", filters.userId);
  }

  const { data: posts, error } = await query;
  if (error) throw error;
  if (!posts?.length) return { posts: [], clientByAuthor: {} as Record<string, { company_name: string | null; brand_name: string | null }> };

  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const { data: clients } = await admin
    .from("clients")
    .select("user_id, company_name, brand_name")
    .in("user_id", authorIds);
  const clientByAuthor: Record<string, { company_name: string | null; brand_name: string | null }> = {};
  for (const c of clients ?? []) {
    clientByAuthor[c.user_id] = { company_name: c.company_name ?? null, brand_name: c.brand_name ?? null };
  }
  return { posts: posts ?? [], clientByAuthor };
}

/** Latest posts across all clients — for admin home (bounded query). */
export async function getRecentPostsForAdmin(limit: number) {
  const admin = createAdminClient();
  const { data: posts, error } = await admin
    .from("posts")
    .select("id, slug, status, primary_locale, author_id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  if (!posts?.length) return [];

  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const { data: clients } = await admin
    .from("clients")
    .select("user_id, company_name, brand_name")
    .in("user_id", authorIds);
  const accountByAuthor: Record<string, string> = {};
  for (const c of clients ?? []) {
    accountByAuthor[c.user_id] = (c.company_name ?? c.brand_name ?? "").trim() || "—";
  }

  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    status: p.status,
    primary_locale: p.primary_locale,
    author_id: p.author_id,
    updated_at: p.updated_at,
    accountName: accountByAuthor[p.author_id] ?? "—",
  }));
}

export async function getPostsForDashboard(userId: string, isAdmin: boolean) {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id, slug, status, primary_locale, author_id, updated_at, webhook_status, profiles(display_name), post_localizations(locale, seo_score)")
    .order("updated_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("author_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
