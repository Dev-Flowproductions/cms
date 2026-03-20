import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/**
 * Review queue has been removed: all posts are published directly.
 * Redirect old links to posts list.
 */
export default async function ReviewQueuePage() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/posts`);
}
