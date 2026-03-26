"use client";

import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/navigation";

const NAV_ITEMS = [
  {
    key: "dashboard",
    href: "/admin",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1.5 3h4v4h-4V3zM9.5 3h4v4h-4V3zM1.5 8h4v4h-4V8zM9.5 8h4v4h-4V8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "posts",
    href: "/admin/posts",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 3h11M2 7.5h7M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "users",
    href: "/admin/users",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 13c0-3.314 2.462-6 5.5-6s5.5 2.686 5.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      <p
        className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-faint)" }}
      >
        {t("navigationLabel")}
      </p>
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: isActive ? "rgba(124,92,252,0.12)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              border: isActive ? "1px solid rgba(124,92,252,0.2)" : "1px solid transparent",
            }}
          >
            <span
              style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
            >
              {item.icon}
            </span>
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
