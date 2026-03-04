import { Link } from "@/lib/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { getTranslations } from "next-intl/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex gap-4">
            <Link href="/" className="font-medium">
              {t("home")}
            </Link>
            <Link href="/blog">{t("blog")}</Link>
          </div>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <Link href="/admin" className="text-sm text-gray-600 dark:text-gray-400">
              {t("admin")}
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-sm text-gray-500">
        AI-native CMS
      </footer>
    </div>
  );
}
