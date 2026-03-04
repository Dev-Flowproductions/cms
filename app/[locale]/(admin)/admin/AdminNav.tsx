"use client";

import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";

export function AdminNav() {
  const t = useTranslations("admin");
  return (
    <nav className="mt-4 space-y-1">
      <Link
        href="/admin/posts"
        className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
      >
        {t("posts")}
      </Link>
      <Link
        href="/admin/review-queue"
        className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
      >
        {t("reviewQueue")}
      </Link>
      <Link
        href="/admin/sources"
        className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
      >
        {t("sources")}
      </Link>
      <Link
        href="/admin/settings"
        className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
      >
        {t("settings")}
      </Link>
    </nav>
  );
}
