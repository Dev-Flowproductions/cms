"use client";

import React, { useState, useTransition } from "react";
import { deleteUser, updateUserWebhookByAdmin, type ClientRow } from "./actions";
import { CreateUserForm } from "./CreateUserForm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  initialUsers: ClientRow[];
  initialError: string | null;
};

function WebhookRow({ user, t }: { user: ClientRow; t: ReturnType<typeof useTranslations> }) {
  const [webhookUrl, setWebhookUrl] = useState(user.webhook_url ?? "");
  const [webhookSecret, setWebhookSecret] = useState(user.webhook_secret ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
          Webhook URL
        </label>
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://yoursite.com/api/cms-webhook"
          className="w-full px-3 py-2 rounded-lg text-xs font-mono transition-all outline-none"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />
      </div>

      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
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
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowSecret((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
            style={{ color: "var(--text-muted)" }}
          >
            {showSecret ? t("webhookHide") : t("webhookShow")}
          </button>
        </div>
      </div>

      {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !changed}
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: "var(--accent)",
            color: "white",
            boxShadow: (!saving && changed) ? "0 0 12px rgba(124,92,252,0.25)" : "none",
          }}
        >
          {saving ? t("webhookSaving") : t("webhookSave")}
        </button>
        {saved && (
          <span className="text-xs font-medium" style={{ color: "var(--success)" }}>
            {t("webhookSaved")}
          </span>
        )}
      </div>
    </div>
  );
}

export function UsersClient({ initialUsers, initialError }: Props) {
  const t = useTranslations("admin.usersPage");
  const tSettings = useTranslations("settings.frequency");
  const tCommon = useTranslations("common");
  const [users, setUsers] = useState<ClientRow[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);
  const router = useRouter();

  const FREQUENCY_LABELS: Record<string, string> = {
    daily: tSettings("daily"),
    weekly: tSettings("weekly"),
    biweekly: tSettings("biweekly"),
    monthly: tSettings("monthly"),
  };

  function handleSuccess() {
    setShowForm(false);
    startTransition(() => { router.refresh(); });
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(t("confirmDelete", { email }))) return;
    setDeletingId(userId);
    setError(null);
    const result = await deleteUser(userId);
    setDeletingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.user_id !== userId));
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--accent)" }}
          >
            Admin
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {t("title")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {t("subtitle")}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: "0 0 20px rgba(124,92,252,0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {t("createAccount")}
          </button>
        )}
      </div>

      {showForm && (
        <CreateUserForm
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(255,92,106,0.08)",
            border: "1px solid rgba(255,92,106,0.25)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
          style={{ border: "1.5px dashed var(--border)", background: "var(--surface)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="8" r="3.5" stroke="var(--accent)" strokeWidth="1.6" />
              <path d="M3 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
            {t("empty")}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t("emptyHint")}
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-x-auto overflow-y-hidden"
          style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  t("colUser"),
                  t("colDomain"),
                  t("colFrequency"),
                  t("colGoogle"),
                  "Brand",
                  t("colWebhook"),
                  t("colCreated"),
                  t("colActions"),
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest ${i === 7 ? "text-right sticky right-0 bg-[var(--surface)] shadow-[-4px_0_8px_rgba(0,0,0,0.06)]" : "text-left"}`}
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const isLast = i === users.length - 1;
                const profileData = Array.isArray(u.profiles) ? u.profiles[0] : u.profiles;
                const displayName = profileData?.display_name;
                const initial = (displayName ?? u.email ?? "?")[0].toUpperCase();
                const isDeleting = deletingId === u.user_id;
                const googleConnected = !!u.google_connected_at;
                const onboardingPending = !u.domain;
                const hasWebhook = !!u.webhook_url;
                const webhookExpanded = expandedWebhook === u.user_id;

                return (
                  <React.Fragment key={u.id}>
                    <tr
                      style={{
                        borderBottom: webhookExpanded ? "none" : (isLast ? "none" : "1px solid var(--border-subtle)"),
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-raised)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                      }}
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                            style={{
                              background: "rgba(124,92,252,0.12)",
                              border: "1px solid rgba(124,92,252,0.2)",
                              color: "var(--accent)",
                            }}
                          >
                            {initial}
                          </span>
                          <div>
                            {displayName && (
                              <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                                {displayName}
                              </div>
                            )}
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="px-6 py-4">
                        {onboardingPending ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: "rgba(245,166,35,0.1)", color: "#f5a623" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#f5a623" }} />
                            {t("onboardingPending")}
                          </span>
                        ) : (
                          <span className="text-xs font-mono" style={{ color: "var(--text)" }}>
                            {u.domain}
                          </span>
                        )}
                      </td>

                      {/* Frequency */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "rgba(124,92,252,0.1)", color: "var(--accent)" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                          {FREQUENCY_LABELS[u.frequency] ?? u.frequency}
                        </span>
                      </td>

                      {/* Google */}
                      <td className="px-6 py-4">
                        {googleConnected ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: "rgba(34,211,160,0.1)", color: "#22d3a0" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22d3a0" }} />
                            {t("googleConnected")}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--text-faint)" }}>—</span>
                        )}
                      </td>

                      {/* Brand (read-only; set by user in onboarding) */}
                      <td className="px-6 py-4">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {u.company_name ?? u.brand_name ?? "—"}
                        </span>
                      </td>

                      {/* Webhook */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setExpandedWebhook(webhookExpanded ? null : u.user_id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                          style={{
                            background: hasWebhook ? "rgba(34,211,160,0.1)" : "var(--surface-raised)",
                            color: hasWebhook ? "#22d3a0" : "var(--text-muted)",
                            border: hasWebhook ? "1px solid rgba(34,211,160,0.25)" : "1px solid var(--border)",
                          }}
                        >
                          {hasWebhook ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22d3a0" }} />
                              {t("webhookConfigured")}
                            </>
                          ) : (
                            <>
                              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              </svg>
                              {t("webhookNotSet")}
                            </>
                          )}
                        </button>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                        {new Date(u.created_at).toLocaleDateString(undefined, {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* Actions — sticky so delete is always visible when table scrolls */}
                      <td
                        className="px-6 py-4 text-right sticky right-0"
                        style={{
                          background: "inherit",
                          boxShadow: "-4px 0 8px rgba(0,0,0,0.06)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleDelete(u.user_id, u.email ?? u.user_id)}
                          disabled={isDeleting || isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                          style={{
                            color: "var(--danger)",
                            background: "rgba(255,92,106,0.08)",
                            border: "1px solid rgba(255,92,106,0.25)",
                          }}
                          onMouseEnter={(e) => {
                            if (!isDeleting && !isPending) {
                              e.currentTarget.style.background = "rgba(255,92,106,0.15)";
                              e.currentTarget.style.borderColor = "var(--danger)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,92,106,0.08)";
                            e.currentTarget.style.borderColor = "rgba(255,92,106,0.25)";
                          }}
                          title={t("confirmDelete", { email: u.email ?? u.user_id })}
                        >
                          {isDeleting ? (
                            "…"
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              {tCommon("delete")}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded webhook editor */}
                    {webhookExpanded && (
                      <tr
                        key={`${u.id}-webhook`}
                        style={{ borderBottom: isLast ? "none" : "1px solid var(--border-subtle)" }}
                      >
                        <td colSpan={8} className="px-8 pb-5 pt-2">
                          <div
                            className="rounded-xl p-4"
                            style={{
                              background: "var(--surface-raised)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                Publishing webhook
                              </p>
                              <button
                                type="button"
                                onClick={() => setExpandedWebhook(null)}
                                className="text-xs"
                                style={{ color: "var(--text-faint)" }}
                              >
                                {t("webhookClose")}
                              </button>
                            </div>
                            <WebhookRow user={u} t={t} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
