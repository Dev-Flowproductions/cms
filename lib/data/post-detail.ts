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
    .select("id, slug, primary_locale, author_id, cover_image_path, published_at, profiles(display_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .single();
  if (postError || !post) return null;

  const supabase2 = await createClient();
  let localization = await getLocalizationByPostAndLocale(post.id, locale);
  if (!localization && post.primary_locale !== locale) {
    localization = await getLocalizationByPostAndLocale(post.id, post.primary_locale);
  }
  if (!localization) return null;

  return { post, localization };
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
