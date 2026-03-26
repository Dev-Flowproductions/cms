"use client";

import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/navigation";
import type { ReactNode } from "react";

const ICON_BOX = "h-[22px] w-[22px] shrink-0";

function DashboardIcon({ isActive }: { isActive: boolean }) {
  const c = isActive ? "var(--adm-primary)" : "var(--adm-on-variant)";
  return (
    <svg className={ICON_BOX} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z"
        stroke={c}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ isActive }: { isActive: boolean }) {
  const c = isActive ? "var(--adm-primary)" : "var(--adm-on-variant)";
  return (
    <svg className={ICON_BOX} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3.5" stroke={c} strokeWidth="1.6" />
      <path
        d="M3 20v-1a5 5 0 015-5h2a5 5 0 015 5v1"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 11a3 3 0 100-6M21 20v-1a4 4 0 00-3-3.87"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PostsIcon({ isActive }: { isActive: boolean }) {
  const c = isActive ? "var(--adm-primary)" : "var(--adm-on-variant)";
  return (
    <svg className={ICON_BOX} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h11M4 18h8" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: {
  key: "dashboard" | "users" | "posts";
  href: string;
  Icon: (p: { isActive: boolean }) => ReactNode;
}[] = [
  { key: "dashboard", href: "/admin", Icon: DashboardIcon },
  { key: "users", href: "/admin/users", Icon: UsersIcon },
  { key: "posts", href: "/admin/posts", Icon: PostsIcon },
];

function navItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-1" aria-label={t("navigationLabel")}>
      {NAV_ITEMS.map((item) => {
        const isActive = navItemActive(pathname, item.href);
        const Icon = item.Icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={[
              "mx-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium tracking-wide transition-colors",
              isActive ? "shadow-sm" : "hover:bg-[var(--adm-surface-hover)]",
            ].join(" ")}
            style={{
              background: isActive ? "var(--adm-surface-high)" : "transparent",
              color: isActive ? "var(--adm-primary)" : "var(--adm-on-variant)",
            }}
          >
            <Icon isActive={isActive} />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
