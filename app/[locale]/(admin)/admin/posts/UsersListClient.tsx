"use client";

import { Link } from "@/lib/navigation";
import type { UserWithPostCount } from "@/lib/data/posts";

export function UsersListClient({ users }: { users: UserWithPostCount[] }) {
  return (
    <div
      className="admin-shell-glass overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--adm-border-subtle)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--adm-surface-high)", borderBottom: "1px solid var(--adm-border-subtle)" }}>
            <th
              className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--adm-on-variant)" }}
            >
              Account
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--adm-on-variant)" }}
            >
              Domain
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--adm-on-variant)" }}
            >
              Posts
            </th>
            <th className="w-32" />
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-12 text-center text-sm"
                style={{ color: "var(--adm-on-variant)" }}
              >
                No accounts with posts yet
              </td>
            </tr>
          ) : (
            users.map((u, idx) => (
              <tr
                key={u.user_id}
                className="transition-colors hover:bg-white/[0.04]"
                style={{
                  background: idx % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop: "1px solid var(--adm-border-subtle)",
                }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "var(--adm-on-surface)" }}>
                  {u.account_name}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--adm-on-variant)" }}>
                  {u.domain ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums" style={{ color: "var(--adm-on-variant)" }}>
                  {u.post_count}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/posts?user=${u.user_id}`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:opacity-90"
                    style={{
                      background: "var(--adm-primary-container)",
                      color: "#fff",
                      boxShadow: "0 0 16px rgba(104, 57, 234, 0.25)",
                    }}
                  >
                    View posts
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
