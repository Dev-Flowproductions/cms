"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getMsUntilNextPostDue } from "@/lib/scheduler/next-post";

function formatCompactCountdown(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

type Props = {
  lastPostGeneratedAt: string | null | undefined;
  frequency: string;
  /** When false, hide (e.g. onboarding without domain). */
  active?: boolean;
  variant?: "editorial" | "adminInline" | "adminDetail";
  className?: string;
};

export function NextPostCountdown({
  lastPostGeneratedAt,
  frequency,
  active = true,
  variant = "editorial",
  className = "",
}: Props) {
  const t = useTranslations("dashboard.shell");
  const [ms, setMs] = useState(() =>
    active ? getMsUntilNextPostDue(lastPostGeneratedAt, frequency) : 0,
  );

  useEffect(() => {
    if (!active) return;
    const tick = () => setMs(getMsUntilNextPostDue(lastPostGeneratedAt, frequency));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [lastPostGeneratedAt, frequency, active]);

  if (!active) return null;

  const text = ms <= 0 ? t("nextPostDueNow") : formatCompactCountdown(ms);

  if (variant === "editorial") {
    return (
      <div
        className={`flex min-w-0 max-w-[min(100%,12rem)] shrink items-center gap-1.5 truncate sm:max-w-[14rem] ${className}`}
        title={`${t("nextPostLabel")}: ${text}`}
      >
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
          {t("nextPostLabel")}
        </span>
        <span
          className="min-w-0 truncate font-mono text-[11px] font-semibold tabular-nums sm:text-xs"
          style={{ color: ms <= 0 ? "var(--adm-primary)" : "var(--adm-on-surface)" }}
        >
          {text}
        </span>
      </div>
    );
  }

  if (variant === "adminDetail") {
    return (
      <div
        className={`inline-flex flex-wrap items-baseline gap-2 rounded-xl border px-3 py-2 text-sm ${className}`}
        style={{
          borderColor: "var(--adm-border-subtle)",
          background: "var(--adm-surface-high)",
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
          {t("nextPostLabel")}
        </span>
        <span
          className="font-mono font-semibold tabular-nums"
          style={{ color: ms <= 0 ? "var(--adm-primary)" : "var(--adm-on-surface)" }}
        >
          {text}
        </span>
      </div>
    );
  }

  // adminInline — table row / compact
  return (
    <span className={`block truncate font-mono text-[10px] tabular-nums ${className}`} style={{ color: "var(--adm-on-variant)" }}>
      <span className="font-sans font-semibold" style={{ color: "var(--adm-on-variant)" }}>
        {t("nextPostLabel")}{" "}
      </span>
      <span style={{ color: ms <= 0 ? "var(--adm-primary)" : "var(--adm-on-surface)" }}>{text}</span>
    </span>
  );
}
