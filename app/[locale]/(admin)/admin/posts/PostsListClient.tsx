"use client";

import { useEffect, useState, useTransition } from "react";
import { Link, useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { ScoreBadge } from "@/components/ScoreDisplay";
import { deletePost } from "@/app/[locale]/(admin)/admin/posts/actions";

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

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  published: { bg: "rgba(34,211,160,0.1)",  color: "var(--success)" },
  draft:     { bg: "rgba(124,92,252,0.1)",  color: "var(--accent)" },
  review:    { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24" },
};

function extractScore(locs: Localization[] | null, primaryLocale: string): SeoScore | null {
  if (!locs?.length) return null;
  const loc = locs.find(l => l.locale === primaryLocale) ?? locs[0];
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
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(255,92,106,0.08)",
            border: "1px solid rgba(255,92,106,0.25)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}
      {/* Filter tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {[{ key: undefined, label: t("postsPage.filterAll") }, ...["draft", "review", "published"].map((s) => ({ key: s, label: s }))].map(({ key, label }) => {
          const active = statusFilter === key;
          const href = key ? `${base}${statusSep}status=${key}` : base;
          return (
            <Link
              key={label}
              href={href}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all"
              style={{
                background: active ? "var(--accent)" : "var(--surface-raised)",
                color: active ? "white" : "var(--text-muted)",
                border: active ? "none" : "1px solid var(--border)",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              {[t("slug"), t("status"), "Webhook", t("primaryLocale"), t("author"), "Score", t("table.updated"), t("postsPage.actions")].map((h, i) => (
                <th key={i}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialPosts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm"
                  style={{ color: "var(--text-faint)", background: "var(--surface)" }}
                >
                  {t("postsPage.noPosts")}
                </td>
              </tr>
            ) : (
              initialPosts.map((post, idx) => {
                const statusStyle = STATUS_COLORS[post.status] ?? { bg: "var(--surface-raised)", color: "var(--text-muted)" };
                const accountName = clientByAuthor?.[post.author_id]
                  ? (clientByAuthor[post.author_id].company_name ?? clientByAuthor[post.author_id].brand_name ?? "—")
                  : (Array.isArray(post.profiles) ? post.profiles[0]?.display_name : post.profiles?.display_name) ?? "—";
                const score = extractScore(post.post_localizations, post.primary_locale);

                return (
                  <tr key={post.id} style={{
                    background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                    borderTop: "1px solid var(--border)",
                  }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text)" }}>
                      {post.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold capitalize"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {post.webhook_status === "success" && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: "rgba(34,211,160,0.1)", color: "var(--success)" }}>
                          ✓ Sent
                        </span>
                      )}
                      {post.webhook_status === "failed" && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}>
                          ✗ Failed
                        </span>
                      )}
                      {post.webhook_status === "pending" && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                          Sending…
                        </span>
                      )}
                      {!post.webhook_status && (
                        <span className="text-xs" style={{ color: "var(--text-faint)" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {post.primary_locale}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                      {accountName}
                    </td>
                    <td className="px-4 py-3">
                      {score
                        ? <ScoreBadge score={score} />
                        : <span className="text-xs" style={{ color: "var(--text-faint)" }}>—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-faint)" }}>
                      {new Date(post.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete({ id: post.id, slug: post.slug })}
                          disabled={deletingId === post.id || isPending || confirmDelete !== null}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap disabled:opacity-50"
                          style={{
                            background: "rgba(255,92,106,0.12)",
                            color: "var(--danger)",
                            border: "1px solid rgba(255,92,106,0.35)",
                          }}
                        >
                          {deletingId === post.id ? (
                            t("postsPage.deletingPost")
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {t("postsPage.deletePost")}
                            </>
                          )}
                        </button>
                        <Link href={`/admin/posts/${post.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap hover:opacity-80"
                          style={{
                            background: "var(--accent)",
                            color: "white",
                          }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          role="presentation"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-post-title" className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>
              {t("postsPage.confirmDeleteTitle")}
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              {t("postsPage.confirmDeletePost", { slug: confirmDelete.slug })}
            </p>
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "var(--surface-raised)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              >
                {t("postsPage.confirmNo")}
              </button>
              <button
                type="button"
                onClick={() => performDelete(confirmDelete.id)}
                disabled={deletingId !== null}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  background: "var(--danger)",
                  color: "white",
                }}
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
