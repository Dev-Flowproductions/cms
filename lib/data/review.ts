"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function getReviewQueuePosts() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, slug, status, primary_locale, updated_at,
      profiles(display_name),
      post_localizations(locale, title, seo_score)
    `)
    .eq("status", "review")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getWebhookConfigForPost(postId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: post } = await admin
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();
  if (!post) return null;
  const { data: client } = await admin
    .from("clients")
    .select("webhook_url, auto_publish")
    .eq("user_id", post.author_id)
    .maybeSingle();
  return client ?? null;
}
