import { getPublicAppBaseUrlOrLocalhost } from "@/lib/public-app-url";
import type { Locale } from "@/lib/types/db";

export function buildDgArticleAdminUrl(postId: string, locale: string): string {
  const base = getPublicAppBaseUrlOrLocalhost().replace(/\/+$/, "");
  return `${base}/${locale}/admin/posts/${postId}`;
}

/**
 * Public URL on the client's website (not the CMS app). Mirrors /{locale}/blog/{slug} with client.blog_base_path.
 */
export function buildDgPublishedPostUrl(opts: {
  domain: string;
  blog_base_path: string;
  locale: Locale | string;
  slug: string;
}): string {
  const host = opts.domain.replace(/^https?:\/\//i, "").split("/")[0]?.trim() ?? "";
  const origin =
    /^localhost\b/i.test(host) || /^127\.\d+\.\d+\.\d+/.test(host)
      ? `http://${host}`
      : `https://${host}`;
  const bp = opts.blog_base_path.startsWith("/") ? opts.blog_base_path : `/${opts.blog_base_path}`;
  const trimmed = bp.replace(/\/$/, "");
  const path = `/${opts.locale}${trimmed}/${opts.slug}`;
  return `${origin}${path}`;
}
