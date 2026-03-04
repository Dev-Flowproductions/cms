"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname(); // locale-stripped path from next-intl
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(loc: string) {
    startTransition(() => {
      router.replace(pathname, { locale: loc });
    });
  }

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            disabled={isActive || isPending}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
            style={{
              background: isActive ? "var(--accent)" : "transparent",
              color: isActive ? "white" : "var(--text-muted)",
              boxShadow: isActive ? "0 0 10px rgba(124,92,252,0.3)" : "none",
              cursor: isActive ? "default" : "pointer",
            }}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}
