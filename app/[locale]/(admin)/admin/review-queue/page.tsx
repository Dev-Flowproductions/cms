import { Link } from "@/lib/navigation";
import { getReviewQueuePosts } from "@/lib/data/review";
import { ScorePill } from "@/components/ScoreDisplay";

type SeoScore = { seo: number; aeo: number; geo: number };
type Localization = { locale: string; title: string | null; seo_score: SeoScore | null };
type Post = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
  post_localizations?: Localization[] | null;
};

function getDisplayName(profiles: Post["profiles"]): string | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0]?.display_name ?? null;
  return profiles.display_name ?? null;
}

function getTitle(locs: Localization[] | null | undefined, locale: string): string | null {
  if (!locs?.length) return null;
  return locs.find((l) => l.locale === locale)?.title ?? locs[0]?.title ?? null;
}

export default async function ReviewQueuePage() {
  const posts = await getReviewQueuePosts() as Post[];

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
          Admin
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Review queue
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          AI-generated posts waiting for your review. Open a post, tick the checklist, and approve to publish.
        </p>
      </div>

      {posts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
          style={{ border: "1.5px dashed var(--border)", background: "var(--surface)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(34,211,160,0.1)", border: "1px solid rgba(34,211,160,0.2)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
            All clear — nothing to review
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            New posts will appear here after the scheduler runs.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Post", "Author", "Score", "Updated", ""].map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => {
                const isLast = i === posts.length - 1;
                const authorName = getDisplayName(post.profiles);
                const title = getTitle(post.post_localizations, post.primary_locale);
                const loc = post.post_localizations?.find((l) => l.locale === post.primary_locale) ?? post.post_localizations?.[0];
                const score = loc?.seo_score && typeof loc.seo_score.seo === "number" ? loc.seo_score as SeoScore : null;

                return (
                  <tr
                    key={post.id}
                    className="transition-colors hover:bg-[var(--surface-raised)]"
                    style={{
                      borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                    }}
                  >
                    <td className="px-6 py-4">
                      <Link href={`/admin/posts/${post.id}`}>
                        <div className="font-medium text-sm hover:underline" style={{ color: "var(--text)" }}>
                          {title ?? <span style={{ color: "var(--text-faint)" }}>(untitled)</span>}
                        </div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: "var(--text-faint)" }}>
                          {post.slug}
                        </div>
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      {authorName ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                            style={{ background: "rgba(124,92,252,0.12)", color: "var(--accent)", border: "1px solid rgba(124,92,252,0.2)" }}
                          >
                            {authorName[0]}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{authorName}</span>
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-faint)" }}>—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {score ? <ScorePill score={score} /> : <span className="text-xs" style={{ color: "var(--text-faint)" }}>—</span>}
                    </td>

                    <td className="px-6 py-4 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                      {new Date(post.updated_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: "rgba(124,92,252,0.1)",
                          color: "var(--accent)",
                          border: "1px solid rgba(124,92,252,0.2)",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Review &amp; approve
                      </Link>
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
