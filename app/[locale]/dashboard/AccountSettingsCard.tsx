"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  updateClientFrequency,
  updateClientDomain,
  updateUserAutoPublish,
  updateProfile,
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
  tertiary_color?: string | null;
  alternative_color?: string | null;
  font_style?: string | null;
  brand_voice?: string | null;
  last_generation_error?: string | null;
  last_generation_error_at?: string | null;
  cover_reference_image_1?: string | null;
  cover_reference_image_2?: string | null;
  cover_reference_image_3?: string | null;
  brand_guidelines_storage_path?: string | null;
  brand_guidelines_text?: string | null;
};

const inputStyle = {
  background: "var(--adm-surface-highest)",
  color: "var(--adm-on-surface)",
} as const;

const inputClass =
  "adm-input-edge w-full text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--adm-primary-container)] focus:ring-offset-0 focus:ring-offset-transparent";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  job_title: string | null;
} | null;

export function AccountSettingsCard({
  userId,
  settings,
  profile,
}: {
  userId: string;
  settings: Settings | null;
  profile?: Profile;
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
  const [tertiaryColor, setTertiaryColor] = useState(settings?.tertiary_color ?? "#f59e0b");
  const [alternativeColor, setAlternativeColor] = useState(settings?.alternative_color ?? "");
  const [fontStyle, setFontStyle] = useState(settings?.font_style ?? "");
  const [brandVoice, setBrandVoice] = useState(settings?.brand_voice ?? "professional");
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);

  const [brandAssetsBusy, setBrandAssetsBusy] = useState(false);
  const [brandAssetsError, setBrandAssetsError] = useState<string | null>(null);
  const [brandAssetsSaved, setBrandAssetsSaved] = useState(false);

  const [domain, setDomain] = useState(settings?.domain ?? "");
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainSaved, setDomainSaved] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const FREQUENCY_OPTIONS: { value: Frequency; label: string; sublabel: string }[] = [
    { value: "daily",    label: t("frequency.daily"),    sublabel: t("frequency.dailySublabel") },
    { value: "weekly",   label: t("frequency.weekly"),   sublabel: t("frequency.weeklySublabel") },
    { value: "biweekly", label: t("frequency.biweekly"), sublabel: t("frequency.biweeklySublabel") },
    { value: "monthly",  label: t("frequency.monthly"),  sublabel: t("frequency.monthlySublabel") },
  ];

  if (!settings) return null;

  const supabasePublic = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const brandAssetUrl = (path: string | null | undefined) =>
    path && supabasePublic ? `${supabasePublic}/storage/v1/object/public/brand-assets/${path}` : null;

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
    formData.append("tertiaryColor", tertiaryColor);
    formData.append("alternativeColor", alternativeColor || "");
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

  async function postBrandAsset(formData: FormData) {
    setBrandAssetsBusy(true);
    setBrandAssetsError(null);
    setBrandAssetsSaved(false);
    try {
      const res = await fetch("/api/settings/brand-assets", { method: "POST", body: formData });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setBrandAssetsSaved(true);
      router.refresh();
      setTimeout(() => setBrandAssetsSaved(false), 3000);
    } catch (e) {
      setBrandAssetsError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBrandAssetsBusy(false);
    }
  }

  return (
    <div
      className="mt-10 min-w-0 max-w-full rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--adm-border-subtle)" }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: "var(--adm-primary)" }}
          >
            {t("account")}
          </p>
          <h2 className="text-base font-bold" style={{ color: "var(--adm-on-surface)" }}>
            {t("title")}
          </h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">

        {/* Author (shown on blog posts) */}
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--adm-on-variant)" }}
          >
            Author (for blog posts)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setProfileError(null); }}
                placeholder="Your name"
                className={`${inputClass} px-4 py-3 rounded-xl`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>Avatar URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => { setAvatarUrl(e.target.value); setProfileError(null); }}
                placeholder="https://..."
                className={`${inputClass} px-4 py-3 rounded-xl`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>Job title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => { setJobTitle(e.target.value); setProfileError(null); }}
                placeholder="e.g. Content Lead"
                className={`${inputClass} px-4 py-3 rounded-xl`}
                style={inputStyle}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>Short bio</label>
              <textarea
                value={bio}
                onChange={(e) => { setBio(e.target.value); setProfileError(null); }}
                placeholder="One line shown under your name on posts"
                rows={2}
                className={`${inputClass} px-4 py-3 rounded-xl`}
                style={inputStyle}
              />
            </div>
          </div>
          {profileError && <p className="text-xs" style={{ color: "var(--adm-error)" }}>{profileError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                setProfileSaving(true);
                setProfileError(null);
                setProfileSaved(false);
                const result = await updateProfile(userId, {
                  display_name: displayName.trim() || null,
                  avatar_url: avatarUrl.trim() || null,
                  bio: bio.trim() || null,
                  job_title: jobTitle.trim() || null,
                });
                setProfileSaving(false);
                if (result.error) { setProfileError(result.error); return; }
                setProfileSaved(true);
                router.refresh();
                setTimeout(() => setProfileSaved(false), 3000);
              }}
              disabled={profileSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: "var(--adm-primary-container)",
                color: "white",
                boxShadow: !profileSaving ? "var(--adm-cta-glow-shadow)" : "none",
              }}
            >
              {profileSaving ? t("saving") : t("saveChanges")}
            </button>
            {profileSaved && (
              <span className="text-xs font-medium" style={{ color: "var(--success)" }}>{t("saved")}</span>
            )}
          </div>
        </div>

        {/* Website domain — editable */}
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--adm-on-variant)" }}
          >
            {tBrand("domainLabel")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setDomainError(null); }}
              placeholder="yourdomain.com"
              className={`${inputClass} flex-1 min-w-[200px] px-4 py-2.5 rounded-lg`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={async () => {
                setDomainSaving(true);
                setDomainError(null);
                setDomainSaved(false);
                const result = await updateClientDomain(userId, domain);
                setDomainSaving(false);
                if (result.error) {
                  setDomainError(result.error === "domain_taken" ? tBrand("errorDomainTaken") : result.error);
                  return;
                }
                setDomainSaved(true);
                setTimeout(() => setDomainSaved(false), 3000);
                router.refresh();
              }}
              disabled={domainSaving || domain.trim() === "" || domain.trim().toLowerCase().replace(/^https?:\/\//, "") === (settings.domain ?? "")}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              style={{
                background: "var(--adm-primary-container)",
                color: "white",
              }}
            >
              {domainSaving ? t("saving") : domainSaved ? t("saved") : t("saveChanges")}
            </button>
          </div>
          {domainError && (
            <p className="text-xs" style={{ color: "var(--adm-error)" }}>{domainError}</p>
          )}
        </div>

        {/* Google connection */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{
            background: googleConnected ? "rgba(34, 211, 160, 0.12)" : "var(--adm-surface-highest)",
            border: googleConnected ? "1px solid rgba(34,211,160,0.2)" : "1px solid var(--adm-border-subtle)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: googleConnected ? "rgba(34,211,160,0.12)" : "var(--adm-surface-high)" }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.2 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 13 5 4 14 4 25s9 20 20 20c11.1 0 20-8.9 20-20 0-1.2-.1-2.3-.4-3.5z" fill="#FFC107" />
                <path d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5c-7.6 0-14.2 4.1-17.7 9.7z" fill="#FF3D00" />
                <path d="M24 45c4.8 0 9.2-1.8 12.5-4.8l-6.1-5.1C28.5 36.8 26.3 37.5 24 37.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.8 40.8 16.4 45 24 45z" fill="#4CAF50" />
                <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5.1C36.9 37 44 31 44 24c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
                {googleConnected ? t("googleConnected") : t("googleNotConnected")}
              </p>
              {googleConnected && settings.google_connected_at && (
                <p className="text-xs mt-0.5" style={{ color: "var(--adm-on-variant)" }}>
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
              background: googleConnected ? "transparent" : "var(--adm-primary-container)",
              color: googleConnected ? "var(--adm-on-variant)" : "white",
              border: googleConnected ? "1px solid var(--adm-border-subtle)" : "none",
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
              color: "var(--adm-on-surface)",
            }}
          >
            <p className="font-semibold mb-1">{t("lastAutoRunFailedTitle")}</p>
            <p className="text-xs mb-1" style={{ color: "var(--adm-on-variant)" }}>{settings.last_generation_error}</p>
            <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>{t("lastAutoRunFailedHint")}</p>
          </div>
        )}

        {/* Post frequency */}
        <div
          className="rounded-xl p-5 space-y-6"
          style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--adm-on-variant)" }}
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
                    className={
                      "px-4 py-3 rounded-xl text-left transition-all border " +
                      (active
                        ? "border-[var(--adm-accent-border)]"
                        : "border-[var(--adm-border-subtle)] hover:border-[var(--adm-outline-variant)] hover:bg-[var(--adm-interactive-hover)]")
                    }
                    style={{
                      background: active ? "var(--adm-primary-soft-bg)" : "var(--adm-surface-high)",
                      boxShadow: active ? "var(--adm-locale-glow)" : "none",
                    }}
                  >
                    <div className="text-sm font-semibold" style={{ color: active ? "var(--adm-primary)" : "var(--adm-on-surface)" }}>
                      {opt.label}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--adm-on-variant)" }}>
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: "var(--adm-error)" }}>{error}</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !changed}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: "var(--adm-primary-container)",
                color: "white",
                boxShadow: (!saving && changed) ? "var(--adm-cta-glow-shadow)" : "none",
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
            style={{ color: "var(--adm-on-variant)" }}
          >
            {t("webhook.autoPublishLabel")}
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--adm-on-variant)" }}>
            {hasWebhook
              ? t("webhook.autoPublishDescription")
              : t("webhook.noWebhookConfigured")}
          </p>

          {hasWebhook ? (
            <>
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{
                  background: autoPublish ? "rgba(34, 211, 160, 0.12)" : "var(--adm-surface-highest)",
                  border: autoPublish ? "1px solid rgba(34,211,160,0.2)" : "1px solid var(--adm-border-subtle)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
                  {autoPublish ? t("webhook.autoPublishOn") : t("webhook.autoPublishOff")}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoPublish}
                  onClick={handleAutoPublishToggle}
                  disabled={autoSaving}
                  className="relative w-10 h-5 rounded-full transition-all flex-shrink-0 disabled:opacity-50"
                  style={{ background: autoPublish ? "var(--success)" : "var(--adm-border-subtle)" }}
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
              {autoError && <p className="text-sm mt-2" style={{ color: "var(--adm-error)" }}>{autoError}</p>}
              {autoSaved && (
                <p className="text-xs mt-2 font-medium" style={{ color: "var(--success)" }}>{t("saved")}</p>
              )}
            </>
          ) : (
            <div
              className="px-4 py-3 rounded-xl text-xs"
              style={{
                background: "var(--adm-surface-highest)",
                border: "1px solid var(--adm-border-subtle)",
                color: "var(--adm-on-variant)",
              }}
            >
              {t("webhook.noWebhookConfigured")}
            </div>
          )}
        </div>

        {/* Brand */}
        <div
          className="rounded-xl p-5 space-y-5"
          style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--adm-on-variant)" }}
          >
            {t("brand.title")}
          </p>
          <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
            {t("brand.description")}
          </p>

          <form onSubmit={handleBrandSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>
                {tBrand("companyNameLabel")}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
                className={`${inputClass} px-4 py-3 rounded-xl w-full`}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>
                {tBrand("logoLabel")}
              </label>
              <div
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:border-[var(--adm-primary-container)] hover:bg-[var(--adm-interactive-hover)]"
                style={{ background: "var(--adm-surface-high)", border: "1px dashed var(--adm-border-subtle)" }}
                onClick={() => brandLogoInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
                ) : (
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--adm-on-variant)" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
                    {logoPreview ? tBrand("logoChange") : tBrand("logoUpload")}
                  </p>
                  <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>{tBrand("logoHint")}</p>
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
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>
                {tBrand("colorsLabel")}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)" }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    style={{ background: "transparent" }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--adm-on-surface)" }}>{tBrand("primaryColor")}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--adm-on-variant)" }}>{primaryColor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)" }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    style={{ background: "transparent" }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--adm-on-surface)" }}>{tBrand("secondaryColor")}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--adm-on-variant)" }}>{secondaryColor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)" }}>
                  <input
                    type="color"
                    value={tertiaryColor}
                    onChange={(e) => setTertiaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    style={{ background: "transparent" }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--adm-on-surface)" }}>{tBrand("tertiaryColor")}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--adm-on-variant)" }}>{tertiaryColor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)" }}>
                  <input
                    type="color"
                    value={alternativeColor || "#1e293b"}
                    onChange={(e) => setAlternativeColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    style={{ background: "transparent" }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--adm-on-surface)" }}>Alternative (optional, for cover variety)</p>
                    <p className="text-xs font-mono" style={{ color: "var(--adm-on-variant)" }}>{alternativeColor || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>
                {tBrand("fontStyleLabel")}
              </label>
              <input
                type="text"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                placeholder={tBrand("fontStylePlaceholder")}
                className={`${inputClass} px-4 py-3 rounded-xl w-full`}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--adm-on-variant)" }}>
                {tBrand("brandVoiceLabel")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BRAND_VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setBrandVoice(v.id)}
                    className={
                      "px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left border " +
                      (brandVoice === v.id
                        ? "border-[var(--adm-primary-container)]"
                        : "border-[var(--adm-border-subtle)] hover:border-[var(--adm-outline-variant)] hover:bg-[var(--adm-interactive-hover)]")
                    }
                    style={{
                      background: brandVoice === v.id ? "var(--adm-primary-container)" : "var(--adm-surface-high)",
                      color: brandVoice === v.id ? "white" : "var(--adm-on-surface)",
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {brandError && <p className="text-sm" style={{ color: "var(--adm-error)" }}>{brandError}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={brandSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{
                  background: "var(--adm-primary-container)",
                  color: "white",
                  boxShadow: !brandSaving ? "var(--adm-cta-glow-shadow)" : "none",
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

        {/* Cover references + guidelines (AI banners) */}
        <div
          className="rounded-xl p-5 space-y-5"
          style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--adm-on-variant)" }}
          >
            {t("brandAssets.title")}
          </p>
          <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
            {t("brandAssets.description")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([1, 2, 3] as const).map((slot) => {
              const path =
                slot === 1
                  ? settings.cover_reference_image_1
                  : slot === 2
                    ? settings.cover_reference_image_2
                    : settings.cover_reference_image_3;
              const src = brandAssetUrl(path ?? null);
              return (
                <div key={slot} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
                    {t("brandAssets.referenceSlot", { n: slot })}
                  </p>
                  <div
                    className="aspect-video rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)" }}
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs" style={{ color: "var(--adm-on-variant)" }}>{t("brandAssets.empty")}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={brandAssetsBusy}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("action", "coverRef");
                          fd.append("slot", String(slot));
                          fd.append("file", file);
                          await postBrandAsset(fd);
                        }}
                      />
                      <span
                        className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: "var(--adm-primary-container)", color: "white" }}
                      >
                        {t("brandAssets.upload")}
                      </span>
                    </label>
                    {path && (
                      <button
                        type="button"
                        disabled={brandAssetsBusy}
                        onClick={async () => {
                          const fd = new FormData();
                          fd.append("action", "removeCoverRef");
                          fd.append("slot", String(slot));
                          await postBrandAsset(fd);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
                      >
                        {t("brandAssets.remove")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 pt-2" style={{ borderTop: "1px solid var(--adm-border-subtle)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
              {t("brandAssets.guidelinesTitle")}
            </p>
            <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>{t("brandAssets.guidelinesHint")}</p>
            {settings.brand_guidelines_text?.trim() ? (
              <pre
                className="max-h-40 max-w-full overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words rounded-xl p-3 text-[11px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
              >
                {settings.brand_guidelines_text.slice(0, 2000)}
                {settings.brand_guidelines_text.length > 2000 ? "…" : ""}
              </pre>
            ) : (
              <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>{t("brandAssets.noGuidelines")}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.txt,.md,text/plain,application/pdf"
                  className="hidden"
                  disabled={brandAssetsBusy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("action", "guidelines");
                    fd.append("file", file);
                    await postBrandAsset(fd);
                  }}
                />
                <span
                  className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--adm-primary-container)", color: "white" }}
                >
                  {t("brandAssets.uploadGuidelines")}
                </span>
              </label>
              {settings.brand_guidelines_storage_path && (
                <button
                  type="button"
                  disabled={brandAssetsBusy}
                  onClick={async () => {
                    const fd = new FormData();
                    fd.append("action", "removeGuidelines");
                    await postBrandAsset(fd);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
                >
                  {t("brandAssets.removeGuidelines")}
                </button>
              )}
            </div>
          </div>

          {brandAssetsError && <p className="text-sm" style={{ color: "var(--adm-error)" }}>{brandAssetsError}</p>}
          {brandAssetsSaved && (
            <p className="text-xs font-medium" style={{ color: "var(--success)" }}>{t("saved")}</p>
          )}
        </div>

      </div>
    </div>
  );
}
