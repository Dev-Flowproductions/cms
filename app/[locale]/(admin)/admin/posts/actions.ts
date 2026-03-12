"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";
import { z } from "zod";
import type { Locale } from "@/lib/types/db";

const createPostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens only"),
  primary_locale: z.enum(["pt", "en", "fr"]),
  content_type: z.enum(["hero", "hub", "hygiene"]),
  status: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

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
      author_id: user.id,
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

export async function createManualPost(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title")?.toString().trim() ?? "";
  const content_md = formData.get("content_md")?.toString() ?? "";
  const seo_description = formData.get("seo_description")?.toString().trim() || null;
  const primary_locale = (formData.get("primary_locale")?.toString() ?? "pt") as Locale;

  if (!title) return { error: "Title is required" };

  const rawSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  const supabase = await createClient();

  // Ensure slug is unique by appending a short random suffix if needed
  let slug = rawSlug;
  const { data: existing } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
  if (existing) {
    slug = `${rawSlug}-${Math.random().toString(36).slice(2, 7)}`;
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      slug,
      primary_locale,
      content_type: "hero",
      status: "draft",
      author_id: user.id,
    })
    .select("id")
    .single();
  if (postError) return { error: postError.message };

  const { error: locError } = await supabase.from("post_localizations").insert({
    post_id: post.id,
    locale: primary_locale,
    title,
    excerpt: seo_description ?? "",
    content_md,
    seo_description: seo_description ?? null,
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
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
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
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  focus_keyword: z.string().optional(),
});

export async function upsertLocalization(postId: string, formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  const parsed = localizationSchema.safeParse({
    locale: formData.get("locale"),
    title: formData.get("title") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content_md: formData.get("content_md") ?? "",
    seo_title: formData.get("seo_title")?.toString() || undefined,
    seo_description: formData.get("seo_description")?.toString() || undefined,
    focus_keyword: formData.get("focus_keyword")?.toString() || undefined,
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
      ...(parsed.data.seo_title !== undefined && { seo_title: parsed.data.seo_title }),
      ...(parsed.data.seo_description !== undefined && { seo_description: parsed.data.seo_description }),
      ...(parsed.data.focus_keyword !== undefined && { focus_keyword: parsed.data.focus_keyword }),
    },
    { onConflict: "post_id,locale" }
  );
  if (error) return { error: error.message };
  return { success: true };
}

export async function uploadCoverImage(postId: string, formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
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

export async function deletePost(postId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  const admin = createAdminClient();

  // Verify ownership or admin role before deleting
  const { data: post } = await supabase
    .from("posts")
    .select("author_id, slug, status")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return { error: "Post not found" };

  const isOwner = post.author_id === user.id;
  if (!isOwner) {
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .eq("role_id", "admin")
      .maybeSingle();
    if (!roleRow) return { error: "Forbidden" };
  }

  // If the post was published, notify the client webhook to delete it from their site
  if (post.status === "published") {
    try {
      const { data: client } = await admin
        .from("clients")
        .select("webhook_url, webhook_secret")
        .eq("user_id", post.author_id)
        .maybeSingle();

      if (client?.webhook_url) {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (client.webhook_secret) headers["x-webhook-secret"] = client.webhook_secret;
        await fetch(client.webhook_url, {
          method: "POST",
          headers,
          body: JSON.stringify({ action: "delete", slug: post.slug }),
        });
      }
    } catch {
      // Non-fatal — still delete from CMS
    }
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return { error: error.message };
  return { success: true };
}
