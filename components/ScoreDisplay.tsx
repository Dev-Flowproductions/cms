type SeoScore = { seo: number; aeo: number; geo: number };

function scoreColor(score: number): string {
  if (score >= 9) return "var(--success)";
  if (score >= 7) return "#f59e0b";
  if (score >= 5) return "#f97316";
  return "var(--danger)";
}

/**
 * Compact pill: ★ 9/10  — used in tables where space is tight
 */
export function ScorePill({ score }: { score: SeoScore }) {
  const avg = Math.round((score.seo + score.aeo + score.geo) / 3);
  const color = scoreColor(avg);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
      title={`SEO ${score.seo} · AEO ${score.aeo} · GEO ${score.geo}`}
    >
      ★ {avg}/10
    </span>
  );
}

/**
 * Star row: ★★★★☆ 9 — used in dashboard post tables
 */
export function ScoreDots({ score }: { score: SeoScore }) {
  const avg = Math.round((score.seo + score.aeo + score.geo) / 3);
  const color = scoreColor(avg);
  const filled = Math.round((avg / 10) * 5);

  return (
    <div
      className="flex items-center gap-1"
      title={`SEO ${score.seo} · AEO ${score.aeo} · GEO ${score.geo}`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={i < filled ? color : "none"}
          stroke={color}
          strokeWidth="2"
          style={{ opacity: i < filled ? 1 : 0.25 }}
        >
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
        </svg>
      ))}
      <span className="text-[10px] font-semibold tabular-nums ml-0.5" style={{ color }}>
        {avg}/10
      </span>
    </div>
  );
}

/**
 * Detailed 3-row badge: SEO ★★★★★ / AEO ★★★★★ / GEO ★★★★★ — used in admin posts list
 */
export function ScoreBadge({ score }: { score: SeoScore }) {
  const avg = Math.round((score.seo + score.aeo + score.geo) / 3);
  const avgColor = scoreColor(avg);

  function Row({ label, val }: { label: string; val: number }) {
    const color = scoreColor(val);
    const filled = Math.round((val / 10) * 5);
    return (
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider w-6" style={{ color: "var(--text-faint)" }}>
          {label}
        </span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill={i < filled ? color : "none"}
              stroke={color}
              strokeWidth="2.5"
              style={{ opacity: i < filled ? 1 : 0.25 }}
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
            </svg>
          ))}
          <span className="text-[9px] font-bold tabular-nums ml-0.5" style={{ color }}>{val}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <Row label="SEO" val={score.seo} />
      <Row label="AEO" val={score.aeo} />
      <Row label="GEO" val={score.geo} />
      <div
        className="mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold text-center tabular-nums"
        style={{
          background: `color-mix(in srgb, ${avgColor} 12%, transparent)`,
          color: avgColor,
        }}
      >
        avg {avg}/10
      </div>
    </div>
  );
}
