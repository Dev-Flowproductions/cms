"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost } from "@/app/[locale]/(admin)/admin/posts/actions";
import { ScoreDots } from "@/components/ScoreDisplay";
import { POST_STATUS_BADGE_STYLES } from "@/lib/dashboard/post-status-styles";

type SeoScore = { seo: number; aeo: number; geo: number };

type PostRow = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
  post_localizations?: { locale: string; seo_score: SeoScore | null }[] | null;
};

function getDisplayName(profiles: PostRow["profiles"]): string | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0]?.display_name ?? null;
  return profiles.display_name ?? null;
}

function extractScore(
  locs: PostRow["post_localizations"],
  primaryLocale: string
): SeoScore | null {
  if (!locs?.length) return null;
  const loc = locs.find((l) => l.locale === primaryLocale) ?? locs[0];
  const s = loc?.seo_score;
  if (s && typeof s.seo === "number") return s as SeoScore;
  return null;
}

export function DashboardPostsTable({
  posts,
  isAdmin,
}: {
  posts: PostRow[];
  isAdmin: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(postId: string, slug: string) {
    if (!confirm(t("dashboard.confirmDelete", { slug }))) return;
    setDeletingId(postId);
    setError(null);
    const result = await deletePost(postId);
    if (result.error) {
      setError(result.error);
      setDeletingId(null);
      return;
    }
    startTransition(() => {
      router.refresh();
    });
    setDeletingId(null);
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--adm-on-surface)" }}>
            {isAdmin ? t("dashboard.allPosts") : t("dashboard.myPosts")}
          </h2>
          {posts.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "var(--adm-primary-soft-bg)",
                color: "var(--adm-primary)",
              }}
            >
              {posts.length}
            </span>
          )}
        </div>
        {!isAdmin && (
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--adm-primary-container)",
              color: "#fff",
              boxShadow: "var(--adm-cta-glow-shadow)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {t("dashboard.newPost")}
          </Link>
        )}
      </div>

      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "color-mix(in srgb, var(--adm-error) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--adm-error) 35%, transparent)",
            color: "var(--adm-error)",
          }}
        >
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
          style={{
            border: "1.5px dashed var(--adm-outline-variant)",
            background: "var(--adm-surface-high)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "var(--adm-primary-soft-bg)",
              border: "1px solid var(--adm-accent-border)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M4 6.5h14M4 11h9M4 15.5h5.5"
                stroke="var(--adm-primary-container)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-sm mb-1 font-medium" style={{ color: "var(--adm-on-surface)" }}>
            {t("dashboard.noPostsYet")}
          </p>
          <p className="text-xs mb-5" style={{ color: "var(--adm-on-variant)" }}>
            {isAdmin ? t("dashboard.postsAutoCreated") : t("dashboard.postsEmptyManualHint")}
          </p>
          {!isAdmin && (
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--adm-primary-container)",
                color: "#fff",
                boxShadow: "var(--adm-cta-glow-shadow)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {t("dashboard.writeFirstPost")}
            </Link>
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--adm-border-subtle)",
            background: "var(--adm-surface-high)",
          }}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--adm-border-subtle)" }}>
                {isAdmin && (
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--adm-on-variant)" }}
                  >
                    {t("dashboard.author")}
                  </th>
                )}
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {t("dashboard.table.slug")}
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {t("admin.status")}
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest hidden md:table-cell"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {t("admin.primaryLocale")}
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest hidden sm:table-cell"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  Score
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest hidden sm:table-cell"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {t("dashboard.table.updated")}
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => {
                const authorName = getDisplayName(post.profiles);
                const cfg = POST_STATUS_BADGE_STYLES[post.status] ?? POST_STATUS_BADGE_STYLES.idea;
                const isDeleting = deletingId === post.id;
                const isLast = i === posts.length - 1;
                const score = extractScore(post.post_localizations, post.primary_locale);

                return (
                  <tr
                    key={post.id}
                    className="adm-row-hover"
                    style={{
                      borderBottom: isLast ? "none" : "1px solid var(--adm-border-subtle)",
                    }}
                  >
                    {isAdmin && (
                      <td className="px-6 py-4">
                        {authorName ? (
                          <span className="flex items-center gap-2.5">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold uppercase flex-shrink-0"
                              style={{
                                background: "var(--adm-primary-soft-bg)",
                                color: "var(--adm-primary)",
                                border: "1px solid var(--adm-accent-border)",
                              }}
                            >
                              {authorName[0]}
                            </span>
                            <span className="text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
                              {authorName}
                            </span>
                          </span>
                        ) : (
                          <span
                            className="text-xs italic"
                            style={{ color: "var(--adm-on-variant)", opacity: 0.75 }}
                          >
                            {t("dashboard.table.unknownAuthor")}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 max-w-[220px] truncate">
                      <span className="text-xs font-mono" style={{ color: "var(--adm-on-surface)" }}>
                        {post.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: cfg.dot }}
                        />
                        {post.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-xs uppercase hidden md:table-cell"
                      style={{ color: "var(--adm-on-variant)" }}
                    >
                      {post.primary_locale}
                    </td>
                    <td
                      className="px-6 py-4 hidden sm:table-cell"
                    >
                      {score ? (
                        <ScoreDots score={score} />
                      ) : (
                        <span className="text-xs" style={{ color: "var(--adm-on-variant)", opacity: 0.7 }}>
                          —
                        </span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 text-xs whitespace-nowrap hidden sm:table-cell"
                      style={{ color: "var(--adm-on-variant)" }}
                    >
                      {new Date(post.updated_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          href={isAdmin ? `/admin/posts/${post.id}` : `/dashboard/posts/${post.id}`}
                          className="text-xs font-semibold transition-colors hover:underline hover:decoration-2 hover:underline-offset-2"
                          style={{ color: "var(--adm-primary)" }}
                        >
                          {t("common.edit")}
                        </Link>
                        {!isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id, post.slug)}
                            disabled={isDeleting || isPending}
                            className="text-xs font-semibold transition-colors disabled:opacity-40 hover:[color:var(--adm-error)]"
                            style={{ color: "var(--adm-on-variant)" }}
                          >
                            {isDeleting ? "…" : t("common.delete")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
