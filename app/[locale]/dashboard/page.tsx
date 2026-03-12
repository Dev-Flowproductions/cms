import { getAuthUserWithRoles, hasAdminRole } from "@/lib/auth";
import { getPostsForDashboard } from "@/lib/data/posts";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { DashboardPostsTable } from "./DashboardPostsTable";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { UserMenu } from "./UserMenu";
import { AccountSettingsCard } from "./AccountSettingsCard";
import { getClientSettings } from "@/app/[locale]/(admin)/admin/users/actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUserReviewPosts } from "./review/actions";
import { UserReviewQueue } from "./review/UserReviewQueue";

export default async function DashboardPage() {
  const { user, roles } = await getAuthUserWithRoles();
  const isAdmin = hasAdminRole(roles);
  const t = await getTranslations();
  const posts = await getPostsForDashboard(user.id, isAdmin);
  const clientSettings = isAdmin ? null : await getClientSettings(user.id).catch(() => null);
  const reviewPosts = isAdmin ? [] : await getUserReviewPosts().catch(() => []);

  const initial = (user.email ?? "?")[0].toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Topbar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: "color-mix(in srgb, var(--surface) 85%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-0 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 4h11M2.5 8h7M2.5 12h4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: "var(--text)" }}>
              {t("common.appName")}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LocaleSwitcher />

            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all admin-panel-link"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                {t("dashboard.goToAdmin")}
              </Link>
            )}

            {/* Avatar / user menu */}
            <UserMenu email={user.email ?? ""} initial={initial} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero section */}
        <div className="mb-10 relative">
          {/* Glow */}
          <div
            className="absolute -top-8 -left-8 w-64 h-32 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(124,92,252,0.15) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--accent)" }}
          >
            {isAdmin ? t("dashboard.workspaceAdmin") : t("dashboard.workspaceUser")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {isAdmin
              ? t("dashboard.adminWelcome")
              : t("dashboard.welcome", { email: user.email ?? "" })}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            {isAdmin
              ? t("dashboard.adminSubtitle")
              : t("dashboard.userSubtitle")}
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: t("dashboard.stats.total"),
              value: posts.length,
              accent: false,
            },
            {
              label: t("dashboard.stats.published"),
              value: posts.filter((p) => p.status === "published").length,
              accent: true,
            },
            {
              label: t("dashboard.stats.draft"),
              value: posts.filter((p) => p.status === "draft").length,
              accent: false,
            },
            {
              label: t("dashboard.stats.review"),
              value: posts.filter((p) => p.status === "review").length,
              accent: false,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5"
              style={{
                background: "var(--surface)",
                border: stat.accent ? "1px solid rgba(124,92,252,0.4)" : "1px solid var(--border)",
                boxShadow: stat.accent ? "0 0 20px rgba(124,92,252,0.08)" : "none",
              }}
            >
              <div
                className="text-2xl font-bold mb-0.5"
                style={{ color: stat.accent ? "var(--accent)" : "var(--text)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* User review queue — AI-generated posts waiting for approval */}
        {!isAdmin && reviewPosts.length > 0 && (
          <UserReviewQueue posts={reviewPosts as Parameters<typeof UserReviewQueue>[0]["posts"]} />
        )}

        {/* Posts table */}
        <DashboardPostsTable posts={posts} isAdmin={isAdmin} />

        {/* Account settings — only for non-admin users who have a client row */}
        {!isAdmin && clientSettings && (
          <AccountSettingsCard userId={user.id} settings={clientSettings} />
        )}
      </main>
    </div>
  );
}
