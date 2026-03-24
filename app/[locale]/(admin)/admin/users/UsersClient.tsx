"use client";

import React, { useState, useTransition } from "react";
import { deleteUser, updateUserWebhookByAdmin, createClientInstructions, updateClientInstructions, type ClientRow } from "./actions";
import { CreateUserForm } from "./CreateUserForm";
import { EditUserConfig } from "./EditUserConfig";
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
  const [generatingUserId, setGeneratingUserId] = useState<string | null>(null);
  const [instructionsExpandedUserId, setInstructionsExpandedUserId] = useState<string | null>(null);
  const [instructionsCreatingUserId, setInstructionsCreatingUserId] = useState<string | null>(null);
  const [instructionsSavingUserId, setInstructionsSavingUserId] = useState<string | null>(null);
  const [instructionsEditContent, setInstructionsEditContent] = useState<Record<string, string>>({});
  const [instructionsError, setInstructionsError] = useState<string | null>(null);
  const [instructionsErrorUserId, setInstructionsErrorUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);
  const [expandedEditUserId, setExpandedEditUserId] = useState<string | null>(null);
  const router = useRouter();

  const FREQUENCY_LABELS: Record<string, string> = {
    daily: tSettings("daily"),
    weekly: tSettings("weekly"),
    biweekly: tSettings("biweekly"),
    monthly: tSettings("monthly"),
  };

  const FREQUENCY_INTERVAL_MS: Record<string, number> = {
    daily: 1 * 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    biweekly: 14 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  };

  function getNextPostLabel(user: ClientRow): string {
    if (!user.domain) return "—";
    const intervalMs = FREQUENCY_INTERVAL_MS[user.frequency] ?? FREQUENCY_INTERVAL_MS.weekly;
    const lastRun = user.last_post_generated_at ? new Date(user.last_post_generated_at).getTime() : 0;
    const dueInMs = intervalMs - (Date.now() - lastRun);
    if (dueInMs <= 0) return t("nextPostDueNow");
    const days = Math.floor(dueInMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((dueInMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.max(1, Math.floor(dueInMs / 60000));
    if (days >= 1) return days === 1 ? t("nextPostInOneDay") : t("nextPostInDays", { count: days });
    if (hours >= 1) return hours === 1 ? t("nextPostInOneHour") : t("nextPostInHours", { count: hours });
    return minutes === 1 ? t("nextPostInOneMinute") : t("nextPostInMinutes", { count: minutes });
  }

  function isDueNow(user: ClientRow): boolean {
    if (!user.domain) return false;
    const intervalMs = FREQUENCY_INTERVAL_MS[user.frequency] ?? FREQUENCY_INTERVAL_MS.weekly;
    const lastRun = user.last_post_generated_at ? new Date(user.last_post_generated_at).getTime() : 0;
    return intervalMs - (Date.now() - lastRun) <= 0;
  }

  const dueNowCount = users.filter(isDueNow).length;

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

  async function handleGeneratePost(userId: string) {
    setGeneratingUserId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/scheduler?userId=${encodeURIComponent(userId)}&force=true`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Generation failed");
        return;
      }
      const generated = json.results?.find((r: { status: string }) => r.status === "generated");
      if (generated?.post_id) {
        startTransition(() => router.refresh());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setGeneratingUserId(null);
    }
  }

  return (
    <div className="max-w-6xl">
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

      {dueNowCount > 0 && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-3"
          style={{
            background: "rgba(124,92,252,0.08)",
            border: "1px solid rgba(124,92,252,0.25)",
            color: "var(--text)",
          }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
          <span>
            {t("dueNowHint", { count: dueNowCount })}
          </span>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((u) => {
            const accountName = u.company_name ?? u.brand_name ?? null;
            const initial = (accountName ?? u.email ?? "?")[0].toUpperCase();
            const isDeleting = deletingId === u.user_id;
            const googleConnected = !!u.google_connected_at;
            const onboardingPending = !u.domain;
            const hasWebhook = !!u.webhook_url;
            const webhookExpanded = expandedWebhook === u.user_id;

            return (
              <div
                key={u.id}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
              >
                {/* Top bar: identity + Delete */}
                <div
                  className="flex items-center justify-between gap-3 px-4 py-3 flex-shrink-0"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                      style={{
                        background: "rgba(124,92,252,0.12)",
                        border: "1px solid rgba(124,92,252,0.2)",
                        color: "var(--accent)",
                      }}
                    >
                      {initial}
                    </span>
                    <div className="min-w-0">
                      {accountName ? (
                        <div className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>
                          {accountName}
                        </div>
                      ) : null}
                      <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(u.user_id, u.email ?? u.user_id)}
                    disabled={isDeleting || isPending}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
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
                    {isDeleting ? "…" : (
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
                </div>

                {/* Info grid */}
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-faint)" }}>{t("colDomain")}</p>
                    {onboardingPending ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(245,166,35,0.1)", color: "#f5a623" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#f5a623" }} />
                        {t("onboardingPending")}
                      </span>
                    ) : (
                      <span className="font-mono truncate block" style={{ color: "var(--text)" }} title={u.domain ?? undefined}>{u.domain ?? "—"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-faint)" }}>{t("colFrequency")}</p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(124,92,252,0.1)", color: "var(--accent)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                      {FREQUENCY_LABELS[u.frequency] ?? u.frequency}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-faint)" }}>{t("colNextPost")}</p>
                    <span className="font-medium" style={{ color: getNextPostLabel(u) === t("nextPostDueNow") ? "var(--accent)" : "var(--text-muted)" }}>
                      {getNextPostLabel(u)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-faint)" }}>{t("colGoogle")}</p>
                    {googleConnected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(34,211,160,0.1)", color: "#22d3a0" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22d3a0" }} />
                        {t("googleConnected")}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-faint)" }}>—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-faint)" }}>{t("colBrand")}</p>
                    <span className="truncate block" style={{ color: "var(--text-muted)" }}>{u.company_name ?? u.brand_name ?? "—"}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-faint)" }}>{t("colWebhook")}</p>
                    <button
                      type="button"
                      onClick={() => setExpandedWebhook(webhookExpanded ? null : u.user_id)}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all w-fit"
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
                        t("webhookNotSet")
                      )}
                    </button>
                    {u.last_generation_error && (
                      <span className="block text-[10px] font-medium mt-0.5 truncate" style={{ color: "#f59e0b" }} title={u.last_generation_error}>
                        {t("lastRunFailed")}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-faint)" }}>{t("colCreated")}</p>
                    <span style={{ color: "var(--text-muted)" }}>
                      {new Date(u.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {!onboardingPending && (
                  <div className="px-4 pb-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedEditUserId(expandedEditUserId === u.user_id ? null : u.user_id)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: "var(--surface-raised)",
                        color: "var(--accent)",
                        border: "1px solid rgba(124,92,252,0.3)",
                      }}
                    >
                      {expandedEditUserId === u.user_id ? "Hide config" : "Edit full config"}
                    </button>
                    {!u.custom_instructions?.trim() ? (
                      <button
                        type="button"
                        disabled={instructionsCreatingUserId === u.user_id}
                        onClick={async () => {
                          setInstructionsCreatingUserId(u.user_id);
                          setInstructionsError(null);
                          setInstructionsErrorUserId(null);
                          const result = await createClientInstructions(u.user_id);
                          setInstructionsCreatingUserId(null);
                          if (result.error) {
                            setInstructionsError(result.error);
                            setInstructionsErrorUserId(u.user_id);
                          } else {
                            startTransition(() => router.refresh());
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                        style={{
                          background: instructionsCreatingUserId === u.user_id ? "var(--surface-raised)" : "rgba(124,92,252,0.12)",
                          color: instructionsCreatingUserId === u.user_id ? "var(--text-muted)" : "var(--accent)",
                          border: "1px solid rgba(124,92,252,0.35)",
                        }}
                      >
                        {instructionsCreatingUserId === u.user_id ? (
                          <>
                            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                            </svg>
                            {t("instructionsCreating")}
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                            </svg>
                            {t("createInstructions")}
                          </>
                        )}
                      </button>
                    ) : null}
                    {!u.custom_instructions?.trim() && instructionsError && instructionsErrorUserId === u.user_id && (
                      <p className="text-xs px-2" style={{ color: "var(--danger)" }}>{instructionsError}</p>
                    )}
                    {u.custom_instructions?.trim() ? (
                      <button
                        type="button"
                        onClick={() => {
                          setInstructionsExpandedUserId(instructionsExpandedUserId === u.user_id ? null : u.user_id);
                          setInstructionsEditContent((prev) => ({ ...prev, [u.user_id]: u.custom_instructions ?? "" }));
                          setInstructionsError(null);
                          setInstructionsErrorUserId(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: instructionsExpandedUserId === u.user_id ? "var(--surface-raised)" : "rgba(245,158,11,0.12)",
                          color: instructionsExpandedUserId === u.user_id ? "var(--accent)" : "#f59e0b",
                          border: "1px solid rgba(245,158,11,0.35)",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        {instructionsExpandedUserId === u.user_id ? t("instructionsHide") : t("editInstructions")}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleGeneratePost(u.user_id)}
                      disabled={generatingUserId === u.user_id || isPending}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: generatingUserId === u.user_id ? "var(--surface-raised)" : "linear-gradient(135deg, #22d3a0, #34d399)",
                        color: generatingUserId === u.user_id ? "var(--text-muted)" : "var(--bg)",
                        border: generatingUserId === u.user_id ? "1px solid var(--border)" : "none",
                      }}
                    >
                      {generatingUserId === u.user_id ? (
                        <>
                          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                          </svg>
                          {t("generatePostGenerating")}
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          {t("generatePost")}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Expanded full config editor */}
                {expandedEditUserId === u.user_id && (
                  <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="rounded-xl mt-3 overflow-hidden" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <EditUserConfig
                        user={u}
                        onClose={() => setExpandedEditUserId(null)}
                        onSaved={() => startTransition(() => router.refresh())}
                      />
                    </div>
                  </div>
                )}

                {/* Expanded webhook editor */}
                {webhookExpanded && (
                  <div
                    className="px-4 pb-4 pt-0 flex-shrink-0"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Publishing webhook</p>
                        <button type="button" onClick={() => setExpandedWebhook(null)} className="text-xs" style={{ color: "var(--text-faint)" }}>
                          {t("webhookClose")}
                        </button>
                      </div>
                      <WebhookRow user={u} t={t} />
                    </div>
                  </div>
                )}

                {/* Expanded instructions editor */}
                {instructionsExpandedUserId === u.user_id && (
                  <div
                    className="px-4 pb-4 pt-0 flex-shrink-0"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{t("instructionsTitle")}</p>
                        <button type="button" onClick={() => setInstructionsExpandedUserId(null)} className="text-xs" style={{ color: "var(--text-faint)" }}>
                          {t("instructionsClose")}
                        </button>
                      </div>
                      <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{t("instructionsDescription")}</p>
                      <textarea
                        value={instructionsEditContent[u.user_id] ?? u.custom_instructions ?? ""}
                        onChange={(e) => setInstructionsEditContent((prev) => ({ ...prev, [u.user_id]: e.target.value }))}
                        rows={14}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono resize-y transition-all outline-none mb-3"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          minHeight: "200px",
                        }}
                        placeholder={t("instructionsPlaceholder")}
                      />
                      {instructionsError && <p className="text-xs mb-2" style={{ color: "var(--danger)" }}>{instructionsError}</p>}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={instructionsSavingUserId === u.user_id}
                          onClick={async () => {
                            setInstructionsSavingUserId(u.user_id);
                            setInstructionsError(null);
                            const content = instructionsEditContent[u.user_id] ?? u.custom_instructions ?? "";
                            const result = await updateClientInstructions(u.user_id, content);
                            setInstructionsSavingUserId(null);
                            if (result.error) setInstructionsError(result.error);
                            else {
                              startTransition(() => router.refresh());
                              setInstructionsExpandedUserId(null);
                            }
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                          style={{
                            background: "var(--accent)",
                            color: "white",
                          }}
                        >
                          {instructionsSavingUserId === u.user_id ? t("instructionsSaving") : tCommon("save")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
