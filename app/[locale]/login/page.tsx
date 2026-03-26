"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { AppLogo } from "@/components/AppLogo";

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
        setError(t("auth.errors.networkError"));
      } else {
        setError(message);
      }
    }
  }

  const inputClass =
    "w-full rounded-lg border-none px-4 py-3 text-sm transition-all placeholder:text-[#948ea1]/80 focus:outline-none focus:ring-1 focus:ring-[#ccbdff]/50";

  return (
    <div
      className="editorial-shell-root flex min-h-screen text-[var(--adm-on-surface)] antialiased"
      style={{ background: "var(--adm-bg)" }}
    >
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-16 lg:flex"
        style={{ background: "var(--adm-sidebar)" }}
      >
        <div
          className="pointer-events-none absolute -left-20 -top-28 h-[480px] w-[480px] rounded-full bg-[#6839ea]/20 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-16 h-[360px] w-[360px] rounded-full bg-[#ccbdff]/10 blur-[80px]"
          aria-hidden
        />

        <div className="relative z-10">
          <AppLogo className="h-10 w-auto object-contain opacity-95" />
        </div>

        <div className="relative z-10">
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight" style={{ color: "var(--adm-on-surface)" }}>
            {t("login.tagline")}{" "}
            <span style={{ color: "var(--adm-primary)" }}>{t("login.taglineAccent")}</span>
          </h2>
          <p className="max-w-md text-base leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
            {t("login.taglineSubtitle")}
          </p>
        </div>

        <div className="relative z-10 flex gap-10">
          {[
            { value: "3", label: t("login.stats.locales") },
            { value: "AI", label: t("login.stats.assisted") },
            { value: "∞", label: t("login.stats.posts") },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold" style={{ color: "var(--adm-primary)" }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="editorial-shell-glass w-full max-w-sm animate-slide-up rounded-2xl border p-8 sm:p-10" style={{ borderColor: "var(--adm-border-subtle)" }}>
          <div className="mb-8 lg:hidden">
            <AppLogo className="h-9 w-auto object-contain opacity-95" />
          </div>

          <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--adm-on-surface)" }}>
            {t("login.title")}
          </h1>
          <p className="mb-8 text-sm" style={{ color: "var(--adm-on-variant)" }}>
            {t("login.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--adm-on-variant)" }}
              >
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                style={{
                  background: "var(--adm-surface-highest)",
                  color: "var(--adm-on-surface)",
                }}
                autoComplete="email"
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--adm-on-variant)" }}
              >
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
                style={{
                  background: "var(--adm-surface-highest)",
                  color: "var(--adm-on-surface)",
                }}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{
                  background: "rgba(255, 180, 171, 0.08)",
                  border: "1px solid rgba(255, 180, 171, 0.25)",
                  color: "var(--adm-error)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || redirecting}
              className="w-full rounded-lg bg-gradient-to-r from-[#6839ea] to-[#8b6bef] py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#6839ea]/25 transition-all disabled:opacity-50"
            >
              {redirecting ? t("login.redirecting") : loading ? t("login.signingIn") : t("auth.signIn")}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href={`/${locale}/privacy`}
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: "var(--adm-on-variant)" }}
            >
              {t("login.privacyPolicy")}
            </a>
            <span style={{ color: "var(--adm-outline-variant)" }}>·</span>
            <a
              href={`/${locale}/terms`}
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: "var(--adm-on-variant)" }}
            >
              {t("login.termsOfUse")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
