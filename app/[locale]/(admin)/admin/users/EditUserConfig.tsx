"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  getClientSettingsByAdmin,
  updateClientDomainByAdmin,
  updateClientFrequencyByAdmin,
  updateClientBrandByAdmin,
  updateProfileByAdmin,
  updateUserWebhookByAdmin,
  adminDeleteBlogAuthorForClient,
  type ClientRow,
  type AdminBlogAuthorRow,
} from "./actions";
import { AdminBlogAuthorForm } from "./AdminBlogAuthorForm";
import { type Frequency, normalizeFrequencyForUi } from "@/lib/scheduler/frequency";

const BRAND_VOICES = [
  { id: "professional", label: "Professional & Authoritative" },
  { id: "friendly", label: "Friendly & Approachable" },
  { id: "innovative", label: "Innovative & Forward-thinking" },
  { id: "luxurious", label: "Luxurious & Premium" },
  { id: "casual", label: "Casual & Conversational" },
] as const;

const inputFieldStyle = {
  background: "var(--adm-surface-highest)",
  color: "var(--adm-on-surface)",
} as const;

const inputClass =
  "adm-input-edge w-full text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--adm-primary-container)] focus:ring-offset-0 focus:ring-offset-transparent";

/** Synthetic id: profile byline is edited via the same list UI as `blog_authors` rows */
const PROFILE_AUTHOR_ROW_ID = "__profile";

type Settings = Awaited<ReturnType<typeof getClientSettingsByAdmin>>;

export function EditUserConfig({
  user,
  blogAuthors = [],
  onClose,
  onSaved,
  onAssetsUpdated,
  closeOnSave = false,
}: {
  user: ClientRow;
  /** Extra byline personas (random per post); empty = profile only */
  blogAuthors?: AdminBlogAuthorRow[];
  onClose: () => void;
  onSaved?: () => void;
  onAssetsUpdated?: () => void;
  /** When true, run onClose after a successful save (e.g. modal). Default: stay on page. */
  closeOnSave?: boolean;
}) {
  const t = useTranslations("admin.usersPage");
  const tAuthBlog = useTranslations("admin.usersPage.blogAuthors");
  const tBlogAuthors = useTranslations("dashboard.blogAuthors");
  const tSettings = useTranslations("settings.frequency");
  const tSettingsMain = useTranslations("settings");
  const tBrand = useTranslations("onboarding.brand");
  const tWh = useTranslations("settings.webhook");
  const tAssets = useTranslations("settings.brandAssets");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [domain, setDomain] = useState("");
  const [frequency, setFrequency] = useState<Frequency>(() => normalizeFrequencyForUi(user.frequency));
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7c5cfc");
  const [secondaryColor, setSecondaryColor] = useState("#22d3a0");
  const [tertiaryColor, setTertiaryColor] = useState("#f59e0b");
  const [alternativeColor, setAlternativeColor] = useState("");
  const [fontStyle, setFontStyle] = useState("");
  const [brandVoice, setBrandVoice] = useState("professional");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookEventFormat, setWebhookEventFormat] = useState<"spec" | "legacy">("spec");
  const [autoPublish, setAutoPublish] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [coverRef1, setCoverRef1] = useState<string | null>(null);
  const [coverRef2, setCoverRef2] = useState<string | null>(null);
  const [coverRef3, setCoverRef3] = useState<string | null>(null);
  const [brandGuidelinesText, setBrandGuidelinesText] = useState("");
  const [brandGuidelinesPath, setBrandGuidelinesPath] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [assetBusy, setAssetBusy] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [assetSuccess, setAssetSuccess] = useState<string | null>(null);
  const assetSuccessClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [extraAuthors, setExtraAuthors] = useState<AdminBlogAuthorRow[]>(blogAuthors);
  const [showAddAuthor, setShowAddAuthor] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [expandedAuthorId, setExpandedAuthorId] = useState<string | null>(null);
  const [authorDelPending, startAuthorDel] = useTransition();

  useEffect(() => {
    setExtraAuthors(blogAuthors);
  }, [blogAuthors]);

  function afterBlogAuthorMutation() {
    setShowAddAuthor(false);
    setEditingAuthorId(null);
    setExpandedAuthorId(null);
    onSaved?.();
  }

  useEffect(() => {
    return () => {
      if (assetSuccessClearRef.current) clearTimeout(assetSuccessClearRef.current);
    };
  }, []);

  function scheduleAssetSuccessClear() {
    if (assetSuccessClearRef.current) clearTimeout(assetSuccessClearRef.current);
    assetSuccessClearRef.current = setTimeout(() => {
      setAssetSuccess(null);
      assetSuccessClearRef.current = null;
    }, 6000);
  }

  const supabasePublic = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") : "";
  const brandAssetUrl = (path: string | null | undefined) =>
    path && supabasePublic ? `${supabasePublic}/storage/v1/object/public/brand-assets/${path}` : null;

  function applySettingsData(data: Settings) {
    if (data.client) {
      setDomain(data.client.domain ?? "");
      setCompanyName(data.client.company_name ?? "");
      setLogoUrl(data.client.logo_url ?? "");
      setPrimaryColor(data.client.primary_color ?? "#7c5cfc");
      setSecondaryColor(data.client.secondary_color ?? "#22d3a0");
      setTertiaryColor(data.client.tertiary_color ?? "#f59e0b");
      setAlternativeColor(data.client.alternative_color ?? "");
      setFontStyle(data.client.font_style ?? "");
      setBrandVoice(data.client.brand_voice ?? "professional");
      setWebhookUrl(data.client.webhook_url ?? "");
      setWebhookSecret(data.client.webhook_secret ?? "");
      setWebhookEventFormat((data.client.webhook_event_format === "legacy" ? "legacy" : "spec"));
      setAutoPublish(data.client.auto_publish ?? false);
      setCoverRef1(data.client.cover_reference_image_1 ?? null);
      setCoverRef2(data.client.cover_reference_image_2 ?? null);
      setCoverRef3(data.client.cover_reference_image_3 ?? null);
      setBrandGuidelinesText(data.client.brand_guidelines_text ?? "");
      setBrandGuidelinesPath(data.client.brand_guidelines_storage_path ?? null);
      setFrequency(normalizeFrequencyForUi(data.client.frequency));
    }
    if (data.profile) {
      setDisplayName(data.profile.display_name ?? "");
      setAvatarUrl(data.profile.avatar_url ?? "");
      setBio(data.profile.bio ?? "");
      setJobTitle(data.profile.job_title ?? "");
    }
  }

  useEffect(() => {
    let cancelled = false;
    getClientSettingsByAdmin(user.user_id).then((data) => {
      if (cancelled) return;
      applySettingsData(data);
      setLoading(false);
    }).catch((err) => {
      if (!cancelled) {
        setError(err?.message ?? "Failed to load");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [user.user_id]);

  async function postAdminAsset(formData: FormData, successMessage?: string) {
    setAssetBusy(true);
    setAssetError(null);
    setAssetSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.user_id)}/assets`, {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setAssetError(data.error ?? "Upload failed");
        return false;
      }
      const refreshed = await getClientSettingsByAdmin(user.user_id);
      applySettingsData(refreshed);
      onAssetsUpdated?.();
      if (successMessage) {
        setAssetSuccess(successMessage);
        scheduleAssetSuccessClear();
      }
      return true;
    } catch (e) {
      setAssetError(e instanceof Error ? e.message : "Upload failed");
      return false;
    } finally {
      setAssetBusy(false);
    }
  }

  const FREQUENCY_OPTIONS: { value: Frequency; label: string; sublabel: string }[] = [
    { value: "weekly", label: tSettings("weekly"), sublabel: tSettings("weeklySublabel") },
    { value: "biweekly", label: tSettings("biweekly"), sublabel: tSettings("biweeklySublabel") },
    { value: "monthly", label: tSettings("monthly"), sublabel: tSettings("monthlySublabel") },
  ];

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const normalizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "") || null;

    const results = await Promise.all([
      updateClientDomainByAdmin(user.user_id, domain),
      updateClientFrequencyByAdmin(user.user_id, frequency),
      updateClientBrandByAdmin(user.user_id, {
        company_name: companyName.trim() || null,
        logo_url: logoUrl.trim() || null,
        primary_color: primaryColor || null,
        secondary_color: secondaryColor || null,
        tertiary_color: tertiaryColor || null,
        alternative_color: alternativeColor.trim() || null,
        font_style: fontStyle.trim() || null,
        brand_voice: brandVoice,
      }),
      updateProfileByAdmin(user.user_id, {
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
        job_title: jobTitle.trim() || null,
      }),
      updateUserWebhookByAdmin(user.user_id, {
        webhook_url: webhookUrl.trim() || null,
        webhook_secret: webhookSecret.trim() || null,
        webhook_event_format: webhookEventFormat,
        auto_publish: autoPublish,
      }),
    ]);

    const firstError = results.find((r) => r && "error" in r && r.error);
    setSaving(false);
    if (firstError && "error" in firstError) {
      setSaveError(firstError.error ?? "Save failed");
      return;
    }
    onSaved?.();
    if (closeOnSave) onClose();
  }

  if (loading) {
    return (
      <div
        className="rounded-2xl border px-6 py-16 text-center text-sm"
        style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)", color: "var(--adm-on-variant)" }}
      >
        {tCommon("loading")}
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="rounded-2xl border px-6 py-8"
        style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
      >
        <p className="mb-4 text-sm" style={{ color: "var(--adm-error)" }}>
          {error}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--adm-interactive-hover)]"
          style={{ borderColor: "var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
        >
          {tCommon("close")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="mt-10 min-w-0 max-w-full rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
    >
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: "1px solid var(--adm-border-subtle)" }}
      >
        <div>
          <p
            className="mb-0.5 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--adm-primary)" }}
          >
            {tSettingsMain("account")}
          </p>
          <h2 className="text-base font-bold" style={{ color: "var(--adm-on-surface)" }}>
            {tSettingsMain("title")}
          </h2>
        </div>
      </div>

      <div className="space-y-8 px-6 py-6">
        {/* Website domain */}
        <div
          className="space-y-3 rounded-xl p-5"
          style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
            {tBrand("domainLabel")}
          </p>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            className={`${inputClass} w-full rounded-xl px-4 py-3`}
            style={inputFieldStyle}
          />
        </div>

        {/* Posting frequency */}
        <div
          className="space-y-6 rounded-xl p-5"
          style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tSettingsMain("postingFrequency")}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FREQUENCY_OPTIONS.map((opt) => {
                const active = frequency === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    className={
                      "rounded-xl border px-4 py-3 text-left transition-all " +
                      (active
                        ? "border-[var(--adm-accent-border)]"
                        : "border-[var(--adm-border-subtle)] hover:border-[var(--adm-outline-variant)] hover:bg-[var(--adm-interactive-hover)]")
                    }
                    style={{
                      background: active ? "var(--adm-primary-soft-bg)" : "var(--adm-surface-high)",
                      boxShadow: active ? "var(--adm-locale-glow)" : "none",
                    }}
                  >
                    <div
                      className="text-sm font-semibold"
                      style={{ color: active ? "var(--adm-primary)" : "var(--adm-on-surface)" }}
                    >
                      {opt.label}
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: "var(--adm-on-variant)" }}>
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Brand */}
        <div
          className="space-y-5 rounded-xl p-5"
          style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
            {tSettingsMain("brand.title")}
          </p>
          <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
            {tSettingsMain("brand.description")}
          </p>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tBrand("companyNameLabel")}
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`${inputClass} w-full rounded-xl px-4 py-3`}
              style={inputFieldStyle}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tBrand("logoLabel")} (URL)
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className={`${inputClass} w-full rounded-xl px-4 py-3`}
              style={inputFieldStyle}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tBrand("colorsLabel")}
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: tBrand("primaryColor"), hex: primaryColor, setHex: setPrimaryColor, fallback: "#7c5cfc" },
                { label: tBrand("secondaryColor"), hex: secondaryColor, setHex: setSecondaryColor, fallback: "#22d3a0" },
                { label: tBrand("tertiaryColor"), hex: tertiaryColor, setHex: setTertiaryColor, fallback: "#f59e0b" },
                {
                  label: "Alternative (optional, for cover variety)",
                  hex: alternativeColor,
                  setHex: setAlternativeColor,
                  fallback: "#1e293b",
                  optional: true,
                },
              ].map((row) => {
                const raw = (row.hex ?? "").trim();
                const pickerValue = /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw.slice(0, 7) : row.fallback;
                return (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 rounded-xl border p-3"
                    style={{ background: "var(--adm-surface-high)", borderColor: "var(--adm-border-subtle)" }}
                  >
                    <input
                      type="color"
                      value={pickerValue}
                      onChange={(e) => row.setHex(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium" style={{ color: "var(--adm-on-surface)" }}>
                        {row.label}
                      </p>
                      <input
                        type="text"
                        value={row.hex}
                        onChange={(e) => row.setHex(e.target.value)}
                        placeholder={"optional" in row && row.optional ? "—" : undefined}
                        className="mt-0.5 w-full bg-transparent font-mono text-xs outline-none"
                        style={{ color: "var(--adm-on-variant)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tBrand("fontStyleLabel")}
            </label>
            <input
              type="text"
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              placeholder={tBrand("fontStylePlaceholder")}
              className={`${inputClass} w-full rounded-xl px-4 py-3`}
              style={inputFieldStyle}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tBrand("brandVoiceLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BRAND_VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setBrandVoice(v.id)}
                  className={
                    "rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all " +
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
        </div>

        {/* Branding file uploads */}
        <div
          className="space-y-5 rounded-xl border p-5"
          style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-highest)" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {t("configAssets.brandingTitle")}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--adm-on-variant)" }}>
              {t("configAssets.brandingHint")}
            </p>
          </div>
        <div className="flex flex-wrap items-start gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: "var(--adm-on-surface)" }}>{t("configAssets.logoFile")}</p>
            {logoUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-14 w-auto max-w-[160px] object-contain rounded-lg border" style={{ borderColor: "var(--adm-border-subtle)" }} />
            ) : (
              <p className="text-[11px]" style={{ color: "var(--adm-on-variant)" }}>{t("configAssets.noneYet")}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={assetBusy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("action", "logo");
                    fd.append("file", file);
                    await postAdminAsset(fd, t("configAssets.uploadSaved"));
                  }}
                />
                <span
                  className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--adm-primary-container)", color: "#fff" }}
                >
                  {t("configAssets.upload")}
                </span>
              </label>
              {logoUrl?.trim() && (
                <button
                  type="button"
                  disabled={assetBusy}
                  onClick={async () => {
                    const fd = new FormData();
                    fd.append("action", "removeLogo");
                    await postAdminAsset(fd, t("configAssets.removeSaved"));
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
                >
                  {t("configAssets.remove")}
                </button>
              )}
            </div>
          </div>
          <div className="space-y-3 min-w-[200px] flex-1 min-h-0">
            <p className="text-xs font-medium" style={{ color: "var(--adm-on-surface)" }}>{t("configAssets.guidelinesTitle")}</p>
            <p className="text-[11px]" style={{ color: "var(--adm-on-variant)" }}>{t("configAssets.guidelinesHint")}</p>
            {brandGuidelinesText?.trim() ? (
              <pre
                className="min-h-[12rem] max-h-[min(65vh,32rem)] max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-xl p-4 text-xs leading-relaxed"
                style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
              >
                {brandGuidelinesText}
              </pre>
            ) : (
              <p className="text-[11px]" style={{ color: "var(--adm-on-variant)" }}>{t("configAssets.noGuidelines")}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.markdown,.text,text/plain,text/markdown,application/pdf,application/x-pdf,application/octet-stream"
                  className="hidden"
                  disabled={assetBusy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("action", "guidelines");
                    fd.append("file", file);
                    await postAdminAsset(fd, t("configAssets.guidelinesUploadSaved"));
                  }}
                />
                <span
                  className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--adm-primary-container)", color: "#fff" }}
                >
                  {t("configAssets.uploadGuidelines")}
                </span>
              </label>
              {brandGuidelinesPath && (
                <button
                  type="button"
                  disabled={assetBusy}
                  onClick={async () => {
                    const fd = new FormData();
                    fd.append("action", "removeGuidelines");
                    await postAdminAsset(fd, t("configAssets.removeSaved"));
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
                >
                  {t("configAssets.removeGuidelines")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {(assetSuccess || assetError) && (
        <div
          className="rounded-lg px-3 py-2 text-xs font-medium"
          style={{
            background: assetError ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.1)",
            border: `1px solid ${assetError ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.3)"}`,
            color: assetError ? "var(--adm-error)" : "#166534",
          }}
          role="status"
        >
          {assetError ?? assetSuccess}
        </div>
      )}

        {/* Blog authors (profile + blog_authors rows — same list UI) */}
        <div
          className="space-y-5 rounded-xl border p-5"
          style={{ background: "var(--adm-surface-highest)", borderColor: "var(--adm-border-subtle)" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tAuthBlog("authorSectionTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
              {tAuthBlog("authorSectionIntro")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAddAuthor(true);
                  setEditingAuthorId(null);
                  setExpandedAuthorId(null);
                }}
                className="inline-flex shrink-0 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: "var(--adm-primary-container)", boxShadow: "var(--adm-cta-glow-shadow)" }}
              >
                {tAuthBlog("addAuthor")}
              </button>
            </div>

            {showAddAuthor && (
              <AdminBlogAuthorForm
                clientUserId={user.user_id}
                onDone={afterBlogAuthorMutation}
                onCancel={() => setShowAddAuthor(false)}
              />
            )}

            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tAuthBlog("authorListHeading", { count: 1 + extraAuthors.length })}
            </p>
            {extraAuthors.length === 0 && !showAddAuthor ? (
              <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
                {tAuthBlog("noExtraAuthors")}
              </p>
            ) : null}
            <ul className="space-y-3">
              <li key={PROFILE_AUTHOR_ROW_ID}>
                {editingAuthorId === PROFILE_AUTHOR_ROW_ID ? (
                  <div
                    className="rounded-xl border p-4"
                    style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
                  >
                    <p className="mb-4 text-xs leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
                      {tAuthBlog("profileSaveHint")}
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
                          {tBlogAuthors("displayName")}
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className={`${inputClass} w-full rounded-xl px-4 py-3`}
                          style={inputFieldStyle}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
                          {tBlogAuthors("avatarUrl")}
                        </label>
                        <input
                          type="text"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className={`${inputClass} w-full rounded-xl px-4 py-3`}
                          style={inputFieldStyle}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          {avatarUrl?.trim() ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full border object-cover" style={{ borderColor: "var(--adm-border-subtle)" }} />
                          ) : null}
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="hidden"
                              disabled={assetBusy}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (!file) return;
                                const fd = new FormData();
                                fd.append("action", "avatar");
                                fd.append("file", file);
                                await postAdminAsset(fd, t("configAssets.uploadSaved"));
                              }}
                            />
                            <span
                              className="inline-block rounded-lg px-3 py-1.5 text-xs font-semibold"
                              style={{ background: "var(--adm-surface-highest)", border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-surface)" }}
                            >
                              {t("configAssets.uploadAvatar")}
                            </span>
                          </label>
                          {avatarUrl?.trim() ? (
                            <button
                              type="button"
                              disabled={assetBusy}
                              onClick={async () => {
                                const fd = new FormData();
                                fd.append("action", "removeAvatar");
                                await postAdminAsset(fd, t("configAssets.removeSaved"));
                              }}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                              style={{ border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
                            >
                              {t("configAssets.removeAvatar")}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
                          {tBlogAuthors("jobTitle")}
                        </label>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className={`${inputClass} w-full rounded-xl px-4 py-3`}
                          style={inputFieldStyle}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
                          {tBlogAuthors("bio")}
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          className={`${inputClass} w-full rounded-xl px-4 py-3`}
                          style={inputFieldStyle}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setEditingAuthorId(null)}
                        className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
                        style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-on-variant)" }}
                      >
                        {tBlogAuthors("cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="overflow-hidden rounded-xl border"
                    style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--adm-interactive-hover)]"
                      aria-expanded={expandedAuthorId === PROFILE_AUTHOR_ROW_ID}
                      onClick={() =>
                        setExpandedAuthorId((id) =>
                          id === PROFILE_AUTHOR_ROW_ID ? null : PROFILE_AUTHOR_ROW_ID
                        )
                      }
                    >
                      <span className="min-w-0 font-semibold" style={{ color: "var(--adm-on-surface)" }}>
                        {displayName.trim() || tBlogAuthors("unnamedAuthor")}
                      </span>
                      <svg
                        className={`h-4 w-4 shrink-0 transition-transform ${expandedAuthorId === PROFILE_AUTHOR_ROW_ID ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        style={{ color: "var(--adm-on-variant)" }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {expandedAuthorId === PROFILE_AUTHOR_ROW_ID && (
                      <div
                        className="space-y-3 border-t px-4 py-4"
                        style={{ borderColor: "var(--adm-border-subtle)" }}
                      >
                        <div className="flex flex-wrap items-start gap-3">
                          {avatarUrl?.trim() ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatarUrl}
                              alt=""
                              className="h-14 w-14 shrink-0 rounded-full border object-cover"
                              style={{ borderColor: "var(--adm-border-subtle)" }}
                            />
                          ) : null}
                          <div className="min-w-0 flex-1 space-y-2">
                            {jobTitle.trim() ? (
                              <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
                                {jobTitle}
                              </p>
                            ) : null}
                            {avatarUrl?.trim() ? (
                              <p className="break-all font-mono text-[11px]" style={{ color: "var(--adm-on-variant)" }}>
                                {avatarUrl}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        {bio.trim() ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--adm-on-surface)" }}>
                            {bio}
                          </p>
                        ) : (
                          <p className="text-sm italic" style={{ color: "var(--adm-on-variant)" }}>
                            {tBlogAuthors("noBio")}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAuthorId(PROFILE_AUTHOR_ROW_ID);
                              setExpandedAuthorId(null);
                              setShowAddAuthor(false);
                            }}
                            className="rounded-xl border px-4 py-2 text-xs font-semibold"
                            style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-primary)" }}
                          >
                            {tBlogAuthors("edit")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
              {extraAuthors.map((a) => (
                <li key={a.id}>
                  {editingAuthorId === a.id ? (
                    <AdminBlogAuthorForm
                      clientUserId={user.user_id}
                      author={a}
                      onDone={afterBlogAuthorMutation}
                      onCancel={() => setEditingAuthorId(null)}
                    />
                  ) : (
                    <div
                      className="overflow-hidden rounded-xl border"
                      style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--adm-interactive-hover)]"
                        aria-expanded={expandedAuthorId === a.id}
                        onClick={() =>
                          setExpandedAuthorId((id) => (id === a.id ? null : a.id))
                        }
                      >
                        <span className="min-w-0 font-semibold" style={{ color: "var(--adm-on-surface)" }}>
                          {a.display_name}
                        </span>
                        <svg
                          className={`h-4 w-4 shrink-0 transition-transform ${expandedAuthorId === a.id ? "rotate-180" : ""}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                          style={{ color: "var(--adm-on-variant)" }}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {expandedAuthorId === a.id && (
                        <div
                          className="space-y-3 border-t px-4 py-4"
                          style={{ borderColor: "var(--adm-border-subtle)" }}
                        >
                          <div className="flex flex-wrap items-start gap-3">
                            {a.avatar_url?.trim() ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.avatar_url}
                                alt=""
                                className="h-14 w-14 shrink-0 rounded-full object-cover border"
                                style={{ borderColor: "var(--adm-border-subtle)" }}
                              />
                            ) : null}
                            <div className="min-w-0 flex-1 space-y-2">
                              {a.job_title?.trim() ? (
                                <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
                                  {a.job_title}
                                </p>
                              ) : null}
                              {a.avatar_url?.trim() ? (
                                <p className="break-all font-mono text-[11px]" style={{ color: "var(--adm-on-variant)" }}>
                                  {a.avatar_url}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          {a.bio?.trim() ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--adm-on-surface)" }}>
                              {a.bio}
                            </p>
                          ) : (
                            <p className="text-sm italic" style={{ color: "var(--adm-on-variant)" }}>
                              {tBlogAuthors("noBio")}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAuthorId(a.id);
                                setShowAddAuthor(false);
                                setExpandedAuthorId(null);
                              }}
                              className="rounded-xl border px-4 py-2 text-xs font-semibold"
                              style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-primary)" }}
                            >
                              {tBlogAuthors("edit")}
                            </button>
                            <button
                              type="button"
                              disabled={authorDelPending}
                              onClick={() => {
                                if (!confirm(tAuthBlog("confirmDelete", { name: a.display_name }))) return;
                                startAuthorDel(async () => {
                                  const res = await adminDeleteBlogAuthorForClient(user.user_id, a.id);
                                  if ("error" in res && res.error) alert(res.error);
                                  else afterBlogAuthorMutation();
                                });
                              }}
                              className="rounded-xl border px-4 py-2 text-xs font-semibold disabled:opacity-50"
                              style={{
                                borderColor: "rgba(255, 180, 171, 0.35)",
                                color: "var(--adm-error)",
                              }}
                            >
                              {tBlogAuthors("delete")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cover references */}
        <div
          className="space-y-5 rounded-xl border p-5"
          style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-highest)" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tAssets("title")}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--adm-on-variant)" }}>{tAssets("description")}</p>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([1, 2, 3] as const).map((slot) => {
            const path = slot === 1 ? coverRef1 : slot === 2 ? coverRef2 : coverRef3;
            const src = brandAssetUrl(path);
            return (
              <div key={slot} className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
                  {tAssets("referenceSlot", { n: slot })}
                </p>
                <div
                  className="flex aspect-video items-center justify-center overflow-hidden rounded-xl"
                  style={{ background: "var(--adm-surface-high)", border: "1px solid var(--adm-border-subtle)" }}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs" style={{ color: "var(--adm-on-variant)" }}>{tAssets("empty")}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={assetBusy}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("action", "coverRef");
                        fd.append("slot", String(slot));
                        fd.append("file", file);
                        await postAdminAsset(fd, t("configAssets.uploadSaved"));
                      }}
                    />
                    <span
                      className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "var(--adm-primary-container)", color: "#fff" }}
                    >
                      {t("configAssets.upload")}
                    </span>
                  </label>
                  {path && (
                    <button
                      type="button"
                      disabled={assetBusy}
                      onClick={async () => {
                        const fd = new FormData();
                        fd.append("action", "removeCoverRef");
                        fd.append("slot", String(slot));
                        await postAdminAsset(fd, t("configAssets.removeSaved"));
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ border: "1px solid var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
                    >
                      {t("configAssets.remove")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

        {/* Webhook & auto-publish */}
        <div
          className="space-y-5 rounded-xl border p-5"
          style={{ background: "var(--adm-surface-highest)", borderColor: "var(--adm-border-subtle)" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tWh("title")}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--adm-on-variant)" }}>{tWh("description")}</p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tWh("urlLabel")}
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://..."
              className={`${inputClass} w-full rounded-xl px-4 py-3`}
              style={inputFieldStyle}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {tWh("secretLabel")}
            </label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder={tWh("secretPlaceholder")}
              className={`${inputClass} w-full rounded-xl px-4 py-3`}
              style={inputFieldStyle}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              Event format
            </label>
            <select
              value={webhookEventFormat}
              onChange={(e) => setWebhookEventFormat(e.target.value as "spec" | "legacy")}
              className={`${inputClass} w-full rounded-xl px-4 py-3`}
              style={inputFieldStyle}
            >
              <option value="spec">post.published (standard)</option>
              <option value="legacy">cms.post.published (legacy)</option>
            </select>
            <p className="mt-1 text-xs" style={{ color: "var(--adm-on-variant)" }}>
              Use legacy if your site expects cms.post.published
            </p>
          </div>
          <div
            className="flex items-center justify-between rounded-xl border px-4 py-3"
            style={{
              background: autoPublish ? "rgba(34, 211, 160, 0.12)" : "var(--adm-surface-high)",
              borderColor: autoPublish ? "rgba(34,211,160,0.2)" : "var(--adm-border-subtle)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--adm-on-surface)" }}>
              {autoPublish ? tWh("autoPublishOn") : tWh("autoPublishOff")}
            </p>
            <button
              type="button"
              role="switch"
              aria-checked={autoPublish}
              onClick={() => setAutoPublish((v) => !v)}
              className="relative h-5 w-10 flex-shrink-0 rounded-full transition-all"
              style={{ background: autoPublish ? "var(--success)" : "var(--adm-border-subtle)" }}
            >
              <span
                className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-transform"
                style={{
                  background: "white",
                  transform: autoPublish ? "translateX(20px)" : "translateX(0)",
                }}
              />
            </button>
          </div>
        </div>

        {saveError && (
          <p className="text-sm" style={{ color: "var(--adm-error)" }}>
            {saveError}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: "var(--adm-primary-container)",
              color: "#fff",
              boxShadow: saving ? "none" : "var(--adm-cta-glow-shadow)",
            }}
          >
            {saving ? tSettingsMain("saving") : t("saveAllChanges")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--adm-interactive-hover)]"
            style={{ borderColor: "var(--adm-border-subtle)", color: "var(--adm-on-variant)" }}
          >
            {tCommon("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
