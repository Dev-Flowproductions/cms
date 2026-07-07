export const BLOG_POSTS_TAG = "blog-posts";

export function cmsApiSiteTag(userId: string): string {
  return `cms-api-site-${userId}`;
}
