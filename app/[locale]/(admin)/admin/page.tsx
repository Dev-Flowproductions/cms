import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientsPendingWebhook } from "./users/actions";

async function getAdminStats() {
  const admin = createAdminClient();
  const [posts, users] = await Promise.all([
    admin.from("posts").select("id", { count: "exact", head: true }),
    admin.from("clients").select("id", { count: "exact", head: true }),
  ]);
  return {
    totalPosts: posts.count ?? 0,
    totalUsers: users.count ?? 0,
  };
}

const QUICK_LINKS = [
  { href: "/admin/posts", labelKey: "posts" as const, icon: (
    <path d="M4 6.5h14M4 11h9M4 15.5h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  )},
  { href: "/admin/users", labelKey: "users" as const, icon: (
    <><circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M2 21v-1a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>
  )},
];

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const [stats, pendingWebhook] = await Promise.all([
    getAdminStats(),
    getClientsPendingWebhook().catch(() => []),
  ]);

  return (
    <div className="max-w-3xl">
      {/* Webhook missing warning */}
      {pendingWebhook.length > 0 && (
        <div
          className="mb-6 px-4 py-4 rounded-xl"
          style={{
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: "#b45309" }}>
            {t("webhookMissingWarning")}
          </p>
          <ul className="text-sm space-y-1 mb-3" style={{ color: "var(--text-muted)" }}>
            {pendingWebhook.map((u) => (
              <li key={u.user_id}>
                {u.display_name?.trim() || u.email || u.user_id}
                {u.email && u.display_name?.trim() ? ` (${u.email})` : u.email ? "" : ` — ${u.user_id.slice(0, 8)}…`}
              </li>
            ))}
          </ul>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            {t("webhookMissingCta")}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}

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
      <div className="grid grid-cols-2 gap-4 mb-10">
        {[
          { labelKey: "statTotalPosts" as const, value: stats.totalPosts, accent: false },
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
