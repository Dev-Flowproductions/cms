"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateClientFrequency, type Frequency } from "@/app/[locale]/(admin)/admin/users/actions";

type Settings = {
  id: string;
  domain: string;
  ga_api_key: string | null;
  gcc_api_key: string | null;
  frequency: Frequency;
};

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 6)}${"•".repeat(Math.min(key.length - 10, 12))}${key.slice(-4)}`;
}

export function AccountSettingsCard({
  userId,
  settings,
}: {
  userId: string;
  settings: Settings | null;
}) {
  const t = useTranslations("settings");
  const [frequency, setFrequency] = useState<Frequency>(settings?.frequency ?? "weekly");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FREQUENCY_OPTIONS: { value: Frequency; label: string; sublabel: string }[] = [
    { value: "daily",    label: t("frequency.daily"),    sublabel: t("frequency.dailySublabel") },
    { value: "weekly",   label: t("frequency.weekly"),   sublabel: t("frequency.weeklySublabel") },
    { value: "biweekly", label: t("frequency.biweekly"), sublabel: t("frequency.biweeklySublabel") },
    { value: "monthly",  label: t("frequency.monthly"),  sublabel: t("frequency.monthlySublabel") },
  ];

  if (!settings) return null;

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

  const changed = frequency !== settings.frequency;

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
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Read-only API keys */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadOnlyField
            label={t("gaApiKey")}
            value={settings.ga_api_key ? maskKey(settings.ga_api_key) : null}
            notConfiguredLabel={t("notConfigured")}
          />
          <ReadOnlyField
            label={t("gccApiKey")}
            value={settings.gcc_api_key ? maskKey(settings.gcc_api_key) : null}
            notConfiguredLabel={t("notConfigured")}
          />
        </div>

        {/* Frequency */}
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
                    background: active ? "rgba(124,92,252,0.12)" : "var(--surface-raised)",
                    border: active ? "1px solid rgba(124,92,252,0.4)" : "1px solid var(--border)",
                    boxShadow: active ? "0 0 12px rgba(124,92,252,0.1)" : "none",
                  }}
                >
                  <div
                    className="text-sm font-semibold"
                    style={{ color: active ? "var(--accent)" : "var(--text)" }}
                  >
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

        {/* Footer */}
        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        )}
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
            <span className="text-xs font-medium" style={{ color: "var(--success)" }}>
              {t("saved")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  notConfiguredLabel,
}: {
  label: string;
  value: string | null;
  notConfiguredLabel: string;
}) {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <div
        className="px-4 py-2.5 rounded-xl text-xs font-mono"
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          color: value ? "var(--text-muted)" : "var(--text-faint)",
        }}
      >
        {value ?? notConfiguredLabel}
      </div>
    </div>
  );
}
