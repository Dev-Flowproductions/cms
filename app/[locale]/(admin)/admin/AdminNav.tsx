"use client";

import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/navigation";

const NAV_ITEMS = [
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
    key: "reviewQueue",
    href: "/admin/review-queue",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1.5a6 6 0 100 12 6 6 0 000-12zM7.5 4v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "sources",
    href: "/admin/sources",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 7.5a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0zM7.5 5v5M5 7.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "settings",
    href: "/admin/settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 9.5a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 7.5a4.5 4.5 0 01-.09.88l1.3 1.01-1 1.73-1.6-.65a4.5 4.5 0 01-1.53.88L8.85 13h-2l-.23-1.65a4.5 4.5 0 01-1.53-.88l-1.6.65-1-1.73 1.3-1.01A4.5 4.5 0 013.75 7.5c0-.3.03-.6.09-.88L2.54 5.61l1-1.73 1.6.65a4.5 4.5 0 011.53-.88L6.9 2h2l.23 1.65a4.5 4.5 0 011.53.88l1.6-.65 1 1.73-1.3 1.01c.06.28.09.58.09.88z" stroke="currentColor" strokeWidth="1.4" />
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
        Navigation
      </p>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.includes(item.href);
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
