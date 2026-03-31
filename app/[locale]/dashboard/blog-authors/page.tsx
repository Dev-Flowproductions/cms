import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

/** Blog authors are managed under Settings; keep route for old bookmarks. */
export default async function BlogAuthorsRedirectPage() {
  const locale = await getLocale();
  redirect(`/${locale}/dashboard/settings`);
}
