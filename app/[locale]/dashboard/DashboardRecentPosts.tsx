import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { POST_STATUS_BADGE_STYLES } from "@/lib/dashboard/post-status-styles";

export type DashboardRecentPostRow = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  updated_at: string;
};

export async function DashboardRecentPosts({
  posts,
  limit = 6,
}: {
  posts: DashboardRecentPostRow[];
  limit?: number;
}) {
  const t = await getTranslations("dashboard");
  const tStatus = await getTranslations("post.status");
  const locale = await getLocale();
  const recent = posts.slice(0, limit);

  return (
    <section
      className="editorial-shell-glass rounded-2xl border"
      style={{ borderColor: "var(--adm-border-subtle)" }}
    >
      <div
        className="flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--adm-border-subtle)" }}
      >
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--adm-on-surface)" }}>
            {t("recentPostsTitle")}
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--adm-on-variant)" }}>
            {t("recentPostsSubtitle")}
          </p>
        </div>
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-wider transition-colors hover:underline hover:decoration-2 hover:underline-offset-4 sm:self-auto"
          style={{ color: "var(--adm-primary)" }}
        >
          {t("viewAllPosts")}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
            {t("noRecentPosts")}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--adm-on-variant)" }}>
            {t("noRecentPostsHint")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/new"
              className="rounded-lg bg-gradient-to-r from-[#6839ea] to-[#8b6bef] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"
            >
              {t("newPost")}
            </Link>
            <Link
              href="/dashboard/posts"
              className="rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:brightness-110"
              style={{ background: "var(--adm-surface-high)", color: "var(--adm-primary)" }}
            >
              {t("myPosts")}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--adm-border-subtle)" }}>
          {recent.map((post) => {
            const cfg = POST_STATUS_BADGE_STYLES[post.status] ?? POST_STATUS_BADGE_STYLES.idea;
            const statusLabel = tStatus.has(post.status) ? tStatus(post.status) : post.status;
            const updated = new Date(post.updated_at).toLocaleDateString(locale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <li key={post.id}>
                <Link
                  href={`/dashboard/posts/${post.id}`}
                  className="adm-row-hover flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
                      {post.slug}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide" style={{ color: "var(--adm-on-variant)" }}>
                      {post.primary_locale} · {t("updatedLabel", { date: updated })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                      {statusLabel}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--adm-primary)" }}>
                      {t("openPost")}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
