"use client";

import { useState, useTransition } from "react";
import { deleteUser, type ClientRow } from "./actions";
import { CreateUserForm } from "./CreateUserForm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  initialUsers: ClientRow[];
  initialError: string | null;
};

export function UsersClient({ initialUsers, initialError }: Props) {
  const t = useTranslations("admin.usersPage");
  const tSettings = useTranslations("settings.frequency");
  const tCommon = useTranslations("common");
  const [users, setUsers] = useState<ClientRow[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();
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

      {/* Create form */}
      {showForm && (
        <CreateUserForm
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Error */}
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

      {/* Users table */}
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
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  t("colUser"),
                  t("colDomain"),
                  t("colFrequency"),
                  t("colGaKey"),
                  t("colGccKey"),
                  t("colCreated"),
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest"
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

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-raised)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                    }}
                  >
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
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono" style={{ color: "var(--text)" }}>
                        {u.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: "rgba(124,92,252,0.1)", color: "var(--accent)" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                        {FREQUENCY_LABELS[u.frequency] ?? u.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono" style={{ color: u.ga_api_key ? "var(--text-muted)" : "var(--text-faint)" }}>
                        {u.ga_api_key ? `${u.ga_api_key.slice(0, 8)}…` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono" style={{ color: u.gcc_api_key ? "var(--text-muted)" : "var(--text-faint)" }}>
                        {u.gcc_api_key ? `${u.gcc_api_key.slice(0, 8)}…` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(u.user_id, u.email ?? u.user_id)}
                        disabled={isDeleting || isPending}
                        className="text-xs font-semibold transition-colors disabled:opacity-40"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                        }}
                      >
                        {isDeleting ? "…" : tCommon("delete")}
                      </button>
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
