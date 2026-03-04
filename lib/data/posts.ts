"use server";

import { createClient } from "@/lib/supabase/server";
import type { PostStatus } from "@/lib/types/db";

export async function getPostsForAdmin(filters?: { status?: PostStatus }) {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id, slug, status, primary_locale, author_id, updated_at, profiles(display_name)")
    .order("updated_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
