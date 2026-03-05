"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setLoading(false);
        setError(signInError.message);
        return;
      }
      if (!data.session) {
        setLoading(false);
        setError(t("auth.errors.noSession"));
        return;
      }
      setRedirecting(true);
      setError(null);
      const localeSegment = typeof locale === "string" && locale ? locale : "en";
      window.location.replace(`${window.location.origin}/${localeSegment}/dashboard`);
    } catch (err) {
      setLoading(false);
      setRedirecting(false);
      const message = err instanceof Error ? err.message : String(err);
      if (message === "Failed to fetch" || message.toLowerCase().includes("fetch")) {
        setError(
          t("auth.errors.networkError")
        );
      } else {
        setError(message);
      }
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        {/* Gradient orb */}
        <div
          className="absolute top-[-120px] left-[-80px] w-[480px] h-[480px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,92,252,0.25) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-[-100px] right-[-60px] w-[360px] h-[360px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 4.5h12M3 9h8M3 13.5h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--text)" }}>
              {t("common.appName")}
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h2
            className="text-4xl font-bold leading-tight mb-4"
            style={{ color: "var(--text)" }}
          >
            {t("login.tagline")}{" "}
            <span className="text-gradient">{t("login.taglineAccent")}</span>
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t("login.taglineSubtitle")}
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex gap-8">
          {[
            { value: "3", label: t("login.stats.locales") },
            { value: "AI", label: t("login.stats.assisted") },
            { value: "∞", label: t("login.stats.posts") },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 4.5h12M3 9h8M3 13.5h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--text)" }}>{t("common.appName")}</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
            {t("login.title")}
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
            {t("login.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: "var(--surface)",
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
                autoComplete="email"
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: "var(--surface)",
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
                autoComplete="current-password"
                placeholder="••••••••"
              />
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
              disabled={loading || redirecting}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              style={{
                background: loading || redirecting ? "var(--accent-dim)" : "var(--accent)",
                color: "white",
                boxShadow: loading || redirecting ? "none" : "0 0 24px rgba(124,92,252,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!loading && !redirecting) {
                  e.currentTarget.style.background = "var(--accent-dim)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !redirecting) {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {redirecting
                ? t("login.redirecting")
                : loading
                ? t("login.signingIn")
                : t("auth.signIn")}
            </button>
          </form>

          {/* Legal links */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href={`/${locale}/privacy`}
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--text-faint)" }}
            >
              Privacy Policy
            </a>
            <span style={{ color: "var(--border)" }}>·</span>
            <a
              href={`/${locale}/terms`}
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--text-faint)" }}
            >
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
