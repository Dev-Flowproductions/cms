"use client";

const SCORE_MAX = 100;

type ScoreData = {
  seo: number;
  aeo: number;
  geo: number;
  notes?: string;
};

/** Normalize to 0-100 if stored as 0-10 (legacy). */
function normalizeScore(val: number): number {
  if (val >= 0 && val <= 10 && val % 1 === 0) return Math.round(val * 10);
  return Math.min(SCORE_MAX, Math.max(0, Math.round(val)));
}

function StarBar({ score }: { score: number }) {
  const s = normalizeScore(score);
  const filled = Math.round((s / SCORE_MAX) * 5);
  const color =
    s >= 90 ? "var(--success)" :
    s >= 70 ? "#f59e0b" :
    s >= 50 ? "#f97316" :
    "var(--danger)";

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < filled ? color : "none"}
          stroke={color}
          strokeWidth="2"
          style={{ opacity: i < filled ? 1 : 0.3 }}
        >
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
        </svg>
      ))}
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {s}/{SCORE_MAX}
      </span>
    </div>
  );
}

export function SeoScorePanel({ score }: { score: ScoreData }) {
  const s = {
    seo: normalizeScore(score.seo),
    aeo: normalizeScore(score.aeo),
    geo: normalizeScore(score.geo),
  };
  const avg = Math.round((s.seo + s.aeo + s.geo) / 3);
  const avgColor =
    avg >= 90 ? "var(--success)" :
    avg >= 70 ? "#f59e0b" :
    avg >= 50 ? "#f97316" :
    "var(--danger)";

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "rgba(124,92,252,0.04)",
        border: "1px solid rgba(124,92,252,0.15)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--accent)" }}
        >
          Content Score
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold" style={{ color: "var(--text-faint)" }}>
            avg
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: avgColor }}
          >
            {avg}/{SCORE_MAX}
          </span>
        </div>
      </div>

      {/* Three scores */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { label: "SEO", value: s.seo, hint: "Search engine ranking signals" },
            { label: "AEO", value: s.aeo, hint: "Answer engine / featured snippets" },
            { label: "GEO", value: s.geo, hint: "Generative AI citation readiness" },
          ] as const
        ).map(({ label, value, hint }) => (
          <div
            key={label}
            className="rounded-lg p-3 space-y-1.5"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </span>
            </div>
            <StarBar score={value} />
            <p className="text-[10px] leading-tight" style={{ color: "var(--text-faint)" }}>
              {hint}
            </p>
          </div>
        ))}
      </div>

      {/* Notes */}
      {score.notes && (
        <div
          className="rounded-lg px-3 py-2"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--text-muted)" }}>
            {score.notes}
          </p>
        </div>
      )}
    </div>
  );
}
