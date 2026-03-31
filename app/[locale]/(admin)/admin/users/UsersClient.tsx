"use client";

import React, { useState, useTransition } from "react";
import { deleteUser, type ClientRow } from "./actions";
import { CreateUserForm } from "./CreateUserForm";
import { Link, useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";

type Props = {
  initialUsers: ClientRow[];
  initialError: string | null;
};

export function UsersClient({ initialUsers, initialError }: Props) {
  const t = useTranslations("admin.usersPage");
  const tCommon = useTranslations("common");
  const [users, setUsers] = useState<ClientRow[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const FREQUENCY_INTERVAL_MS: Record<string, number> = {
    daily: 1 * 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    biweekly: 14 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  };

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

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--adm-primary)" }}
          >
            Admin
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--adm-on-surface)" }}>
            {t("title")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--adm-on-variant)" }}>
            {t("subtitle")}
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--adm-primary-container)",
              color: "#fff",
              boxShadow: "0 0 14px rgba(104, 57, 234, 0.35)",
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
            background: "rgba(255, 180, 171, 0.08)",
            border: "1px solid rgba(255, 180, 171, 0.28)",
            color: "var(--adm-error)",
          }}
        >
          {error}
        </div>
      )}

      {dueNowCount > 0 && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-3"
          style={{
            background: "rgba(104, 57, 234, 0.08)",
            border: "1px solid rgba(104, 57, 234, 0.25)",
            color: "var(--adm-on-surface)",
          }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--adm-primary)" }} />
          <span>
            {t("dueNowHint", { count: dueNowCount })}
          </span>
        </div>
      )}

      {users.length === 0 ? (
        <div
          className="admin-shell-glass flex flex-col items-center justify-center py-20 rounded-2xl text-center"
          style={{ border: "1.5px dashed var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(104, 57, 234, 0.1)", border: "1px solid rgba(104, 57, 234, 0.22)" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="8" r="3.5" stroke="var(--adm-primary)" strokeWidth="1.6" />
              <path d="M3 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="var(--adm-primary)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--adm-on-surface)" }}>
            {t("empty")}
          </p>
          <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
            {t("emptyHint")}
          </p>
        </div>
      ) : (
        <div
          className="admin-shell-glass overflow-x-hidden rounded-2xl border"
          style={{ borderColor: "var(--adm-border-subtle)" }}
        >
          <table className="w-full min-w-0 table-fixed text-sm">
            <thead>
              <tr style={{ background: "var(--adm-surface-high)", borderBottom: "1px solid var(--adm-border-subtle)" }}>
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {t("colUser")}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest w-[1%] whitespace-nowrap"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {t("colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const accountName = u.company_name ?? u.brand_name ?? null;
                const displayName = accountName?.trim() || u.email || "—";
                const isDeleting = deletingId === u.user_id;
                const googleConnected = !!u.google_connected_at;

                return (
                  <tr
                    key={u.id}
                    className="adm-row-hover"
                    style={{
                      background: idx % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderTop: "1px solid var(--adm-border-subtle)",
                    }}
                  >
                    <td className="px-4 py-3 align-top min-w-0">
                      <Link
                        href={`/admin/users/${u.user_id}`}
                        className="group block min-w-0 rounded-lg -mx-1 px-1 py-0.5 -my-0.5 transition-colors hover:bg-[var(--adm-interactive-hover-strong)]"
                      >
                        <span className="font-semibold block truncate group-hover:underline" style={{ color: "var(--adm-on-surface)" }} title={displayName}>
                          {displayName}
                        </span>
                        {u.email && (
                          <span className="text-xs block truncate mt-0.5" style={{ color: "var(--adm-on-variant)" }} title={u.email}>
                            {u.email}
                          </span>
                        )}
                        <span className="text-[11px] font-mono block truncate mt-1 opacity-90" style={{ color: "var(--adm-on-variant)" }} title={u.domain ?? undefined}>
                          {u.domain ?? t("onboardingPending")}
                        </span>
                        {googleConnected && (
                          <span className="text-[10px] font-bold uppercase mt-1 inline-block" style={{ color: "#22d3a0" }}>
                            {t("googleConnected")}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right align-middle w-[140px] sm:w-[200px]">
                      <div className="flex flex-col items-stretch justify-end gap-2">
                        <Link
                          href={`/admin/users/${u.user_id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-[var(--adm-interactive-hover-strong)]"
                          style={{
                            background: "var(--adm-primary-container)",
                            color: "#fff",
                            boxShadow: "0 0 12px rgba(104, 57, 234, 0.3)",
                          }}
                        >
                          {t("openConfiguration")}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.user_id, u.email ?? u.user_id)}
                          disabled={isDeleting || isPending}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                          style={{
                            color: "var(--adm-error)",
                            background: "rgba(255, 180, 171, 0.1)",
                            border: "1px solid rgba(255, 180, 171, 0.25)",
                          }}
                          title={t("confirmDelete", { email: u.email ?? u.user_id })}
                        >
                          {isDeleting ? "…" : tCommon("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
