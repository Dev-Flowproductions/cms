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
  const dividerBeforeConfig =
    !onboardingPending ||
    (instructionsOpen && !!user.custom_instructions?.trim()) ||
    !!(instructionsError && !user.custom_instructions?.trim());

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
    <div className="w-full space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: "var(--adm-on-variant)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("backToUsers")}
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--adm-on-surface)" }}>
          {displayTitle}
        </h1>
        {user.email && (
          <p className="mt-1 text-sm font-mono" style={{ color: "var(--adm-on-variant)" }}>
            {user.email}
          </p>
        )}
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(255, 180, 171, 0.08)",
            border: "1px solid rgba(255, 180, 171, 0.28)",
            color: "var(--adm-error)",
          }}
        >
          {error}
        </div>
      )}

      {user.last_generation_error && (
        <p className="text-xs font-medium" style={{ color: "#f59e0b" }} title={user.last_generation_error}>
          {t("lastRunFailed")}: {user.last_generation_error.slice(0, 160)}{user.last_generation_error.length > 160 ? "…" : ""}
        </p>
      )}

      <div
        className="admin-shell-glass rounded-xl border p-6 space-y-8"
        style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
      >
        {!onboardingPending && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGeneratePost}
            disabled={generating || isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{
              background: generating ? "var(--adm-surface-high)" : "var(--adm-gradient-cta)",
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: instructionsCreating ? "var(--adm-surface-high)" : "var(--adm-primary-soft-bg)",
                color: instructionsCreating ? "var(--adm-on-variant)" : "var(--adm-primary)",
                border: "1px solid var(--adm-outline-variant)",
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: instructionsOpen ? "var(--adm-surface-high)" : "rgba(245,158,11,0.12)",
                color: instructionsOpen ? "var(--adm-primary)" : "#f59e0b",
                border: "1px solid rgba(245,158,11,0.35)",
              }}
            >
              {instructionsOpen ? t("instructionsHide") : t("editInstructions")}
            </button>
          )}
        </div>
        )}

        {instructionsError && !user.custom_instructions?.trim() && (
        <p className="text-xs" style={{ color: "var(--adm-error)" }}>{instructionsError}</p>
        )}

        {instructionsOpen && !!user.custom_instructions?.trim() && (
        <div className="space-y-3 border-t pt-8" style={{ borderColor: "var(--adm-border-subtle)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>{t("instructionsTitle")}</p>
          <p className="text-xs mb-3" style={{ color: "var(--adm-on-variant)" }}>{t("instructionsDescription")}</p>
          <textarea
            value={instructionsEdit}
            onChange={(e) => setInstructionsEdit(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 rounded-lg text-xs font-mono resize-y outline-none mb-3"
            style={{
              background: "var(--adm-surface-highest)",
              border: "1px solid var(--adm-border-subtle)",
              color: "var(--adm-on-surface)",
              minHeight: "180px",
            }}
            placeholder={t("instructionsPlaceholder")}
          />
          {instructionsError && <p className="text-xs mb-2" style={{ color: "var(--adm-error)" }}>{instructionsError}</p>}
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
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
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

        <div
          className={dividerBeforeConfig ? "border-t pt-8" : ""}
          style={dividerBeforeConfig ? { borderColor: "var(--adm-border-subtle)" } : undefined}
        >
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

        <div className="pt-6 border-t" style={{ borderColor: "var(--adm-border-subtle)" }}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            color: "var(--adm-error)",
            background: "rgba(255, 180, 171, 0.1)",
            border: "1px solid rgba(255, 180, 171, 0.25)",
          }}
        >
          {deleting ? "…" : t("deleteAccount")}
        </button>
        </div>
      </div>
    </div>
  );
}
