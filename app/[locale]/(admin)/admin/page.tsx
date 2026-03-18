import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAdminStats() {
  const admin = createAdminClient();
  const [posts, review, users] = await Promise.all([
    admin.from("posts").select("id", { count: "exact", head: true }),
    admin.from("posts").select("id", { count: "exact", head: true }).eq("status", "review"),
    admin.from("clients").select("id", { count: "exact", head: true }),
  ]);
  return {
    totalPosts: posts.count ?? 0,
    reviewQueue: review.count ?? 0,
    totalUsers: users.count ?? 0,
  };
}

const QUICK_LINKS = [
  { href: "/admin/posts", labelKey: "posts" as const, icon: (
    <path d="M4 6.5h14M4 11h9M4 15.5h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  )},
  { href: "/admin/review-queue", labelKey: "reviewQueue" as const, icon: (
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  )},
  { href: "/admin/users", labelKey: "users" as const, icon: (
    <><circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M2 21v-1a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>
  )},
  { href: "/admin/settings", labelKey: "settings" as const, icon: (
    <><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.6" /></>
  )},
];

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const stats = await getAdminStats();

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--accent)" }}
        >
          {t("panelEyebrow")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          {t("dashboard")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {t("dashboardWelcome")}
        </p>
      </div>

      {/* Live stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { labelKey: "statTotalPosts" as const, value: stats.totalPosts, accent: false },
          { labelKey: "statInReview" as const, value: stats.reviewQueue, accent: stats.reviewQueue > 0, href: "/admin/review-queue" },
          { labelKey: "statClients" as const, value: stats.totalUsers, accent: false },
        ].map((stat) => (
          <div
            key={stat.labelKey}
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
              {t(stat.labelKey)}
            </div>
          </div>
        ))}
      </div>

      {/* Review queue alert */}
      {stats.reviewQueue > 0 && (
        <Link
          href="/admin/review-queue"
          className="flex items-center gap-4 px-5 py-4 rounded-2xl mb-8 transition-all group"
          style={{
            background: "rgba(124,92,252,0.06)",
            border: "1px solid rgba(124,92,252,0.3)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
            style={{ background: "var(--accent)" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {t("reviewWaiting", { count: stats.reviewQueue })}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {t("reviewOpenQueue")}
            </p>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform group-hover:translate-x-1 flex-shrink-0"
            style={{ color: "var(--accent)" }}
          >
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}

      {/* Quick links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between px-6 py-5 rounded-2xl transition-all"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--accent-bg)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
                  {item.icon}
                </svg>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {t(item.labelKey)}
              </span>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-1"
              style={{ color: "var(--accent)" }}
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
