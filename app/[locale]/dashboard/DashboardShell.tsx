"use client";

import { AppLogo } from "@/components/AppLogo";
import { DashboardSidebarShell } from "./DashboardSidebarShell";
import { DashboardNav } from "./DashboardNav";
import { DashboardTopBar } from "./DashboardTopBar";
import { useTranslations } from "next-intl";

function SidebarHeader() {
  const t = useTranslations();
  return (
    <div
      className="mb-2 flex shrink-0 items-center gap-3 px-6 py-6 lg:px-12"
      style={{ borderBottom: "1px solid var(--adm-border-subtle)" }}
    >
      <AppLogo className="h-8 w-auto flex-shrink-0 object-contain opacity-95" />
      <div className="min-w-0 flex-1">
        <div className="text-xl font-bold leading-tight tracking-tighter" style={{ color: "var(--adm-primary)" }}>
          {t("common.appName")}
        </div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
          {t("dashboard.workspaceSubLabel")}
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  userEmail,
  userInitial,
  nextPostSchedule,
}: {
  children: React.ReactNode;
  userEmail: string;
  userInitial: string;
  nextPostSchedule: { lastPostGeneratedAt: string | null; frequency: string } | null;
}) {
  return (
    <div className="editorial-shell-root flex h-screen min-h-0 min-w-0 overflow-hidden bg-[var(--adm-bg)] font-sans text-[var(--adm-on-surface)] antialiased">
      <DashboardSidebarShell>
        <SidebarHeader />
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-6 py-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:px-12 lg:py-12"
        >
          <DashboardNav />
        </div>
      </DashboardSidebarShell>

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <DashboardTopBar
          userEmail={userEmail}
          userInitial={userInitial}
          nextPostSchedule={nextPostSchedule}
        />
        <main className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-14 lg:pt-16 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-1/2 w-1/2 rounded-full bg-[#6839ea]/[0.07] blur-[120px]"
            aria-hidden
          />
          <div className="relative z-[1] mx-auto min-w-0 max-w-6xl px-6 py-8 lg:px-12 lg:py-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
