"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import {
  deleteUser,
  createClientInstructions,
  updateClientInstructions,
  updateInstructionReinforcementByAdmin,
  type ClientRow,
} from "./actions";
import { EditUserConfig } from "./EditUserConfig";
import { NextPostCountdown } from "@/components/NextPostCountdown";
import type { AdminBlogAuthorRow } from "./actions";

export function UserDetailClient({
  user: initialUser,
  blogAuthors: initialBlogAuthors,
}: {
  user: ClientRow;
  blogAuthors: AdminBlogAuthorRow[];
}) {
  const t = useTranslations("admin.usersPage");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState(initialUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(initialUser);
    setInstructionsEdit(initialUser.custom_instructions ?? "");
    setReinforcementEdit(initialUser.instruction_reinforcement ?? "");
  }, [initialUser]);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [instructionsCreating, setInstructionsCreating] = useState(false);
  const [instructionsSaving, setInstructionsSaving] = useState(false);
  const [instructionsEdit, setInstructionsEdit] = useState(user.custom_instructions ?? "");
  const [instructionsError, setInstructionsError] = useState<string | null>(null);
  const [reinforcementEdit, setReinforcementEdit] = useState(user.instruction_reinforcement ?? "");
  const [reinforcementSaving, setReinforcementSaving] = useState(false);
  const [reinforcementError, setReinforcementError] = useState<string | null>(null);

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
        {!onboardingPending && (
          <div className="mt-4">
            <NextPostCountdown
              lastPostGeneratedAt={user.last_post_generated_at}
              frequency={user.frequency}
              variant="adminDetail"
            />
          </div>
        )}
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
          <p className="text-sm font-medium" title={String(user.last_generation_error)}>
            {t("lastRunFailed")}: {String(user.last_generation_error).slice(0, 200)}
            {String(user.last_generation_error).length > 200 ? "…" : ""}
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
              {instructionsCreating
                ? t("instructionsCreating")
                : user.custom_instructions?.trim()
                  ? t("regenerateInstructions")
                  : t("createInstructions")}
            </button>
          </div>

          {instructionsError && (
            <p className="text-xs" style={{ color: "var(--adm-error)" }}>
              {instructionsError}
            </p>
          )}

          <div className="space-y-4 border-t pt-6" style={{ borderColor: "var(--adm-border-subtle)" }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-primary)" }}>
                {t("clientSpecificInstructionsTitle")}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--adm-on-variant)" }}>
                {t("clientSpecificInstructionsDescription")}
              </p>
            </div>
            {user.custom_instructions?.trim() ? (
              <>
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
                    else refreshUser();
                  }}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: "var(--adm-primary-container)",
                    color: "#fff",
                    boxShadow: "var(--adm-cta-glow-shadow)",
                  }}
                >
                  {instructionsSaving ? t("instructionsSaving") : t("saveClientInstructions")}
                </button>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
                {t("clientSpecificInstructionsEmptyHint")}
              </p>
            )}
          </div>

          <div className="space-y-4 border-t pt-6" style={{ borderColor: "var(--adm-border-subtle)" }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-primary)" }}>
                {t("instructionReinforcementTitle")}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--adm-on-variant)" }}>
                {t("instructionReinforcementDescription")}
              </p>
            </div>
            <textarea
              value={reinforcementEdit}
              onChange={(e) => setReinforcementEdit(e.target.value)}
              rows={10}
              className="adm-input-edge min-h-[160px] w-full resize-y rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--adm-primary-container)]"
              style={{
                background: "var(--adm-surface-highest)",
                color: "var(--adm-on-surface)",
              }}
              placeholder={t("reinforcementPlaceholder")}
            />
            {reinforcementError && (
              <p className="text-xs" style={{ color: "var(--adm-error)" }}>
                {reinforcementError}
              </p>
            )}
            <button
              type="button"
              disabled={reinforcementSaving}
              onClick={async () => {
                setReinforcementSaving(true);
                setReinforcementError(null);
                const result = await updateInstructionReinforcementByAdmin(user.user_id, reinforcementEdit);
                setReinforcementSaving(false);
                if (result.error) setReinforcementError(result.error);
                else refreshUser();
              }}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: "var(--adm-primary-container)",
                color: "#fff",
                boxShadow: "var(--adm-cta-glow-shadow)",
              }}
            >
              {reinforcementSaving ? t("instructionsSaving") : t("saveReinforcement")}
            </button>
          </div>
        </div>
      ) : null}

      <div className={!onboardingPending ? "pt-2" : ""}>
        <EditUserConfig
          user={user}
          blogAuthors={initialBlogAuthors}
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
