import type { AuthorForBlock } from "@/lib/agent/internal-link";

export type BlogAuthorRow = {
  id: string;
  user_id: string;
  display_name: string;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  sort_order: number;
  created_at: string;
};

type AdminClient = ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>;

export function blogAuthorRowToForBlock(row: BlogAuthorRow): AuthorForBlock {
  return {
    displayName: row.display_name?.trim() || null,
    jobTitle: row.job_title?.trim() ?? null,
    bio: row.bio?.trim() ?? null,
    avatarUrl: row.avatar_url?.trim() ?? null,
  };
}

/**
 * Byline for markdown + webhooks: blog author row if post.byline_author_id matches owner, else profile.
 */
export async function resolveAuthorForByline(
  admin: AdminClient,
  postAuthorId: string,
  bylineAuthorId: string | null | undefined
): Promise<AuthorForBlock | null> {
  if (bylineAuthorId) {
    const { data: row } = await admin
      .from("blog_authors")
      .select("id, user_id, display_name, job_title, bio, avatar_url, sort_order, created_at")
      .eq("id", bylineAuthorId)
      .maybeSingle();
    const ba = row as BlogAuthorRow | null;
    if (ba && ba.user_id === postAuthorId && ba.display_name?.trim()) {
      return blogAuthorRowToForBlock(ba);
    }
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, job_title, bio, avatar_url")
    .eq("id", postAuthorId)
    .maybeSingle();
  if (!profile?.display_name?.trim()) return null;
  return {
    displayName: profile.display_name.trim(),
    jobTitle: profile.job_title?.trim() ?? null,
    bio: profile.bio?.trim() ?? null,
    avatarUrl: profile.avatar_url?.trim() ?? null,
  };
}

export async function pickRandomBylineAuthorId(admin: AdminClient, userId: string): Promise<string | null> {
  const { data: rows, error } = await admin
    .from("blog_authors")
    .select("id")
    .eq("user_id", userId);
  if (error || !rows?.length) return null;
  const i = Math.floor(Math.random() * rows.length);
  return (rows[i] as { id: string }).id;
}
