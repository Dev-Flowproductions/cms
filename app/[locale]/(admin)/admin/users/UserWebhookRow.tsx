"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { updateUserWebhookByAdmin, type ClientRow } from "./actions";

export function UserWebhookRow({ user }: { user: ClientRow }) {
  const t = useTranslations("admin.usersPage");
  const [webhookUrl, setWebhookUrl] = useState(user.webhook_url ?? "");
  const [webhookSecret, setWebhookSecret] = useState(user.webhook_secret ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWebhookUrl(user.webhook_url ?? "");
    setWebhookSecret(user.webhook_secret ?? "");
  }, [user.user_id, user.webhook_url, user.webhook_secret]);

  const changed =
    (webhookUrl.trim() || null) !== (user.webhook_url ?? null) ||
    (webhookSecret.trim() || null) !== (user.webhook_secret ?? null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateUserWebhookByAdmin(user.user_id, {
      webhook_url: webhookUrl.trim() || null,
      webhook_secret: webhookSecret.trim() || null,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: "var(--adm-on-variant)" }}>
          Webhook URL
        </label>
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://yoursite.com/api/cms-webhook"
          className="w-full px-3 py-2 rounded-lg text-xs font-mono transition-all outline-none"
          style={{
            background: "var(--adm-surface-high)",
            border: "1px solid var(--adm-border-subtle)",
            color: "var(--adm-on-surface)",
          }}
        />
      </div>

      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: "var(--adm-on-variant)" }}>
          {t("webhookSecretLabel")}
        </label>
        <div className="relative">
          <input
            type={showSecret ? "text" : "password"}
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder={t("webhookSecretPlaceholder")}
            className="w-full px-3 py-2 pr-16 rounded-lg text-xs font-mono transition-all outline-none"
            style={{
              background: "var(--adm-surface-high)",
              border: "1px solid var(--adm-border-subtle)",
              color: "var(--adm-on-surface)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowSecret((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
            style={{ color: "var(--adm-on-variant)" }}
          >
            {showSecret ? t("webhookHide") : t("webhookShow")}
          </button>
        </div>
      </div>

      {error && <p className="text-xs" style={{ color: "var(--adm-error)" }}>{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !changed}
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: "var(--adm-primary-container)",
            color: "#fff",
            boxShadow: (!saving && changed) ? "0 0 14px rgba(104, 57, 234, 0.35)" : "none",
          }}
        >
          {saving ? t("webhookSaving") : t("webhookSave")}
        </button>
        {saved && (
          <span className="text-xs font-medium" style={{ color: "#4ade80" }}>
            {t("webhookSaved")}
          </span>
        )}
      </div>
    </div>
  );
}
