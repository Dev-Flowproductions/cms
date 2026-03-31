"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "./UserMenu";
import { NextPostCountdown } from "@/components/NextPostCountdown";

type ShellSection = "overview" | "posts" | "settings" | "newPost" | "default";

const SECTION_KEY: Record<ShellSection, "sectionOverview" | "sectionPosts" | "sectionSettings" | "sectionNewPost" | "sectionDefault"> =
  {
    overview: "sectionOverview",
    posts: "sectionPosts",
    settings: "sectionSettings",
    newPost: "sectionNewPost",
    default: "sectionDefault",
  };

function shellSection(pathname: string): ShellSection {
  if (pathname === "/dashboard") return "overview";
  if (pathname.startsWith("/dashboard/new")) return "newPost";
  if (pathname.startsWith("/dashboard/posts")) return "posts";
  if (pathname.startsWith("/dashboard/settings")) return "settings";
  return "default";
}

export function DashboardTopBar({
  userEmail,
  userInitial,
  nextPostSchedule,
}: {
  userEmail: string;
  userInitial: string;
  nextPostSchedule: { lastPostGeneratedAt: string | null; frequency: string } | null;
}) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.shell");
  const section = shellSection(pathname);
  const label = t(SECTION_KEY[section]);

  return (
    <header
      className="fixed right-0 top-0 z-40 flex h-14 w-full min-w-0 items-center justify-between overflow-x-hidden border-b px-4 backdrop-blur-xl sm:px-8 lg:left-64 lg:h-16 lg:w-[calc(100%-16rem)]"
      style={{
        background: "var(--adm-topbar-bg)",
        borderColor: "var(--adm-border-subtle)",
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <span
          className="truncate border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
          style={{
            color: "var(--adm-primary)",
            borderColor: "var(--adm-primary-container)",
          }}
        >
          {label}
        </span>
        {nextPostSchedule && (
          <NextPostCountdown
            lastPostGeneratedAt={nextPostSchedule.lastPostGeneratedAt}
            frequency={nextPostSchedule.frequency}
            variant="editorial"
          />
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
        <LocaleSwitcher variant="editorial" />
        <ThemeToggle
          className="!h-9 !w-9 !rounded-lg !shrink-0"
          style={{
            background: "var(--adm-surface-high)",
            border: "1px solid var(--adm-outline-variant)",
            color: "var(--adm-on-variant)",
          }}
        />
        <UserMenu email={userEmail} initial={userInitial} variant="editorial" />
      </div>
    </header>
  );
}
