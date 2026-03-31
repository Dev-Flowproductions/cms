"use client";

import React, { useState, useTransition } from "react";
import { type ClientRow } from "./actions";
import { CreateUserForm } from "./CreateUserForm";
import { Link, useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { getMsUntilNextPostDue } from "@/lib/scheduler/next-post";
import { NextPostCountdown } from "@/components/NextPostCountdown";

type Props = {
  initialUsers: ClientRow[];
  initialError: string | null;
};

export function UsersClient({ initialUsers, initialError }: Props) {
  const t = useTranslations("admin.usersPage");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function isDueNow(user: ClientRow): boolean {
    if (!user.domain) return false;
    return getMsUntilNextPostDue(user.last_post_generated_at, user.frequency) === 0;
  }

  const dueNowCount = initialUsers.filter(isDueNow).length;

  function handleSuccess() {
    setShowForm(false);
    startTransition(() => { router.refresh(); });
  }

  return (
    <div className="w-full min-w-0">
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

      {initialUsers.length === 0 ? (
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
          className="admin-shell-glass overflow-x-auto rounded-2xl border [-webkit-overflow-scrolling:touch]"
          style={{ borderColor: "var(--adm-border-subtle)" }}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ background: "var(--adm-surface-high)", borderBottom: "1px solid var(--adm-border-subtle)" }}>
                <th
                  className="min-w-0 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--adm-on-variant)" }}
                >
                  {t("colUser")}
                </th>
              </tr>
            </thead>
            <tbody>
              {initialUsers.map((u, idx) => {
                const accountName = u.company_name ?? u.brand_name ?? null;
                const displayName = accountName?.trim() || u.email || "—";
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
                        className="group block min-w-0 cursor-pointer rounded-lg -mx-1 px-1 py-0.5 -my-0.5 transition-colors hover:bg-[var(--adm-interactive-hover-strong)]"
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
                        {u.domain && (
                          <NextPostCountdown
                            lastPostGeneratedAt={u.last_post_generated_at}
                            frequency={u.frequency}
                            variant="adminInline"
                            className="mt-1"
                          />
                        )}
                        {googleConnected && (
                          <span className="text-[10px] font-bold uppercase mt-1 inline-block" style={{ color: "#22d3a0" }}>
                            {t("googleConnected")}
                          </span>
                        )}
                      </Link>
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
