"use client";

import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";

type Row = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  published: { bg: "rgba(34,211,160,0.1)", color: "var(--success)" },
  draft:     { bg: "rgba(124,92,252,0.1)", color: "var(--accent)" },
  review:    { bg: "rgba(251,191,36,0.1)", color: "#fbbf24" },
};

export function PostsListClient({
  initialPosts,
  statusFilter,
}: {
  initialPosts: Row[];
  statusFilter?: string;
}) {
  const t = useTranslations("admin");

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {[{ key: undefined, label: t("postsPage.filterAll") }, ...["draft", "review", "published"].map((s) => ({ key: s, label: s }))].map(({ key, label }) => {
          const active = statusFilter === key;
          return (
            <Link
              key={label}
              href={key ? `/admin/posts?status=${key}` : "/admin/posts"}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all"
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
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              {[t("slug"), t("status"), t("primaryLocale"), t("author"), t("table.updated"), ""].map((h, i) => (
                <th
                  key={i}
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
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm"
                  style={{ color: "var(--text-faint)", background: "var(--surface)" }}
                >
                  {t("postsPage.noPosts")}
                </td>
              </tr>
            ) : (
              initialPosts.map((post, idx) => {
                const statusStyle = STATUS_COLORS[post.status] ?? { bg: "var(--surface-raised)", color: "var(--text-muted)" };
                const author = Array.isArray(post.profiles)
                  ? post.profiles[0]?.display_name
                  : post.profiles?.display_name;

                return (
                  <tr
                    key={post.id}
                    style={{
                      background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text)" }}>
                      {post.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-semibold capitalize"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {post.primary_locale}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                      {author ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-faint)" }}>
                      {new Date(post.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          background: "var(--surface-raised)",
                          color: "var(--accent)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {t("editPost")}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
