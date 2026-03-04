"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/lib/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, "$1") || "/";

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <a
            key={loc}
            href={`/${loc}${pathnameWithoutLocale}`}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
            style={{
              background: isActive ? "var(--accent)" : "transparent",
              color: isActive ? "white" : "var(--text-muted)",
              boxShadow: isActive ? "0 0 10px rgba(124,92,252,0.3)" : "none",
            }}
          >
            {loc}
          </a>
        );
      })}
    </div>
  );
}
