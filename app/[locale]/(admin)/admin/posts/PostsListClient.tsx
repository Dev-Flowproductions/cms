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
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<string[] | null>(null);
  const base = userId ? `/admin/posts?user=${userId}` : "/admin/posts";
  const statusSep = base.includes("?") ? "&" : "?";

  useEffect(() => {
    const valid = new Set(initialPosts.map((p) => p.id));
    setSelected((prev) => new Set([...prev].filter((id) => valid.has(id))));
  }, [initialPosts]);

  useEffect(() => {
    if (!confirmDeleteIds) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmDeleteIds(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDeleteIds]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (initialPosts.length === 0) return;
    const allIds = new Set(initialPosts.map((p) => p.id));
    const allSelected = initialPosts.length > 0 && selected.size === initialPosts.length;
    setSelected(allSelected ? new Set() : allIds);
  }

  async function performBulkDelete(ids: string[]) {
    setBulkDeleting(true);
    setError(null);
    setConfirmDeleteIds(null);
    for (const id of ids) {
      const result = await deletePost(id);
      if (result.error) {
        setError(result.error);
        setBulkDeleting(false);
        startTransition(() => router.refresh());
        return;
      }
    }
    setSelected(new Set());
    setBulkDeleting(false);
    startTransition(() => router.refresh());
  }

  const allSelected = initialPosts.length > 0 && selected.size === initialPosts.length;
  const selectedCount = selected.size;

  return (
    <div className="min-w-0">
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
        className="admin-shell-glass overflow-x-auto rounded-2xl border [-webkit-overflow-scrolling:touch]"
        style={{ borderColor: "var(--adm-border-subtle)" }}
      >
        <div
          className="flex flex-wrap items-center justify-end gap-4 border-b px-4 py-3"
          style={{ borderColor: "var(--adm-border-subtle)" }}
        >
          {selectedCount > 0 ? (
            <div className="min-w-0 text-xs font-semibold" style={{ color: "var(--adm-on-variant)" }}>
              {t("postsPage.selectedCount", { count: selectedCount })}
            </div>
          ) : null}
          <button
            type="button"
            disabled={selectedCount === 0 || bulkDeleting || isPending}
            onClick={() => {
              if (selectedCount === 0) return;
              setConfirmDeleteIds(Array.from(selected));
            }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all disabled:opacity-40"
            style={{
              background: selectedCount > 0 ? "rgba(255, 180, 171, 0.12)" : "var(--adm-surface-highest)",
              color: "var(--adm-error)",
              border: "1px solid rgba(255, 180, 171, 0.28)",
            }}
          >
            {bulkDeleting ? (
              t("postsPage.deletingPost")
            ) : (
              <>
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {t("postsPage.deleteSelected")}
              </>
            )}
          </button>
        </div>

        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr style={{ background: "var(--adm-surface-high)", borderBottom: "1px solid var(--adm-border-subtle)" }}>
              {[t("slug"), t("status"), t("author"), "Score", t("table.updated"), t("postsPage.actions")].map((h, i) => (
                <th
                  key={i}
                  className={`px-3 py-3 text-xs font-bold uppercase tracking-widest ${i === 5 ? "text-center" : "text-left"}`}
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {h}
                </th>
              ))}
              <th className="w-12 px-3 py-3 text-right">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border"
                  style={{ borderColor: "var(--adm-outline-variant)", accentColor: "var(--adm-primary-container)" }}
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={initialPosts.length === 0}
                  aria-label={t("postsPage.selectAllAria")}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {initialPosts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
                const isSelected = selected.has(post.id);

                return (
                  <tr
                    key={post.id}
                    className="adm-row-hover"
                    style={{
                      background: idx % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderTop: "1px solid var(--adm-border-subtle)",
                    }}
                  >
                    <td className="max-w-[6.5rem] px-2 py-3 align-middle font-mono text-[11px] leading-snug" style={{ color: "var(--adm-on-surface)" }}>
                      <span className="block truncate" title={post.slug}>
                        {post.slug}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: cfg.dot }} />
                        {statusLabel}
                      </span>
                    </td>
                    <td className="max-w-[10rem] px-3 py-3 align-middle text-sm" style={{ color: "var(--adm-on-variant)" }}>
                      <span className="block truncate" title={accountName}>
                        {accountName}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      {score ? (
                        <ScoreBadge score={score} />
                      ) : (
                        <span className="text-xs" style={{ color: "var(--adm-on-variant)", opacity: 0.65 }}>
                          —
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 align-middle text-xs" style={{ color: "var(--adm-on-variant)" }}>
                      {new Date(post.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-[var(--adm-interactive-hover-strong)]"
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
                    </td>
                    <td className="px-3 py-3 text-right align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border"
                        style={{ borderColor: "var(--adm-outline-variant)", accentColor: "var(--adm-primary-container)" }}
                        checked={isSelected}
                        onChange={() => toggleRow(post.id)}
                        aria-label={t("postsPage.selectRowAria")}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {confirmDeleteIds && confirmDeleteIds.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(6, 14, 32, 0.65)" }}
          role="presentation"
          onClick={() => setConfirmDeleteIds(null)}
        >
          <div
            className="admin-shell-glass w-full max-w-md rounded-2xl border p-6 shadow-xl"
            style={{ borderColor: "var(--adm-border-subtle)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-posts-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-posts-title" className="mb-2 text-lg font-bold" style={{ color: "var(--adm-on-surface)" }}>
              {t("postsPage.confirmDeleteTitle")}
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--adm-on-variant)" }}>
              {t("postsPage.confirmDeleteSelected", { count: confirmDeleteIds.length })}
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteIds(null)}
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
                onClick={() => performBulkDelete(confirmDeleteIds)}
                disabled={bulkDeleting}
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
