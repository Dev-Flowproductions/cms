"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

export function LocaleSwitcher({ variant = "default" }: { variant?: "default" | "editorial" }) {
  const locale = useLocale();
  const pathname = usePathname(); // locale-stripped path from next-intl
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(loc: string) {
    startTransition(() => {
      router.replace(pathname, { locale: loc });
    });
  }

  const isEditorial = variant === "editorial";

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg p-0.5 sm:gap-1 sm:rounded-xl sm:p-1"
      style={{
        background: isEditorial ? "var(--adm-surface-high)" : "var(--surface)",
        border: isEditorial ? "1px solid var(--adm-outline-variant)" : "1px solid var(--border)",
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
            className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all sm:px-2.5 sm:py-1 sm:text-xs sm:font-semibold sm:rounded-lg"
            style={{
              background: isActive
                ? isEditorial
                  ? "var(--adm-primary-container)"
                  : "var(--accent)"
                : "transparent",
              color: isActive
                ? isEditorial
                  ? "#fff"
                  : "white"
                : isEditorial
                  ? "var(--adm-on-variant)"
                  : "var(--text-muted)",
              boxShadow: isActive && isEditorial ? "var(--adm-locale-glow)" : isActive ? "0 0 10px rgba(124,92,252,0.3)" : "none",
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
