"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import type { Locale } from "@/lib/types/db";

const createPostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens only"),
  primary_locale: z.enum(["pt", "en", "fr"]),
  content_type: z.enum(["hero", "hub", "hygiene"]),
  status: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const session = await getSession();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = createPostSchema.safeParse({
    slug: formData.get("slug")?.toString().toLowerCase().trim(),
    primary_locale: formData.get("primary_locale") ?? "en",
    content_type: formData.get("content_type") ?? "hero",
    status: formData.get("status") ?? "idea",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors?.slug?.[0] ?? "Invalid input" };
  }

  const { slug, primary_locale, content_type, status } = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
  if (existing) return { error: "Slug already in use" };

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      slug,
      primary_locale,
      content_type,
      status,
      author_id: session.user.id,
    })
    .select("id")
    .single();
  if (postError) return { error: postError.message };

  const { error: locError } = await supabase.from("post_localizations").insert({
    post_id: post.id,
    locale: primary_locale as Locale,
    title: "",
    excerpt: "",
    content_md: "",
  });
  if (locError) {
    await supabase.from("posts").delete().eq("id", post.id);
    return { error: locError.message };
  }

  return { success: true, postId: post.id };
}

const updatePostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  status: z.string().optional(),
  content_type: z.enum(["hero", "hub", "hygiene"]).optional(),
  primary_locale: z.enum(["pt", "en", "fr"]).optional(),
  cover_image_path: z.string().nullable().optional(),
  published_at: z.string().nullable().optional(),
  scheduled_for: z.string().nullable().optional(),
});

export async function updatePost(postId: string, formData: FormData) {
  await getSession();
  const supabase = await createClient();

  const slug = formData.get("slug")?.toString().toLowerCase().trim();
  if (slug) {
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .neq("id", postId)
      .maybeSingle();
    if (existing) return { error: "Slug already in use" };
  }

  const updates: Record<string, unknown> = {};
  const optional = ["status", "content_type", "primary_locale", "cover_image_path", "published_at", "scheduled_for"];
  for (const key of optional) {
    const v = formData.get(key);
    if (v !== undefined && v !== null) {
      if (v === "" && (key === "published_at" || key === "scheduled_for")) updates[key] = null;
      else updates[key] = v;
    }
  }
  if (slug !== undefined) updates.slug = slug;

  const { error } = await supabase.from("posts").update(updates).eq("id", postId);
  if (error) return { error: error.message };
  return { success: true };
}

const localizationSchema = z.object({
  locale: z.enum(["pt", "en", "fr"]),
  title: z.string(),
  excerpt: z.string(),
  content_md: z.string(),
});

export async function upsertLocalization(postId: string, formData: FormData) {
  await getSession();
  const parsed = localizationSchema.safeParse({
    locale: formData.get("locale"),
    title: formData.get("title") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content_md: formData.get("content_md") ?? "",
  });
  if (!parsed.success) return { error: "Invalid localization data" };

  const supabase = await createClient();
  const { error } = await supabase.from("post_localizations").upsert(
    {
      post_id: postId,
      locale: parsed.data.locale,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content_md: parsed.data.content_md,
    },
    { onConflict: "post_id,locale" }
  );
  if (error) return { error: error.message };
  return { success: true };
}

export async function uploadCoverImage(postId: string, formData: FormData) {
  await getSession();
  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No file provided" };

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${postId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("covers").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;
  const { error: updateError } = await supabase
    .from("posts")
    .update({ cover_image_path: path })
    .eq("id", postId);
  if (updateError) return { error: updateError.message };

  return { success: true, path, publicUrl };
}
