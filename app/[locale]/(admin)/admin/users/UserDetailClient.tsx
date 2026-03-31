"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import {
  deleteUser,
  createClientInstructions,
  updateClientInstructions,
  type ClientRow,
} from "./actions";
import { EditUserConfig } from "./EditUserConfig";

export function UserDetailClient({ user: initialUser }: { user: ClientRow }) {
  const t = useTranslations("admin.usersPage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState(initialUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(initialUser);
    setInstructionsEdit(initialUser.custom_instructions ?? "");
  }, [initialUser]);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [instructionsCreating, setInstructionsCreating] = useState(false);
  const [instructionsSaving, setInstructionsSaving] = useState(false);
  const [instructionsEdit, setInstructionsEdit] = useState(user.custom_instructions ?? "");
  const [instructionsError, setInstructionsError] = useState<string | null>(null);

  const accountName = user.company_name ?? user.brand_name ?? null;
  const displayTitle = accountName?.trim() || user.email || "—";
  const onboardingPending = !user.domain;

  function refreshUser() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!confirm(t("confirmDelete", { email: user.email ?? user.user_id }))) return;
    setDeleting(true);
    setError(null);
    const result = await deleteUser(user.user_id);
    setDeleting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/users");
  }

  async function handleGeneratePost() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/scheduler?userId=${encodeURIComponent(user.user_id)}&force=true`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Generation failed");
        return;
      }
      refreshUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="w-full max-w-6xl space-y-8">
      <Link
        href="/admin/users"
        className="mb-2 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[color:var(--adm-primary)] hover:underline hover:decoration-2 hover:underline-offset-4"
        style={{ color: "var(--adm-on-variant)" }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("backToUsers")}
      </Link>

      <header>
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: "var(--adm-primary-container)" }}
          >
            {t("userDetailEyebrow")}
          </span>
          <div className="h-px w-12 bg-[var(--adm-outline-variant)]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl" style={{ color: "var(--adm-on-surface)" }}>
          {displayTitle}
        </h1>
        {user.email && (
          <p className="mt-2 font-mono text-sm" style={{ color: "var(--adm-on-variant)" }}>
            {user.email}
          </p>
        )}
        <p className="mt-2 max-w-xl text-base leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
          {t("userDetailSubtitle")}
        </p>
      </header>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "color-mix(in srgb, var(--adm-error) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--adm-error) 35%, transparent)",
            color: "var(--adm-error)",
          }}
        >
          {error}
        </div>
      )}

      {user.last_generation_error && (
        <div
          className="editorial-shell-glass flex items-start gap-3 rounded-xl border px-4 py-3"
          style={{
            background: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.35)",
            color: "#fbbf24",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium" title={user.last_generation_error}>
            {t("lastRunFailed")}: {user.last_generation_error.slice(0, 200)}
            {user.last_generation_error.length > 200 ? "…" : ""}
          </p>
        </div>
      )}

      {!onboardingPending ? (
        <div
          className="rounded-2xl border px-6 py-6 space-y-6"
          style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--adm-on-variant)" }}
          >
            {t("adminActionsTitle")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGeneratePost}
              disabled={generating || isPending}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: generating ? "var(--adm-surface-highest)" : "var(--adm-primary-container)",
                color: generating ? "var(--adm-on-variant)" : "#fff",
                border: generating ? "1px solid var(--adm-border-subtle)" : "none",
                boxShadow: generating ? "none" : "var(--adm-cta-glow-shadow)",
              }}
            >
              {generating ? t("generatePostGenerating") : t("generatePost")}
            </button>
            {!user.custom_instructions?.trim() ? (
              <button
                type="button"
                disabled={instructionsCreating}
                onClick={async () => {
                  setInstructionsCreating(true);
                  setInstructionsError(null);
                  const result = await createClientInstructions(user.user_id);
                  setInstructionsCreating(false);
                  if (result.error) setInstructionsError(result.error);
                  else refreshUser();
                }}
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  background: instructionsCreating ? "var(--adm-surface-highest)" : "var(--adm-primary-soft-bg)",
                  color: instructionsCreating ? "var(--adm-on-variant)" : "var(--adm-primary)",
                  borderColor: "var(--adm-outline-variant)",
                }}
              >
                {instructionsCreating ? t("instructionsCreating") : t("createInstructions")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInstructionsOpen((o) => !o);
                  setInstructionsEdit(user.custom_instructions ?? "");
                  setInstructionsError(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: instructionsOpen ? "var(--adm-surface-highest)" : "rgba(245,158,11,0.12)",
                  color: instructionsOpen ? "var(--adm-primary)" : "#f59e0b",
                  borderColor: "rgba(245,158,11,0.35)",
                }}
              >
                {instructionsOpen ? t("instructionsHide") : t("editInstructions")}
              </button>
            )}
          </div>

          {instructionsError && !user.custom_instructions?.trim() && (
            <p className="text-xs" style={{ color: "var(--adm-error)" }}>
              {instructionsError}
            </p>
          )}

          {instructionsOpen && !!user.custom_instructions?.trim() && (
            <div className="space-y-4 border-t pt-6" style={{ borderColor: "var(--adm-border-subtle)" }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-primary)" }}>
                  {t("instructionsTitle")}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--adm-on-variant)" }}>
                  {t("instructionsDescription")}
                </p>
              </div>
              <textarea
                value={instructionsEdit}
                onChange={(e) => setInstructionsEdit(e.target.value)}
                rows={12}
                className="adm-input-edge min-h-[180px] w-full resize-y rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--adm-primary-container)]"
                style={{
                  background: "var(--adm-surface-highest)",
                  color: "var(--adm-on-surface)",
                }}
                placeholder={t("instructionsPlaceholder")}
              />
              {instructionsError && (
                <p className="text-xs" style={{ color: "var(--adm-error)" }}>
                  {instructionsError}
                </p>
              )}
              <button
                type="button"
                disabled={instructionsSaving}
                onClick={async () => {
                  setInstructionsSaving(true);
                  setInstructionsError(null);
                  const result = await updateClientInstructions(user.user_id, instructionsEdit);
                  setInstructionsSaving(false);
                  if (result.error) setInstructionsError(result.error);
                  else {
                    refreshUser();
                    setInstructionsOpen(false);
                  }
                }}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  background: "var(--adm-primary-container)",
                  color: "#fff",
                  boxShadow: "var(--adm-cta-glow-shadow)",
                }}
              >
                {instructionsSaving ? t("instructionsSaving") : tCommon("save")}
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className={!onboardingPending ? "pt-2" : ""}>
        <EditUserConfig
          user={user}
          onClose={() => router.push("/admin/users")}
          onSaved={() => {
            refreshUser();
          }}
          onAssetsUpdated={() => {
            refreshUser();
          }}
        />
      </div>

      <div
        className="mt-10 min-w-0 max-w-full rounded-2xl border px-6 py-6"
        style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
      >
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--adm-error)" }}
        >
          {t("dangerZone")}
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || isPending}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            color: "var(--adm-error)",
            background: "rgba(255, 180, 171, 0.1)",
            border: "1px solid rgba(255, 180, 171, 0.28)",
          }}
        >
          {deleting ? "…" : t("deleteAccount")}
        </button>
      </div>
    </div>
  );
}
