import { getTranslations } from "next-intl/server";
import { getAuthUserWithRoles } from "@/lib/auth";
import { getPostsForDashboard } from "@/lib/data/posts";
import { Link } from "@/lib/navigation";
import { getClientSettings } from "@/app/[locale]/(admin)/admin/users/actions";
import { DashboardRecentPosts } from "./DashboardRecentPosts";

export default async function DashboardPage() {
  const { user } = await getAuthUserWithRoles();
  const t = await getTranslations("dashboard");
  const posts = await getPostsForDashboard(user.id, false);
  const clientSettings = await getClientSettings(user.id).catch(() => null);

  const published = posts.filter((p) => p.status === "published").length;
  const draft = posts.filter((p) => p.status === "draft").length;
  const inReview = posts.filter((p) => p.status === "review").length;

  return (
    <div className="max-w-6xl">
      {clientSettings?.config_pending_admin && (
        <div
          className="editorial-shell-glass mb-8 flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{
            background: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.35)",
            color: "#fbbf24",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p className="text-sm font-medium">{t("waitingForAdmin")}</p>
        </div>
      )}

      <header className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: "var(--adm-primary-container)" }}
          >
            {t("workspaceUser")}
          </span>
          <div className="h-px w-12 bg-[var(--adm-outline-variant)]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl" style={{ color: "var(--adm-on-surface)" }}>
          {t("welcome", { email: user.email ?? "" })}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
          {t("overviewSubtitle")}
        </p>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t("stats.total"), value: posts.length },
          { label: t("stats.published"), value: published, accent: true },
          { label: t("stats.draft"), value: draft },
          { label: t("stats.review"), value: inReview },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`editorial-shell-glass rounded-2xl border p-5 ${stat.accent ? "editorial-shell-ai-glow border-[#6839ea]/25" : ""}`}
            style={{ borderColor: stat.accent ? undefined : "var(--adm-border-subtle)" }}
          >
            <div
              className="mb-0.5 text-2xl font-bold"
              style={{ color: stat.accent ? "var(--adm-primary)" : "var(--adm-on-surface)" }}
            >
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <DashboardRecentPosts posts={posts} limit={8} />

      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t pt-8 text-xs font-semibold uppercase tracking-wider"
        style={{ borderColor: "var(--adm-border-subtle)" }}
      >
        <Link href="/dashboard/posts" className="transition-opacity hover:opacity-80" style={{ color: "var(--adm-primary)" }}>
          {t("viewAllPosts")}
        </Link>
        <span style={{ color: "var(--adm-outline-variant)" }} aria-hidden>
          ·
        </span>
        <Link href="/dashboard/settings" className="transition-opacity hover:opacity-80" style={{ color: "var(--adm-on-variant)" }}>
          {t("settings")}
        </Link>
      </div>
    </div>
  );
}
