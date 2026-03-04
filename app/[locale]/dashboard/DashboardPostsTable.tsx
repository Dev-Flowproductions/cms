"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost } from "@/app/[locale]/(admin)/admin/posts/actions";

type PostRow = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

function getDisplayName(profiles: PostRow["profiles"]): string | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0]?.display_name ?? null;
  return profiles.display_name ?? null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  idea:       { bg: "rgba(120,120,160,0.12)", text: "#7878a0", dot: "#7878a0" },
  research:   { bg: "rgba(99,179,237,0.1)",   text: "#63b3ed", dot: "#63b3ed" },
  draft:      { bg: "rgba(245,166,35,0.1)",   text: "#f5a623", dot: "#f5a623" },
  optimize:   { bg: "rgba(255,128,72,0.1)",   text: "#ff8048", dot: "#ff8048" },
  format:     { bg: "rgba(124,92,252,0.12)",  text: "#a78bfa", dot: "#a78bfa" },
  review:     { bg: "rgba(240,98,146,0.1)",   text: "#f06292", dot: "#f06292" },
  approved:   { bg: "rgba(34,211,160,0.1)",   text: "#22d3a0", dot: "#22d3a0" },
  scheduled:  { bg: "rgba(99,102,241,0.1)",   text: "#818cf8", dot: "#818cf8" },
  published:  { bg: "rgba(34,211,160,0.12)",  text: "#22d3a0", dot: "#22d3a0" },
  archived:   { bg: "rgba(255,92,106,0.1)",   text: "#ff5c6a", dot: "#ff5c6a" },
};

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
          <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            {isAdmin ? t("dashboard.allPosts") : t("dashboard.myPosts")}
          </h2>
          {posts.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "rgba(124,92,252,0.12)",
                color: "var(--accent)",
              }}
            >
              {posts.length}
            </span>
          )}
        </div>
        {!isAdmin && (
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: "0 0 20px rgba(124,92,252,0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
            background: "rgba(255,92,106,0.08)",
            border: "1px solid rgba(255,92,106,0.25)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
          style={{
            border: "1.5px dashed var(--border)",
            background: "var(--surface)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 6.5h14M4 11h9M4 15.5h5.5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm mb-1 font-medium" style={{ color: "var(--text)" }}>
            {t("dashboard.noPostsYet")}
          </p>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
            Start writing your first post.
          </p>
          {!isAdmin && (
            <Link
              href="/admin/posts/new"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--accent)",
                color: "white",
              }}
            >
              {t("dashboard.createFirst")}
            </Link>
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {isAdmin && (
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t("dashboard.author")}
                  </th>
                )}
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Slug
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("admin.status")}
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest hidden md:table-cell"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("admin.primaryLocale")}
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest hidden sm:table-cell"
                  style={{ color: "var(--text-muted)" }}
                >
                  Updated
                </th>
                {!isAdmin && <th className="px-6 py-4" />}
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => {
                const authorName = getDisplayName(post.profiles);
                const cfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.idea;
                const isDeleting = deletingId === post.id;
                const isLast = i === posts.length - 1;

                return (
                  <tr
                    key={post.id}
                    style={{
                      borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-raised)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                    }}
                  >
                    {isAdmin && (
                      <td className="px-6 py-4">
                        {authorName ? (
                          <span className="flex items-center gap-2.5">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold uppercase flex-shrink-0"
                              style={{
                                background: "rgba(124,92,252,0.12)",
                                color: "var(--accent)",
                                border: "1px solid rgba(124,92,252,0.2)",
                              }}
                            >
                              {authorName[0]}
                            </span>
                            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                              {authorName}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs italic" style={{ color: "var(--text-faint)" }}>
                            Unknown
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 max-w-[220px] truncate">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--text)" }}
                      >
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
                      style={{ color: "var(--text-muted)" }}
                    >
                      {post.primary_locale}
                    </td>
                    <td
                      className="px-6 py-4 text-xs whitespace-nowrap hidden sm:table-cell"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {new Date(post.updated_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    {!isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 justify-end">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="text-xs font-semibold transition-colors"
                            style={{ color: "var(--accent)" }}
                          >
                            {t("common.edit")}
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.slug)}
                            disabled={isDeleting || isPending}
                            className="text-xs font-semibold transition-colors disabled:opacity-40"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                            }}
                          >
                            {isDeleting ? "…" : t("common.delete")}
                          </button>
                        </div>
                      </td>
                    )}
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
