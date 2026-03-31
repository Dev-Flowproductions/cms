import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientsPendingWebhook } from "./users/actions";
import { getRecentPostsForAdmin } from "@/lib/data/posts";
import { AdminRecentPosts } from "./AdminRecentPosts";

async function getAdminHomeData() {
  const admin = createAdminClient();
  const [posts, users, recentPosts] = await Promise.all([
    admin.from("posts").select("id", { count: "exact", head: true }),
    admin.from("clients").select("id", { count: "exact", head: true }),
    getRecentPostsForAdmin(12).catch(() => []),
  ]);
  return {
    totalPosts: posts.count ?? 0,
    totalUsers: users.count ?? 0,
    recentPosts,
  };
}

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const [data, pendingWebhook] = await Promise.all([
    getAdminHomeData(),
    getClientsPendingWebhook().catch(() => []),
  ]);

  return (
    <div className="max-w-6xl">
      {pendingWebhook.length > 0 && (
        <div
          className="admin-shell-glass mb-6 rounded-xl border px-4 py-4"
          style={{
            background: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.35)",
          }}
        >
          <p className="mb-2 text-sm font-semibold" style={{ color: "#b45309" }}>
            {t("webhookMissingWarning")}
          </p>
          <ul className="mb-3 space-y-1 text-sm" style={{ color: "var(--adm-on-variant)" }}>
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
            style={{ color: "var(--adm-primary)" }}
          >
            {t("webhookMissingCta")}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}

      <header className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: "var(--adm-primary-container)" }}
          >
            {t("panelEyebrow")}
          </span>
          <div className="h-px w-12 bg-[var(--adm-outline-variant)]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl" style={{ color: "var(--adm-on-surface)" }}>
          {t("dashboard")}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
          {t("homeSubtitle")}
        </p>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { labelKey: "statTotalPosts" as const, value: data.totalPosts },
          { labelKey: "statClients" as const, value: data.totalUsers },
        ].map((stat) => (
          <div
            key={stat.labelKey}
            className="admin-shell-glass rounded-2xl border p-5"
            style={{ borderColor: "var(--adm-border-subtle)" }}
          >
            <div className="mb-0.5 text-2xl font-bold" style={{ color: "var(--adm-on-surface)" }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
              {t(stat.labelKey)}
            </div>
          </div>
        ))}
      </div>

      <AdminRecentPosts posts={data.recentPosts} limit={10} />

      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t pt-8 text-xs font-semibold uppercase tracking-wider"
        style={{ borderColor: "var(--adm-border-subtle)" }}
      >
        <Link
          href="/admin/posts"
          className="transition-colors hover:underline hover:decoration-2 hover:underline-offset-4"
          style={{ color: "var(--adm-primary)" }}
        >
          {t("recentPostsViewAll")}
        </Link>
        <span style={{ color: "var(--adm-outline-variant)" }} aria-hidden>
          ·
        </span>
        <Link
          href="/admin/users"
          className="transition-colors hover:text-[color:var(--adm-primary)] hover:underline hover:decoration-2 hover:underline-offset-4"
          style={{ color: "var(--adm-on-variant)" }}
        >
          {t("users")}
        </Link>
      </div>
    </div>
  );
}
