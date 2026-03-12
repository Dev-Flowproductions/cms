"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, getUser } from "@/lib/auth";


export async function getReviewChecklist(postId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_checklists")
    .select("*")
    .eq("post_id", postId)
    .is("locale", null)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveReviewChecklist(
  postId: string,
  items: Array<{ key: string; label: string; passed: boolean; notes?: string }>,
  status: "pending" | "passed" | "failed"
) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  // Check if a row already exists for this post (locale IS NULL)
  const { data: existing } = await supabase
    .from("review_checklists")
    .select("id")
    .eq("post_id", postId)
    .is("locale", null)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("review_checklists")
      .update({ items, status, reviewer_id: user.id, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("review_checklists")
      .insert({ post_id: postId, reviewer_id: user.id, locale: null, items, status });
    if (error) throw error;
  }

  return { success: true };
}

export async function approvePost(postId: string) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  // Set status to published directly — approval IS publishing
  const { error } = await supabase
    .from("posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("status", "review");
  if (error) return { error: error.message };

  await supabase.from("audit_events").insert({
    post_id: postId,
    user_id: user.id,
    action: "approved",
    payload: {},
  });

  return { success: true };
}

export async function rejectPost(postId: string, reason?: string) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update({ status: "draft" })
    .eq("id", postId)
    .eq("status", "review");
  if (error) return { error: error.message };

  await supabase.from("audit_events").insert({
    post_id: postId,
    user_id: user.id,
    action: "rejected",
    payload: { reason: reason ?? "" },
  });

  return { success: true };
}

export async function publishPost(postId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("status")
    .eq("id", postId)
    .single();
  if (!post) return { error: "Post not found" };
  if (post.status !== "approved") {
    return { error: "Post must be approved before publishing." };
  }

  const { error } = await supabase
    .from("posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", postId);
  if (error) return { error: error.message };

  await supabase.from("audit_events").insert({
    post_id: postId,
    user_id: user.id,
    action: "published",
    payload: {},
  });

  return { success: true };
}
