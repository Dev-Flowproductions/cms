"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminForDataLoader } from "@/lib/auth";
import type { PostStatus } from "@/lib/types/db";

export type UserWithPostCount = {
  user_id: string;
  account_name: string;
  domain: string | null;
  post_count: number;
};

/** Users (clients) that have at least one post, with post count. For admin posts landing. */
export async function getUsersWithPostCount(): Promise<UserWithPostCount[]> {
  await requireAdminForDataLoader();
  const admin = createAdminClient();
  const { data: counts, error: countError } = await admin.rpc("admin_users_with_post_count");
  if (countError) throw countError;
  const rows = (counts ?? []) as { user_id: string; post_count: number }[];
  if (rows.length === 0) return [];
  const userIds = rows.map((r) => r.user_id);
  const byUser = Object.fromEntries(rows.map((r) => [r.user_id, Number(r.post_count) || 0]));
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

export async function getPostsForAdmin(filters?: {
  status?: PostStatus;
  userId?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdminForDataLoader();
  const admin = createAdminClient();
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters?.pageSize ?? 50));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = admin
    .from("posts")
    .select(
      `
      id, slug, status, primary_locale, author_id, updated_at,
      profiles(display_name),
      post_localizations(locale, seo_title, focus_keyword, seo_score)
    `,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.userId) {
    query = query.eq("author_id", filters.userId);
  }

  const { data: posts, error, count } = await query;
  if (error) throw error;
  if (!posts?.length) {
    return {
      posts: [],
      totalCount: count ?? 0,
      page,
      pageSize,
      clientByAuthor: {} as Record<string, { company_name: string | null; brand_name: string | null }>,
    };
  }

  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const { data: clients } = await admin
    .from("clients")
    .select("user_id, company_name, brand_name")
    .in("user_id", authorIds);
  const clientByAuthor: Record<string, { company_name: string | null; brand_name: string | null }> = {};
  for (const c of clients ?? []) {
    clientByAuthor[c.user_id] = { company_name: c.company_name ?? null, brand_name: c.brand_name ?? null };
  }
  return { posts: posts ?? [], totalCount: count ?? posts.length, page, pageSize, clientByAuthor };
}

/** Latest posts across all clients — for admin home (bounded query). */
export async function getRecentPostsForAdmin(limit: number) {
  await requireAdminForDataLoader();
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
