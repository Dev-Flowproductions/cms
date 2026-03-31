"use client";

import { useEffect, useState, useTransition } from "react";
import { Link, useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { ScoreBadge } from "@/components/ScoreDisplay";
import { deletePost } from "@/app/[locale]/(admin)/admin/posts/actions";
import { POST_STATUS_BADGE_STYLES } from "@/lib/dashboard/post-status-styles";

type SeoScore = { seo: number; aeo: number; geo: number };

type Localization = {
  locale: string;
  seo_title: string | null;
  focus_keyword: string | null;
  faq_blocks: unknown;
  jsonld: unknown;
  seo_score: SeoScore | null;
};

type Row = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  author_id: string;
  updated_at: string;
  webhook_status?: string | null;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
  post_localizations: Localization[] | null;
};

function extractScore(locs: Localization[] | null, primaryLocale: string): SeoScore | null {
  if (!locs?.length) return null;
  const loc = locs.find((l) => l.locale === primaryLocale) ?? locs[0];
  const s = loc?.seo_score;
  if (s && typeof s.seo === "number") return s;
  return null;
}

export function PostsListClient({
  initialPosts,
  statusFilter,
  clientByAuthor,
  userId,
}: {
  initialPosts: Row[];
  statusFilter?: string;
  clientByAuthor?: Record<string, { company_name: string | null; brand_name: string | null }>;
  userId?: string;
}) {
  const t = useTranslations("admin");
  const tPostStatus = useTranslations("post.status");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; slug: string } | null>(null);
  const base = userId ? `/admin/posts?user=${userId}` : "/admin/posts";
  const statusSep = base.includes("?") ? "&" : "?";

  useEffect(() => {
    if (!confirmDelete) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmDelete(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete]);

  async function performDelete(postId: string) {
    setDeletingId(postId);
    setError(null);
    setConfirmDelete(null);
    const result = await deletePost(postId);
    if (result.error) {
      setError(result.error);
      setDeletingId(null);
      return;
    }
    startTransition(() => router.refresh());
    setDeletingId(null);
  }

  return (
    <div>
      {error && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "rgba(255, 180, 171, 0.08)",
            borderColor: "rgba(255, 180, 171, 0.28)",
            color: "var(--adm-error)",
          }}
        >
          {error}
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: undefined, label: t("postsPage.filterAll") },
          ...(["draft", "review", "published"] as const).map((s) => ({
            key: s,
            label: tPostStatus.has(s) ? tPostStatus(s) : s,
          })),
        ].map(({ key, label }) => {
          const active = statusFilter === key;
          const href = key ? `${base}${statusSep}status=${key}` : base;
          return (
            <Link
              key={label}
              href={href}
              className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: active ? "var(--adm-primary-container)" : "var(--adm-surface-high)",
                color: active ? "#fff" : "var(--adm-on-variant)",
                border: active ? "none" : "1px solid var(--adm-outline-variant)",
                boxShadow: active ? "0 0 14px rgba(104, 57, 234, 0.35)" : "none",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div
        className="admin-shell-glass overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--adm-border-subtle)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--adm-surface-high)", borderBottom: "1px solid var(--adm-border-subtle)" }}>
              {[t("slug"), t("status"), "Webhook", t("primaryLocale"), t("author"), "Score", t("table.updated"), t("postsPage.actions")].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialPosts.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {t("postsPage.noPosts")}
                </td>
              </tr>
            ) : (
              initialPosts.map((post, idx) => {
                const cfg = POST_STATUS_BADGE_STYLES[post.status] ?? POST_STATUS_BADGE_STYLES.idea;
                const statusLabel = tPostStatus.has(post.status) ? tPostStatus(post.status) : post.status;
                const accountName = clientByAuthor?.[post.author_id]
                  ? (clientByAuthor[post.author_id].company_name ?? clientByAuthor[post.author_id].brand_name ?? "—")
                  : (Array.isArray(post.profiles) ? post.profiles[0]?.display_name : post.profiles?.display_name) ?? "—";
                const score = extractScore(post.post_localizations, post.primary_locale);

                return (
                  <tr
                    key={post.id}
                    className="adm-row-hover"
                    style={{
                      background: idx % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderTop: "1px solid var(--adm-border-subtle)",
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--adm-on-surface)" }}>
                      {post.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: cfg.dot }} />
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {post.webhook_status === "success" && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ background: "rgba(34, 211, 160, 0.12)", color: "#4ade80" }}
                        >
                          ✓ Sent
                        </span>
                      )}
                      {post.webhook_status === "failed" && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ background: "rgba(255, 180, 171, 0.12)", color: "var(--adm-error)" }}
                        >
                          ✗ Failed
                        </span>
                      )}
                      {post.webhook_status === "pending" && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24" }}
                        >
                          Sending…
                        </span>
                      )}
                      {!post.webhook_status && (
                        <span className="text-xs" style={{ color: "var(--adm-on-variant)", opacity: 0.65 }}>
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
                      {post.primary_locale}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--adm-on-variant)" }}>
                      {accountName}
                    </td>
                    <td className="px-4 py-3">
                      {score ? (
                        <ScoreBadge score={score} />
                      ) : (
                        <span className="text-xs" style={{ color: "var(--adm-on-variant)", opacity: 0.65 }}>
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--adm-on-variant)" }}>
                      {new Date(post.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete({ id: post.id, slug: post.slug })}
                          disabled={deletingId === post.id || isPending || confirmDelete !== null}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                          style={{
                            background: "rgba(255, 180, 171, 0.1)",
                            color: "var(--adm-error)",
                            border: "1px solid rgba(255, 180, 171, 0.25)",
                          }}
                        >
                          {deletingId === post.id ? (
                            t("postsPage.deletingPost")
                          ) : (
                            <>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              {t("postsPage.deletePost")}
                            </>
                          )}
                        </button>
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-[var(--adm-interactive-hover-strong)]"
                          style={{
                            background: "var(--adm-primary-container)",
                            color: "#fff",
                            boxShadow: "0 0 14px rgba(104, 57, 234, 0.3)",
                          }}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          {t("editPost")}
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(6, 14, 32, 0.65)" }}
          role="presentation"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="admin-shell-glass w-full max-w-md rounded-2xl border p-6 shadow-xl"
            style={{ borderColor: "var(--adm-border-subtle)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-post-title" className="mb-2 text-lg font-bold" style={{ color: "var(--adm-on-surface)" }}>
              {t("postsPage.confirmDeleteTitle")}
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--adm-on-variant)" }}>
              {t("postsPage.confirmDeletePost", { slug: confirmDelete.slug })}
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: "var(--adm-surface-high)",
                  color: "var(--adm-on-surface)",
                  borderColor: "var(--adm-outline-variant)",
                }}
              >
                {t("postsPage.confirmNo")}
              </button>
              <button
                type="button"
                onClick={() => performDelete(confirmDelete.id)}
                disabled={deletingId !== null}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "var(--adm-error)" }}
              >
                {t("postsPage.confirmYes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
