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
  const { error } = await supabase.from("review_checklists").upsert(
    {
      post_id: postId,
      reviewer_id: user.id,
      locale: null,
      items,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "post_id,locale" }
  );
  if (error) throw error;
  return { success: true };
}

export async function approvePost(postId: string) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const { data: checklist } = await supabase
    .from("review_checklists")
    .select("status")
    .eq("post_id", postId)
    .is("locale", null)
    .maybeSingle();

  if (!checklist || checklist.status !== "passed") {
    return { error: "Review checklist must be completed and passed before approving." };
  }

  const { error } = await supabase
    .from("posts")
    .update({ status: "approved" })
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
