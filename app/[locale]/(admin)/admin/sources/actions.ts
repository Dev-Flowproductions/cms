"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function getSourcesList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sources")
    .select("id, url, title, publisher, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createSource(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const url = formData.get("url")?.toString()?.trim();
  if (!url) return { error: "URL is required" };

  const supabase = await createClient();
  const { error } = await supabase.from("sources").insert({
    url,
    title: formData.get("title")?.toString()?.trim() || null,
    publisher: formData.get("publisher")?.toString()?.trim() || null,
    notes: formData.get("notes")?.toString()?.trim() || null,
    created_by: user.id,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function getCitationsForPost(postId: string, locale?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("citations")
    .select("id, source_id, locale, quote, claim, section_anchor, sources(url, title, publisher)")
    .eq("post_id", postId);
  if (locale) query = query.eq("locale", locale);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCitation(postId: string, formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  const sourceId = formData.get("source_id")?.toString();
  const locale = formData.get("locale")?.toString();
  if (!sourceId || !locale) return { error: "Source and locale required" };

  const supabase = await createClient();
  const { error } = await supabase.from("citations").insert({
    post_id: postId,
    source_id: sourceId,
    locale,
    quote: formData.get("quote")?.toString()?.trim() || null,
    claim: formData.get("claim")?.toString()?.trim() || null,
    section_anchor: formData.get("section_anchor")?.toString()?.trim() || null,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function removeCitation(citationId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  const supabase = await createClient();
  const { error } = await supabase.from("citations").delete().eq("id", citationId);
  if (error) return { error: error.message };
  return { success: true };
}
