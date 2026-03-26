import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { POST_STATUS_BADGE_STYLES } from "@/lib/dashboard/post-status-styles";

export type AdminRecentPostRow = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  updated_at: string;
  accountName: string;
};

export async function AdminRecentPosts({ posts, limit = 10 }: { posts: AdminRecentPostRow[]; limit?: number }) {
  const t = await getTranslations("admin");
  const tStatus = await getTranslations("post.status");
  const locale = await getLocale();
  const recent = posts.slice(0, limit);

  return (
    <section
      className="admin-shell-glass rounded-2xl border"
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
          href="/admin/posts"
          className="inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80 sm:self-auto"
          style={{ color: "var(--adm-primary)" }}
        >
          {t("recentPostsViewAll")}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
            {t("recentPostsEmpty")}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--adm-on-variant)" }}>
            {t("recentPostsEmptyHint")}
          </p>
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
                  href={`/admin/posts/${post.id}`}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
                      {post.slug}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide" style={{ color: "var(--adm-on-variant)" }}>
                      <span className="font-semibold" style={{ color: "var(--adm-primary)" }}>
                        {post.accountName}
                      </span>
                      <span className="mx-1.5 opacity-50" aria-hidden>
                        ·
                      </span>
                      {post.primary_locale}
                      <span className="mx-1.5 opacity-50" aria-hidden>
                        ·
                      </span>
                      {t("recentPostsUpdated", { date: updated })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: cfg.dot }} />
                      {statusLabel}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--adm-primary)" }}>
                      {t("recentPostsOpen")}
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
