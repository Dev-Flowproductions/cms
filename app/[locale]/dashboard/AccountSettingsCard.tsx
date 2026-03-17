"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  updateClientFrequency,
  updateUserAutoPublish,
  type Frequency,
} from "@/app/[locale]/(admin)/admin/users/actions";

const BRAND_VOICES = [
  { id: "professional", label: "Professional & Authoritative" },
  { id: "friendly", label: "Friendly & Approachable" },
  { id: "innovative", label: "Innovative & Forward-thinking" },
  { id: "luxurious", label: "Luxurious & Premium" },
  { id: "casual", label: "Casual & Conversational" },
] as const;

type Settings = {
  id: string;
  domain: string | null;
  google_access_token: string | null;
  google_connected_at: string | null;
  frequency: Frequency;
  webhook_url: string | null;
  auto_publish: boolean;
  company_name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  font_style?: string | null;
  brand_voice?: string | null;
  last_generation_error?: string | null;
  last_generation_error_at?: string | null;
};

const inputStyle = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border)",
  color: "var(--text)",
} as const;

export function AccountSettingsCard({
  userId,
  settings,
}: {
  userId: string;
  settings: Settings | null;
}) {
  const t = useTranslations("settings");
  const tBrand = useTranslations("onboarding.brand");
  const locale = useLocale();
  const router = useRouter();
  const brandLogoInputRef = useRef<HTMLInputElement>(null);

  const [frequency, setFrequency] = useState<Frequency>(settings?.frequency ?? "weekly");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [autoPublish, setAutoPublish] = useState(settings?.auto_publish ?? false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState(settings?.company_name ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.logo_url ?? null);
  const [primaryColor, setPrimaryColor] = useState(settings?.primary_color ?? "#7c5cfc");
  const [secondaryColor, setSecondaryColor] = useState(settings?.secondary_color ?? "#22d3a0");
  const [fontStyle, setFontStyle] = useState(settings?.font_style ?? "");
  const [brandVoice, setBrandVoice] = useState(settings?.brand_voice ?? "professional");
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);

  const FREQUENCY_OPTIONS: { value: Frequency; label: string; sublabel: string }[] = [
    { value: "daily",    label: t("frequency.daily"),    sublabel: t("frequency.dailySublabel") },
    { value: "weekly",   label: t("frequency.weekly"),   sublabel: t("frequency.weeklySublabel") },
    { value: "biweekly", label: t("frequency.biweekly"), sublabel: t("frequency.biweeklySublabel") },
    { value: "monthly",  label: t("frequency.monthly"),  sublabel: t("frequency.monthlySublabel") },
  ];

  if (!settings) return null;

  const googleConnected = !!settings.google_connected_at;
  const hasWebhook = !!settings.webhook_url;
  const changed = frequency !== settings.frequency;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateClientFrequency(userId, frequency);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleAutoPublishToggle() {
    const next = !autoPublish;
    setAutoSaving(true);
    setAutoError(null);
    const result = await updateUserAutoPublish(userId, next);
    setAutoSaving(false);
    if (result.error) { setAutoError(result.error); return; }
    setAutoPublish(next);
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 3000);
  }

  function handleBrandLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleBrandSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBrandSaving(true);
    setBrandError(null);
    setBrandSaved(false);
    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("primaryColor", primaryColor);
    formData.append("secondaryColor", secondaryColor);
    formData.append("fontStyle", fontStyle.trim() || "modern");
    formData.append("brandVoice", brandVoice);
    if (logoFile) formData.append("logo", logoFile);
    const res = await fetch("/api/settings/brand", { method: "POST", body: formData });
    const data = (await res.json()) as { error?: string };
    setBrandSaving(false);
    if (!res.ok) {
      setBrandError(data.error ?? "Failed to save");
      return;
    }
    setBrandSaved(true);
    setLogoFile(null);
    router.refresh();
    setTimeout(() => setBrandSaved(false), 3000);
  }

  return (
    <div
      className="mt-10 rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: "var(--accent)" }}
          >
            {t("account")}
          </p>
          <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>
            {t("title")}
          </h2>
        </div>
        {settings.domain && (
          <span
            className="text-xs font-mono px-3 py-1 rounded-lg"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            {settings.domain}
          </span>
        )}
      </div>

      <div className="px-6 py-6 space-y-8">

        {/* Google connection */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{
            background: googleConnected ? "var(--success-bg)" : "var(--surface-raised)",
            border: googleConnected ? "1px solid rgba(34,211,160,0.2)" : "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: googleConnected ? "rgba(34,211,160,0.12)" : "var(--surface)" }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.2 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 13 5 4 14 4 25s9 20 20 20c11.1 0 20-8.9 20-20 0-1.2-.1-2.3-.4-3.5z" fill="#FFC107" />
                <path d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5c-7.6 0-14.2 4.1-17.7 9.7z" fill="#FF3D00" />
                <path d="M24 45c4.8 0 9.2-1.8 12.5-4.8l-6.1-5.1C28.5 36.8 26.3 37.5 24 37.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.8 40.8 16.4 45 24 45z" fill="#4CAF50" />
                <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5.1C36.9 37 44 31 44 24c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {googleConnected ? t("googleConnected") : t("googleNotConnected")}
              </p>
              {googleConnected && settings.google_connected_at && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                  {new Date(settings.google_connected_at).toLocaleDateString(undefined, {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
          <a
            href={`/api/google/oauth?locale=${locale}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: googleConnected ? "transparent" : "var(--accent)",
              color: googleConnected ? "var(--text-muted)" : "white",
              border: googleConnected ? "1px solid var(--border)" : "none",
            }}
          >
            {googleConnected ? t("reconnectGoogle") : t("connectGoogle")}
          </a>
        </div>

        {settings.last_generation_error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(245,166,35,0.1)",
              border: "1px solid rgba(245,166,35,0.3)",
              color: "var(--text)",
            }}
          >
            <p className="font-semibold mb-1">{t("lastAutoRunFailedTitle")}</p>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{settings.last_generation_error}</p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>{t("lastAutoRunFailedHint")}</p>
          </div>
        )}

        {/* Post frequency */}
        <div
          className="rounded-xl p-5 space-y-6"
          style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              {t("postingFrequency")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FREQUENCY_OPTIONS.map((opt) => {
                const active = frequency === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    className="px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: active ? "rgba(124,92,252,0.12)" : "var(--surface)",
                      border: active ? "1px solid rgba(124,92,252,0.4)" : "1px solid var(--border)",
                      boxShadow: active ? "0 0 12px rgba(124,92,252,0.1)" : "none",
                    }}
                  >
                    <div className="text-sm font-semibold" style={{ color: active ? "var(--accent)" : "var(--text)" }}>
                      {opt.label}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !changed}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: "var(--accent)",
                color: "white",
                boxShadow: (!saving && changed) ? "0 0 16px rgba(124,92,252,0.25)" : "none",
              }}
            >
              {saving ? t("saving") : t("saveChanges")}
            </button>
            {saved && (
              <span className="text-xs font-medium" style={{ color: "var(--success)" }}>{t("saved")}</span>
            )}
          </div>
        </div>

        {/* Auto-publish */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            {t("webhook.autoPublishLabel")}
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>
            {hasWebhook
              ? t("webhook.autoPublishDescription")
              : t("webhook.noWebhookConfigured")}
          </p>

          {hasWebhook ? (
            <>
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{
                  background: autoPublish ? "var(--success-bg)" : "var(--surface-raised)",
                  border: autoPublish ? "1px solid rgba(34,211,160,0.2)" : "1px solid var(--border)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {autoPublish ? t("webhook.autoPublishOn") : t("webhook.autoPublishOff")}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoPublish}
                  onClick={handleAutoPublishToggle}
                  disabled={autoSaving}
                  className="relative w-10 h-5 rounded-full transition-all flex-shrink-0 disabled:opacity-50"
                  style={{ background: autoPublish ? "var(--success)" : "var(--border)" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform"
                    style={{
                      background: "white",
                      transform: autoPublish ? "translateX(20px)" : "translateX(0)",
                    }}
                  />
                </button>
              </div>
              {autoError && <p className="text-sm mt-2" style={{ color: "var(--danger)" }}>{autoError}</p>}
              {autoSaved && (
                <p className="text-xs mt-2 font-medium" style={{ color: "var(--success)" }}>{t("saved")}</p>
              )}
            </>
          ) : (
            <div
              className="px-4 py-3 rounded-xl text-xs"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-faint)",
              }}
            >
              {t("webhook.noWebhookConfigured")}
            </div>
          )}
        </div>

        {/* Brand */}
        <div
          className="rounded-xl p-5 space-y-5"
          style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {t("brand.title")}
          </p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            {t("brand.description")}
          </p>

          <form onSubmit={handleBrandSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                {tBrand("companyNameLabel")}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                {tBrand("logoLabel")}
              </label>
              <div
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:border-[var(--accent)]"
                style={{ background: "var(--surface)", border: "1px dashed var(--border)" }}
                onClick={() => brandLogoInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
                ) : (
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {logoPreview ? tBrand("logoChange") : tBrand("logoUpload")}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-faint)" }}>{tBrand("logoHint")}</p>
                </div>
                <input
                  ref={brandLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBrandLogoChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                {tBrand("colorsLabel")}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    style={{ background: "transparent" }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{tBrand("primaryColor")}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>{primaryColor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    style={{ background: "transparent" }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{tBrand("secondaryColor")}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>{secondaryColor}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                {tBrand("fontStyleLabel")}
              </label>
              <input
                type="text"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                placeholder={tBrand("fontStylePlaceholder")}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                {tBrand("brandVoiceLabel")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BRAND_VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setBrandVoice(v.id)}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left"
                    style={{
                      background: brandVoice === v.id ? "var(--accent)" : "var(--surface)",
                      color: brandVoice === v.id ? "white" : "var(--text)",
                      border: `1px solid ${brandVoice === v.id ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {brandError && <p className="text-sm" style={{ color: "var(--danger)" }}>{brandError}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={brandSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{
                  background: "var(--accent)",
                  color: "white",
                  boxShadow: !brandSaving ? "0 0 16px rgba(124,92,252,0.25)" : "none",
                }}
              >
                {brandSaving ? t("saving") : t("saveChanges")}
              </button>
              {brandSaved && (
                <span className="text-xs font-medium" style={{ color: "var(--success)" }}>{t("saved")}</span>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
