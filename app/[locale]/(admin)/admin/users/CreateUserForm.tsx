"use client";

import { useState, useRef } from "react";
import { createUser } from "./actions";
import { useTranslations } from "next-intl";

type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

const inputBase: React.CSSProperties = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "13px",
  width: "100%",
  outline: "none",
};

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
}) {
  const inputProps = {
    id: name,
    name,
    required,
    placeholder,
    autoComplete: "off" as const,
    style: inputBase,
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--accent)";
      e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.boxShadow = "none";
    },
  };
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      {textarea ? (
        <textarea {...inputProps} rows={3} />
      ) : (
        <input {...inputProps} type={type} />
      )}
    </div>
  );
}

type Props = { onSuccess: () => void; onCancel: () => void };

export function CreateUserForm({ onSuccess, onCancel }: Props) {
  const t = useTranslations("admin.usersPage");
  const tSettings = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const formRef = useRef<HTMLFormElement>(null);

  const [brandVoice, setBrandVoice] = useState("professional");
  const [autoPublish, setAutoPublish] = useState(false);

  const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
    { value: "daily",    label: tSettings("frequency.daily") },
    { value: "weekly",   label: tSettings("frequency.weekly") },
    { value: "biweekly", label: tSettings("frequency.biweekly") },
    { value: "monthly",  label: tSettings("frequency.monthly") },
  ];

  const BRAND_VOICES = [
    { id: "professional", label: "Professional & Authoritative" },
    { id: "friendly", label: "Friendly & Approachable" },
    { id: "innovative", label: "Innovative & Forward-thinking" },
    { id: "luxurious", label: "Luxurious & Premium" },
    { id: "casual", label: "Casual & Conversational" },
  ] as const;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    setError(null);
    const fd = new FormData(formRef.current);
    fd.set("frequency", frequency);
    fd.set("brand_voice", brandVoice);
    fd.set("auto_publish", autoPublish ? "on" : "off");
    const result = await createUser(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <div
      className="rounded-2xl p-6 mb-8"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: "var(--accent)" }}
          >
            {t("createForm.eyebrow")}
          </p>
          <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>
            {t("createForm.title")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs px-3 py-1.5 rounded-xl transition-all"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          {tCommon("cancel")}
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label={tCommon("email")} name="email" type="email" required placeholder={t("createForm.emailPlaceholder")} />
          <Field label={tCommon("password")} name="password" type="password" required placeholder={t("createForm.passwordPlaceholder")} />
          <Field label={t("createForm.displayName")} name="display_name" placeholder={t("createForm.displayNamePlaceholder")} />
        </div>

        {/* Author (shown on blog posts) */}
        <div className="mb-6 rounded-xl p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Author (for blog posts)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Avatar URL" name="avatar_url" type="text" placeholder="https://..." />
            <Field label="Job title" name="job_title" placeholder="e.g. Content Lead" />
            <div className="sm:col-span-2">
              <Field label="Short bio" name="bio" placeholder="One line shown under author name" textarea />
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-6">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            {tSettings("postingFrequency")} <span style={{ color: "var(--accent)" }}>*</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => {
              const active = frequency === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value)}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: active ? "rgba(124,92,252,0.12)" : "var(--surface-raised)",
                    border: active ? "1px solid rgba(124,92,252,0.4)" : "1px solid var(--border)",
                    color: active ? "var(--accent)" : "var(--text-muted)",
                    boxShadow: active ? "0 0 12px rgba(124,92,252,0.1)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Domain */}
        <div className="mb-6">
          <Field label="Website domain" name="domain" type="text" placeholder="yourdomain.com" />
        </div>

        {/* Brand */}
        <div className="mb-6 rounded-xl p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Brand
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company name" name="company_name" placeholder="Your Company" />
            <Field label="Logo URL" name="logo_url" type="text" placeholder="https://..." />
            <Field label="Primary color" name="primary_color" type="text" placeholder="#7c5cfc" />
            <Field label="Secondary color" name="secondary_color" type="text" placeholder="#22d3a0" />
            <Field label="Tertiary color" name="tertiary_color" type="text" placeholder="#f59e0b" />
            <Field label="Alternative color (optional, for cover variety)" name="alternative_color" type="text" placeholder="#1e293b" />
            <Field label="Font style" name="font_style" placeholder="modern" />
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Brand voice</p>
              <div className="flex flex-wrap gap-2">
                {BRAND_VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setBrandVoice(v.id)}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
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
        </div>

        {/* Webhook & auto-publish */}
        <div className="mb-6 rounded-xl p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Publishing
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Webhook URL" name="webhook_url" type="text" placeholder="https://yoursite.com/api/cms-webhook" />
            <Field label="Webhook secret" name="webhook_secret" type="text" placeholder="Optional" />
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_publish"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="auto_publish" className="text-sm" style={{ color: "var(--text)" }}>
                Auto-publish (send new posts to webhook when generated)
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(255,92,106,0.08)",
              border: "1px solid rgba(255,92,106,0.25)",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: loading ? "none" : "0 0 20px rgba(124,92,252,0.3)",
            }}
          >
            {loading ? t("creating") : t("createAccount")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            {tCommon("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
