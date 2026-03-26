"use client";

import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/navigation";

const ICON_BOX = "h-[22px] w-[22px] shrink-0";

function HomeIcon({ isActive }: { isActive: boolean }) {
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

function PostsIcon({ isActive }: { isActive: boolean }) {
  const c = isActive ? "var(--adm-primary)" : "var(--adm-on-variant)";
  return (
    <svg className={ICON_BOX} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h11M4 18h8" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ isActive }: { isActive: boolean }) {
  const c = isActive ? "var(--adm-primary)" : "var(--adm-on-variant)";
  return (
    <svg className={ICON_BOX} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={c}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ITEMS = [
  { key: "navHome" as const, href: "/dashboard", Icon: HomeIcon, match: (p: string) => p === "/dashboard" },
  {
    key: "navPosts" as const,
    href: "/dashboard/posts",
    Icon: PostsIcon,
    match: (p: string) => p.startsWith("/dashboard/posts") || p.startsWith("/dashboard/new"),
  },
  {
    key: "navSettings" as const,
    href: "/dashboard/settings",
    Icon: SettingsIcon,
    match: (p: string) => p.startsWith("/dashboard/settings"),
  },
] as const;

export function DashboardNav() {
  const t = useTranslations("dashboard");
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label={t("navLabel")}>
      <p
        className="pb-2 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "var(--adm-on-variant)" }}
      >
        {t("navLabel")}
      </p>
      {ITEMS.map((item) => {
        const isActive = item.match(pathname);
        const Icon = item.Icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium tracking-wide transition-colors"
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
