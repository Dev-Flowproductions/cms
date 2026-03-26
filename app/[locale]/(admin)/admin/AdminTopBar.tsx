"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

type ShellSection = "dashboard" | "posts" | "users" | "default";

const SHELL_SECTION_KEY: Record<
  ShellSection,
  "sectionDashboard" | "sectionPosts" | "sectionUsers" | "sectionDefault"
> = {
  dashboard: "sectionDashboard",
  posts: "sectionPosts",
  users: "sectionUsers",
  default: "sectionDefault",
};

function shellSection(pathname: string): ShellSection {
  if (pathname === "/admin") return "dashboard";
  if (pathname.startsWith("/admin/posts")) return "posts";
  if (pathname.startsWith("/admin/users")) return "users";
  return "default";
}

export function AdminTopBar() {
  const pathname = usePathname();
  const t = useTranslations("admin.shell");
  const section = shellSection(pathname);
  const sectionLabel = t(SHELL_SECTION_KEY[section]);

  return (
    <header
      className="fixed top-0 right-0 z-40 flex h-14 lg:h-16 w-full lg:w-[calc(100%-16rem)] items-center justify-between border-b px-4 sm:px-8 backdrop-blur-xl lg:left-64"
      style={{
        background: "rgba(11, 19, 38, 0.82)",
        borderColor: "var(--adm-border-subtle)",
      }}
    >
      <div className="flex h-full min-w-0 flex-1 items-center gap-4 lg:gap-6">
        <span
          className="truncate border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
          style={{
            color: "var(--adm-primary)",
            borderColor: "var(--adm-primary-container)",
          }}
        >
          {sectionLabel}
        </span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled
          title={t("comingSoon")}
          className="hidden rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider opacity-50 md:inline-block"
          style={{
            background: "var(--adm-surface-high)",
            color: "var(--adm-on-surface)",
          }}
        >
          {t("export")}
        </button>
        <button
          type="button"
          disabled
          title={t("comingSoon")}
          className="hidden rounded-lg bg-gradient-to-r from-[#6839ea] to-[#ccbdff] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#350097] opacity-60 shadow-lg shadow-[#6839ea]/20 sm:inline-block"
        >
          {t("askAi")}
        </button>
        <div className="ml-1 flex items-center gap-1 sm:gap-2">
          <LocaleSwitcher variant="editorial" />
          <ThemeToggle
            className="!rounded-lg"
            style={{
              background: "var(--adm-surface-high)",
              border: "1px solid var(--adm-outline-variant)",
              color: "var(--adm-on-variant)",
            }}
          />
        </div>
      </div>
    </header>
  );
}
