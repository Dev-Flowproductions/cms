import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getLocale } from "next-intl/server";

// The public home page is never a landing page — always redirect:
// - Authenticated users → their dashboard
// - Unauthenticated users → login
export default async function HomePage() {
  const locale = await getLocale();
  const user = await getUser();
  if (user) {
    redirect(`/${locale}/dashboard`);
  } else {
    redirect(`/${locale}/login`);
  }
}
