"use client";

import { useState } from "react";

export function RunSchedulerButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ generated: number; skipped: number; errors: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    if (!confirm("Run the AI post scheduler now? This will generate new posts for all due clients.")) return;
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/scheduler", { method: "POST" });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Scheduler failed"); return; }
      setResult({ generated: json.generated, skipped: json.skipped, errors: json.errors });
      setTimeout(() => setResult(null), 8000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRun}
        disabled={running}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all w-full disabled:opacity-50"
        style={{ color: running ? "var(--accent)" : "var(--text-muted)" }}
        onMouseEnter={(e) => { if (!running) (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { if (!running) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
      >
        {running ? (
          <svg className="animate-spin flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        )}
        {running ? "Generating…" : "Run scheduler"}
      </button>
      {result && (
        <p className="text-[10px] px-3 mt-1" style={{ color: "var(--success)" }}>
          ✓ {result.generated} generated · {result.skipped} skipped · {result.errors} errors
        </p>
      )}
      {error && (
        <p className="text-[10px] px-3 mt-1" style={{ color: "var(--danger)" }}>{error}</p>
      )}
    </div>
  );
}
