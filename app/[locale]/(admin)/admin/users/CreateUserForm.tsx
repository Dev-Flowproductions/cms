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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
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
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        style={inputBase}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
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

  const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
    { value: "daily",    label: tSettings("frequency.daily") },
    { value: "weekly",   label: tSettings("frequency.weekly") },
    { value: "biweekly", label: tSettings("frequency.biweekly") },
    { value: "monthly",  label: tSettings("frequency.monthly") },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    setError(null);
    const fd = new FormData(formRef.current);
    fd.set("frequency", frequency);
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
        {/* Credentials + profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label={tCommon("email")} name="email" type="email" required placeholder={t("createForm.emailPlaceholder")} />
          <Field label={tCommon("password")} name="password" type="password" required placeholder={t("createForm.passwordPlaceholder")} />
          <Field label={t("createForm.displayName")} name="display_name" placeholder={t("createForm.displayNamePlaceholder")} />
          <Field label={t("createForm.domain")} name="domain" required placeholder={t("createForm.domainPlaceholder")} />
        </div>

        {/* API keys */}
        <div
          className="rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
          style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--text-faint)" }}
            >
              {t("createForm.integrations")}
            </p>
            <div className="space-y-3">
              <Field label={tSettings("gaApiKey")} name="ga_api_key" placeholder={t("createForm.apiKeyPlaceholder")} />
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <div className="space-y-3">
              <Field label={tSettings("gccApiKey")} name="gcc_api_key" placeholder={t("createForm.apiKeyPlaceholder")} />
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
