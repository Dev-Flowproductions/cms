"use server";

import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/types/db";

export async function getPostById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(display_name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPostWithLocalizations(id: string) {
  const supabase = await createClient();
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*, profiles(display_name)")
    .eq("id", id)
    .single();
  if (postError) throw postError;
  if (!post) return null;

  const { data: locs, error: locError } = await supabase
    .from("post_localizations")
    .select("*")
    .eq("post_id", id)
    .order("locale");
  if (locError) throw locError;

  return { ...post, post_localizations: locs ?? [] };
}

export async function getPublishedPostBySlug(slug: string, locale: Locale) {
  const supabase = await createClient();
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, slug, primary_locale, author_id, byline_author_id, cover_image_path, published_at, profiles(display_name, avatar_url, bio, job_title)")
    .eq("slug", slug)
    .eq("status", "published")
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .single();
  if (postError || !post) return null;

  // If embed didn't return profile (e.g. RLS or relation name), fetch profile by author_id so author block always has data
  type ProfileRow = { display_name: string | null; avatar_url: string | null; bio: string | null; job_title: string | null };
  type PostWithProfile = typeof post & { profiles?: ProfileRow | ProfileRow[] | null; byline_author_id?: string | null };
  let postWithProfile: PostWithProfile = post;
  const bylineId = postWithProfile.byline_author_id ?? null;
  if (bylineId) {
    const { data: ba } = await supabase
      .from("blog_authors")
      .select("display_name, avatar_url, bio, job_title")
      .eq("id", bylineId)
      .maybeSingle();
    if (ba?.display_name?.trim()) {
      const bylineProfile: ProfileRow = {
        display_name: ba.display_name,
        avatar_url: ba.avatar_url,
        bio: ba.bio,
        job_title: ba.job_title,
      };
      postWithProfile = {
        ...postWithProfile,
        profiles: bylineProfile,
      } as PostWithProfile;
    }
  }
  if (post.author_id) {
    const hasProfile = postWithProfile.profiles != null && typeof postWithProfile.profiles === "object" && !Array.isArray(postWithProfile.profiles);
    const hasProfileArray = Array.isArray(postWithProfile.profiles) && postWithProfile.profiles.length > 0;
    if (!hasProfile && !hasProfileArray) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, bio, job_title")
        .eq("id", post.author_id)
        .maybeSingle();
      if (profile) {
        postWithProfile = { ...postWithProfile, profiles: profile } as PostWithProfile;
      }
    }
  }

  let localization = await getLocalizationByPostAndLocale(post.id, locale);
  if (!localization && post.primary_locale !== locale) {
    localization = await getLocalizationByPostAndLocale(post.id, post.primary_locale);
  }
  if (!localization) return null;

  return { post: postWithProfile, localization };
}

export async function getPublishedPostLocales(slug: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (!post) return [];
  const { data: locs } = await supabase
    .from("post_localizations")
    .select("locale")
    .eq("post_id", post.id);
  return (locs ?? []).map((l: { locale: string }) => l.locale);
}

async function getLocalizationByPostAndLocale(postId: string, locale: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("post_localizations")
    .select("*")
    .eq("post_id", postId)
    .eq("locale", locale)
    .single();
  return data;
}
