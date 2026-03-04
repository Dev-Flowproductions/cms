import { requireTeamMember } from "@/lib/auth";
import { Link } from "@/lib/navigation";
import { getTranslations } from "next-intl/server";
import { AdminNav } from "./AdminNav";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { AdminLogoutButton } from "./AdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeamMember();
  const t = await getTranslations();
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col sticky top-0 h-screen"
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Sidebar header */}
        <div
          className="px-5 py-5 flex items-center gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 4h11M2.5 8h7M2.5 12h4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm leading-tight" style={{ color: "var(--text)" }}>
              {t("common.appName")}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              {t("sidebarSubLabel")}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <AdminNav />
        </div>

        {/* Sidebar footer */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all w-full"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M6 2L2 6l4 4M2 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("admin.backToDashboard")}
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-8 h-14 backdrop-blur-xl"
          style={{
            background: "rgba(17,17,24,0.85)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h1 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            {t("admin.title")}
          </h1>
          <LocaleSwitcher />
        </div>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
