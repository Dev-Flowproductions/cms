"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

async function saveDomain(domain: string) {
  const res = await fetch("/api/onboarding/domain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  });
  return res.json() as Promise<{ error?: string }>;
}

export default function OnboardingDomainPage() {
  const t = useTranslations("onboarding.domain");
  const tStep = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = domain.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    const result = await saveDomain(trimmed);
    setLoading(false);
    if (result.error) {
      setError(result.error === "domain_taken" ? t("errorDomainTaken") : result.error);
      return;
    }
    router.push(`/${locale}/onboarding/google`);
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Step indicator */}
      <p
        className="text-xs font-semibold uppercase tracking-widest text-center mb-8"
        style={{ color: "var(--text-faint)" }}
      >
        {tStep("stepOf", { current: 1, total: 2 })}
      </p>

      {/* Card */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--accent)" }}
        >
          {t("eyebrow")}
        </p>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
          {t("title")}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {t("subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="domain"
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              {t("label")}
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              placeholder={t("placeholder")}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <p className="mt-1.5 text-xs" style={{ color: "var(--text-faint)" }}>
              {t("hint")}
            </p>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(255,92,106,0.08)",
                border: "1px solid rgba(255,92,106,0.25)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: loading ? "none" : "0 0 24px rgba(124,92,252,0.35)",
            }}
          >
            {loading ? t("saving") : t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
}
