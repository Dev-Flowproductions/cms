"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/lib/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, "$1") || "/";

  return (
    <div className="flex gap-2">
      {routing.locales.map((loc) => (
        <a
          key={loc}
          href={`/${loc}${pathnameWithoutLocale}`}
          className={`px-2 py-1 text-sm rounded ${
            loc === locale
              ? "bg-gray-200 dark:bg-gray-700 font-medium"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          {loc.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
