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
      className="mb-2 flex items-center gap-3 px-6 py-6"
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
}: {
  children: React.ReactNode;
  userEmail: string;
  userInitial: string;
}) {
  return (
    <div className="editorial-shell-root flex min-h-screen bg-[var(--adm-bg)] font-sans text-[var(--adm-on-surface)] antialiased">
      <DashboardSidebarShell>
        <SidebarHeader />
        <div className="flex flex-1 flex-col overflow-y-auto px-2 py-4">
          <DashboardNav />
        </div>
      </DashboardSidebarShell>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar userEmail={userEmail} userInitial={userInitial} />
        <main className="relative min-h-screen flex-1 overflow-y-auto pt-14 lg:pt-16">
          <div
            className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-1/2 w-1/2 rounded-full bg-[#6839ea]/[0.07] blur-[120px]"
            aria-hidden
          />
          <div className="relative z-[1] mx-auto max-w-6xl px-6 py-8 lg:px-12 lg:py-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
