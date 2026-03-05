"use client";

import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";

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

function StarMini({ score }: { score: number }) {
  const filled = Math.round((score / 10) * 5);
  const color =
    score >= 9 ? "var(--success)" :
    score >= 7 ? "#f59e0b" :
    score >= 5 ? "#f97316" :
    "var(--danger)";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24"
          fill={i < filled ? color : "none"}
          stroke={color} strokeWidth="2.5"
          style={{ opacity: i < filled ? 1 : 0.25 }}
        >
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
        </svg>
      ))}
      <span className="text-[10px] font-bold tabular-nums ml-0.5" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function ScoreBadge({ score }: { score: SeoScore }) {
  const avg = Math.round((score.seo + score.aeo + score.geo) / 3);
  return (
    <div className="flex flex-col gap-1 min-w-[72px]">
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider w-6" style={{ color: "var(--text-faint)" }}>SEO</span>
        <StarMini score={score.seo} />
      </div>
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider w-6" style={{ color: "var(--text-faint)" }}>AEO</span>
        <StarMini score={score.aeo} />
      </div>
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider w-6" style={{ color: "var(--text-faint)" }}>GEO</span>
        <StarMini score={score.geo} />
      </div>
      <div
        className="mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-center tabular-nums"
        style={{
          background: avg >= 9 ? "rgba(34,211,160,0.12)" : avg >= 7 ? "rgba(245,158,11,0.12)" : "rgba(255,92,106,0.12)",
          color: avg >= 9 ? "var(--success)" : avg >= 7 ? "#f59e0b" : "var(--danger)",
        }}
      >
        avg {avg}/10
      </div>
    </div>
  );
}

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
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              {[t("slug"), t("status"), "Webhook", t("primaryLocale"), t("author"), "Score", t("table.updated"), ""].map((h, i) => (
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
                const author = Array.isArray(post.profiles)
                  ? post.profiles[0]?.display_name
                  : post.profiles?.display_name;
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
                      {author ?? "—"}
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
                    <td className="px-4 py-3">
                      <Link href={`/admin/posts/${post.id}`}
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
