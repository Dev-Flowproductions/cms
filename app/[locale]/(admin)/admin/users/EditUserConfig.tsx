"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  getClientSettingsByAdmin,
  updateClientDomainByAdmin,
  updateClientFrequencyByAdmin,
  updateClientBrandByAdmin,
  updateProfileByAdmin,
  updateUserWebhookByAdmin,
  type ClientRow,
  type Frequency,
} from "./actions";

const BRAND_VOICES = [
  { id: "professional", label: "Professional & Authoritative" },
  { id: "friendly", label: "Friendly & Approachable" },
  { id: "innovative", label: "Innovative & Forward-thinking" },
  { id: "luxurious", label: "Luxurious & Premium" },
  { id: "casual", label: "Casual & Conversational" },
] as const;

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  width: "100%",
  outline: "none",
} as const;

type Settings = Awaited<ReturnType<typeof getClientSettingsByAdmin>>;

export function EditUserConfig({
  user,
  onClose,
  onSaved,
}: {
  user: ClientRow;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const t = useTranslations("admin.usersPage");
  const tSettings = useTranslations("settings.frequency");
  const tSettingsMain = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [domain, setDomain] = useState("");
  const [frequency, setFrequency] = useState<Frequency>(user.frequency);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7c5cfc");
  const [secondaryColor, setSecondaryColor] = useState("#22d3a0");
  const [tertiaryColor, setTertiaryColor] = useState("#f59e0b");
  const [fontStyle, setFontStyle] = useState("");
  const [brandVoice, setBrandVoice] = useState("professional");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [autoPublish, setAutoPublish] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getClientSettingsByAdmin(user.user_id).then((data) => {
      if (cancelled) return;
      setSettings(data);
      if (data.client) {
        setDomain(data.client.domain ?? "");
        setCompanyName(data.client.company_name ?? "");
        setLogoUrl(data.client.logo_url ?? "");
        setPrimaryColor(data.client.primary_color ?? "#7c5cfc");
        setSecondaryColor(data.client.secondary_color ?? "#22d3a0");
        setTertiaryColor(data.client.tertiary_color ?? "#f59e0b");
        setFontStyle(data.client.font_style ?? "");
        setBrandVoice(data.client.brand_voice ?? "professional");
        setWebhookUrl(data.client.webhook_url ?? "");
        setWebhookSecret(data.client.webhook_secret ?? "");
        setAutoPublish(data.client.auto_publish ?? false);
      }
      if (data.profile) {
        setDisplayName(data.profile.display_name ?? "");
        setAvatarUrl(data.profile.avatar_url ?? "");
        setBio(data.profile.bio ?? "");
        setJobTitle(data.profile.job_title ?? "");
      }
      setLoading(false);
    }).catch((err) => {
      if (!cancelled) {
        setError(err?.message ?? "Failed to load");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [user.user_id]);

  const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
    { value: "daily", label: tSettings("daily") },
    { value: "weekly", label: tSettings("weekly") },
    { value: "biweekly", label: tSettings("biweekly") },
    { value: "monthly", label: tSettings("monthly") },
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
    onClose();
  }

  if (loading) {
    return (
      <div className="p-4 text-sm" style={{ color: "var(--text-muted)" }}>
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm mb-3" style={{ color: "var(--danger)" }}>{error}</p>
        <button type="button" onClick={onClose} className="text-xs px-3 py-1.5 rounded-xl" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          {tCommon("close")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Full configuration
        </p>
        <button type="button" onClick={onClose} className="text-xs px-3 py-1.5 rounded-xl" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          {tCommon("close")}
        </button>
      </div>

      {/* Domain */}
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Domain</label>
        <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourdomain.com" style={inputStyle} />
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{tSettingsMain("postingFrequency")}</label>
        <div className="flex flex-wrap gap-2">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFrequency(opt.value)}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: frequency === opt.value ? "var(--accent)" : "var(--surface)",
                color: frequency === opt.value ? "white" : "var(--text)",
                border: `1px solid ${frequency === opt.value ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Company name</label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Logo URL</label>
          <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Primary color</label>
          <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Secondary color</label>
          <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Tertiary color</label>
          <input type="text" value={tertiaryColor} onChange={(e) => setTertiaryColor(e.target.value)} placeholder="#f59e0b" style={inputStyle} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Font style</label>
          <input type="text" value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} placeholder="modern" style={inputStyle} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Brand voice</label>
          <div className="flex flex-wrap gap-2">
            {BRAND_VOICES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setBrandVoice(v.id)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
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
      </div>

      {/* Author */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Display name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Avatar URL</label>
          <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Job title</label>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Content Lead" style={inputStyle} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} style={inputStyle} />
        </div>
      </div>

      {/* Webhook */}
      <div className="space-y-3">
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Webhook URL</label>
        <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Webhook secret</label>
        <input type="text" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} style={inputStyle} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="edit_auto_publish" checked={autoPublish} onChange={(e) => setAutoPublish(e.target.checked)} className="rounded" />
          <label htmlFor="edit_auto_publish" className="text-xs" style={{ color: "var(--text)" }}>Auto-publish to webhook</label>
        </div>
      </div>

      {saveError && <p className="text-xs" style={{ color: "var(--danger)" }}>{saveError}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {saving ? t("webhookSaving") : "Save all"}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          {tCommon("cancel")}
        </button>
      </div>
    </div>
  );
}
