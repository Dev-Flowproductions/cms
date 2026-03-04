import { requireTeamMember } from "@/lib/auth";
import { Link } from "@/lib/navigation";
import { getTranslations } from "next-intl/server";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeamMember();
  const t = await getTranslations("admin");
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-gray-200 dark:border-gray-800 p-4">
        <Link href="/admin" className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {t("title")}
        </Link>
        <AdminNav />
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
