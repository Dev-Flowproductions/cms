"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function getUserReviewPosts() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, slug, status, primary_locale, updated_at,
      post_localizations(locale, title, excerpt, seo_score)
    `)
    .eq("author_id", user.id)
    .eq("status", "review")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function userApprovePost(postId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();

  // Verify ownership
  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .eq("status", "review")
    .single();

  if (!post) return { error: "Post not found" };
  if (post.author_id !== user.id) return { error: "Forbidden" };

  const { error } = await supabase
    .from("posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) return { error: error.message };

  // Fire webhook
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await fetch(`${appUrl}/api/publish/${postId}`, {
      method: "POST",
      headers: { "x-scheduler-internal": "1" },
    });
  } catch { /* non-fatal */ }

  return { success: true };
}

export async function userRejectPost(postId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();

  // Verify ownership
  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .eq("status", "review")
    .single();

  if (!post) return { error: "Post not found" };
  if (post.author_id !== user.id) return { error: "Forbidden" };

  // Send back to draft so they can edit
  const { error } = await supabase
    .from("posts")
    .update({ status: "draft" })
    .eq("id", postId);

  if (error) return { error: error.message };
  return { success: true };
}
