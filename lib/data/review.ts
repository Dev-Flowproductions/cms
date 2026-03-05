"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function getReviewQueuePosts() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, status, primary_locale, updated_at, profiles(display_name)")
    .eq("status", "review")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
