"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const authorFields = z.object({
  display_name: z.string().min(1, "Name is required").max(200),
  job_title: z.string().max(200).optional().nullable(),
  bio: z.string().max(4000).optional().nullable(),
});

function normalizeAvatarUrl(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  try {
    new URL(t);
    return t;
  } catch {
    return null;
  }
}

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

/** Profile fields used as the first byline row (same UI as `blog_authors` in the client list). */
export type ProfileByline = {
  display_name: string | null;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export async function getMyProfileByline(): Promise<{ profile: ProfileByline | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, job_title, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { profile: null, error: error.message };
  return { profile: (data as ProfileByline) ?? null };
}

export async function listMyBlogAuthors(): Promise<{ authors: BlogAuthorRow[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authors: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("blog_authors")
    .select("id, user_id, display_name, job_title, bio, avatar_url, sort_order, created_at")
    .eq("user_id", user.id)
    .order("display_name", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return { authors: [], error: error.message };
  return { authors: (data as BlogAuthorRow[]) ?? [] };
}

export async function createBlogAuthor(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = authorFields.safeParse({
    display_name: formData.get("display_name")?.toString().trim(),
    job_title: formData.get("job_title")?.toString().trim() || null,
    bio: formData.get("bio")?.toString().trim() || null,
    avatar_url: formData.get("avatar_url")?.toString().trim() || null,
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Invalid input" };
  }

  const { display_name, job_title, bio } = parsed.data;
  const avatar_url = normalizeAvatarUrl(formData.get("avatar_url")?.toString());
  const { error } = await supabase.from("blog_authors").insert({
    user_id: user.id,
    display_name,
    job_title: job_title || null,
    bio: bio || null,
    avatar_url,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}

export async function updateBlogAuthor(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = authorFields.safeParse({
    display_name: formData.get("display_name")?.toString().trim(),
    job_title: formData.get("job_title")?.toString().trim() || null,
    bio: formData.get("bio")?.toString().trim() || null,
    avatar_url: formData.get("avatar_url")?.toString().trim() || null,
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Invalid input" };
  }

  const { display_name, job_title, bio } = parsed.data;
  const avatar_url = normalizeAvatarUrl(formData.get("avatar_url")?.toString());
  const { data: updated, error } = await supabase
    .from("blog_authors")
    .update({
      display_name,
      job_title: job_title || null,
      bio: bio || null,
      avatar_url,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) return { error: error.message };
  if (!updated?.length) return { error: "Not found" };
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}

export async function deleteBlogAuthor(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("blog_authors").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}
