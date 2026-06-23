import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/** Legacy path — token usage moved to /admin/token-usage. */
export default async function LegacyPostsTokenUsageRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/token-usage`);
}
