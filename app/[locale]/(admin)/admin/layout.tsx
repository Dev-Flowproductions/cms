import { requireTeamMember } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { AdminNav } from "./AdminNav";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RunSchedulerButton } from "./RunSchedulerButton";
import { AdminSidebarShell } from "./AdminSidebarShell";
import { AppLogo } from "@/components/AppLogo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeamMember();
  const t = await getTranslations();
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Sidebar — desktop sticky / mobile drawer. Hamburger button rendered by shell. */}
      <AdminSidebarShell>
        {/* Sidebar header */}
        <div
          className="px-5 py-5 flex items-center gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <AppLogo className="h-8 w-auto flex-shrink-0 object-contain" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight" style={{ color: "var(--text)" }}>
              {t("common.appName")}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              {t("admin.sidebarSubLabel")}
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <AdminNav />
        </div>

        {/* Sidebar footer */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
          <RunSchedulerButton />
          <AdminLogoutButton />
        </div>
      </AdminSidebarShell>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 h-14 backdrop-blur-xl"
          style={{
            background: "color-mix(in srgb, var(--surface) 85%, transparent)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h1 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            {t("admin.title")}
          </h1>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
          </div>
        </div>

        <main className="flex-1 px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
