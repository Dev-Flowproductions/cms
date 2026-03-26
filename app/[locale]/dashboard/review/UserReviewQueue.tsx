"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/lib/navigation";
import { userApprovePost, userRejectPost } from "./actions";
import { ScorePill } from "@/components/ScoreDisplay";

type SeoScore = { seo: number; aeo: number; geo: number };
type Localization = { locale: string; title: string | null; excerpt: string | null; seo_score: SeoScore | null };
type Post = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  updated_at: string;
  post_localizations?: Localization[] | null;
};

function PostReviewCard({ post, onDone }: { post: Post; onDone: () => void }) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const loc = post.post_localizations?.find((l) => l.locale === post.primary_locale) ?? post.post_localizations?.[0];
  const title = loc?.title ?? "(untitled)";
  const excerpt = loc?.excerpt ?? "";
  const score = loc?.seo_score && typeof loc.seo_score.seo === "number" ? loc.seo_score as SeoScore : null;

  async function handleApprove() {
    setApproving(true);
    setError(null);
    const result = await userApprovePost(post.id);
    setApproving(false);
    if (result.error) { setError(result.error); return; }
    startTransition(() => { router.refresh(); });
    onDone();
  }

  async function handleReject() {
    setRejecting(true);
    setError(null);
    const result = await userRejectPost(post.id);
    setRejecting(false);
    if (result.error) { setError(result.error); return; }
    startTransition(() => { router.refresh(); });
    onDone();
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold leading-snug" style={{ color: "var(--text)" }}>
              {title}
            </h3>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--text-faint)" }}>{post.slug}</p>
          </div>
          {score && <ScorePill score={score} />}
        </div>
        {excerpt && (
          <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--text-muted)" }}>
            {excerpt}
          </p>
        )}
        <p className="text-xs mt-2" style={{ color: "var(--text-faint)" }}>
          Generated {new Date(post.updated_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)" }} />

      {/* Actions */}
      <div className="px-6 py-4 flex items-center gap-3 flex-wrap">
        {/* Read / Edit */}
        <Link
          href={`/dashboard/posts/${post.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "var(--surface-raised)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Read &amp; edit
        </Link>

        <div className="flex-1" />

        {/* Reject */}
        <button
          type="button"
          onClick={handleReject}
          disabled={rejecting || approving}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: "rgba(255,92,106,0.08)",
            color: "var(--danger)",
            border: "1px solid rgba(255,92,106,0.2)",
          }}
        >
          {rejecting ? "Sending back…" : "No — edit it"}
        </button>

        {/* Approve */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving || rejecting}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #22d3a0, #34d399)",
            color: "var(--bg)",
            boxShadow: "0 0 16px rgba(34,211,160,0.2)",
          }}
        >
          {approving ? (
            <>
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
              Publishing…
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Yes, publish it
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="px-6 pb-4">
          <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}
    </div>
  );
}

export function UserReviewQueue({ posts }: { posts: Post[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = posts.filter((p) => !dismissed.has(p.id));

  if (visible.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "var(--accent)" }}
        />
        <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
          Posts waiting for your approval
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(124,92,252,0.12)", color: "var(--accent)" }}
        >
          {visible.length}
        </span>
      </div>

      <div className="space-y-4">
        {visible.map((post) => (
          <PostReviewCard
            key={post.id}
            post={post}
            onDone={() => setDismissed((prev) => new Set([...prev, post.id]))}
          />
        ))}
      </div>
    </div>
  );
}
