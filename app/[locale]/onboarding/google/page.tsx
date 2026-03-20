"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function OnboardingGooglePage() {
  const t = useTranslations("onboarding.google");
  const tStep = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  const [connecting, setConnecting] = useState(false);

  function handleConnect() {
    setConnecting(true);
    window.location.href = `/api/google/oauth?locale=${locale}`;
  }

  function handleSkip() {
    fetch("/api/onboarding/complete", { method: "POST" }).then(() => {
      router.push(`/${locale}/dashboard`);
    });
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Step indicator */}
      <p
        className="text-xs font-semibold uppercase tracking-widest text-center mb-8"
        style={{ color: "var(--text-faint)" }}
      >
        {tStep("stepOf", { current: 2, total: 2 })}
      </p>

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

        {/* OAuth error feedback */}
        {oauthError && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "var(--danger)",
            }}
          >
            {t(`oauthError.${oauthError}`) ?? t("oauthError.generic")}
          </div>
        )}

        {/* Scope list */}
        <div className="space-y-3 mb-8">
          {[
            {
              label: t("scopeAnalytics"),
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
            {
              label: t("scopeSearch"),
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="6.5" cy="6.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              ),
            },
          ].map((scope, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "var(--accent)" }}>{scope.icon}</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {scope.label}
              </span>
            </div>
          ))}
        </div>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 mb-3"
          style={{
            background: "white",
            color: "#1a1a2e",
            boxShadow: connecting ? "none" : "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.2 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 13 5 4 14 4 25s9 20 20 20c11.1 0 20-8.9 20-20 0-1.2-.1-2.3-.4-3.5z" fill="#FFC107" />
            <path d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5c-7.6 0-14.2 4.1-17.7 9.7z" fill="#FF3D00" />
            <path d="M24 45c4.8 0 9.2-1.8 12.5-4.8l-6.1-5.1C28.5 36.8 26.3 37.5 24 37.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.8 40.8 16.4 45 24 45z" fill="#4CAF50" />
            <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5.1C36.9 37 44 31 44 24c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2" />
          </svg>
          {connecting ? t("connecting") : t("connectButton")}
        </button>

        {/* Finish — admin will complete webhook */}
        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            {t("finishForAdmin")}
          </p>
          <button
            onClick={handleSkip}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "var(--accent-bg)",
              color: "var(--accent)",
              border: "1px solid rgba(124,92,252,0.4)",
            }}
          >
            {t("finishButton")}
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs" style={{ color: "var(--text-faint)" }}>
        {t("privacyNote")}
      </p>
    </div>
  );
}
