"use server";

import { createClient } from "@/lib/supabase/server";

const LOCALES = ["en", "pt", "fr"];

export async function getSitemapUrls() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published")
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`);

  const slugs = (posts ?? []).map((p: { slug: string }) => p.slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

  const urls: { url: string; lastModified?: string }[] = [];

  for (const locale of LOCALES) {
    urls.push({ url: `${baseUrl}/${locale}` });
    urls.push({ url: `${baseUrl}/${locale}/blog` });
    for (const slug of slugs) {
      urls.push({ url: `${baseUrl}/${locale}/blog/${slug}` });
    }
  }

  return urls;
}
