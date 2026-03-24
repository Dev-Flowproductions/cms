"use client";

import { Link } from "@/lib/navigation";
import type { UserWithPostCount } from "@/lib/data/posts";

export function UsersListClient({ users }: { users: UserWithPostCount[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Account
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Domain
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Posts
            </th>
            <th className="w-32" />
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-sm" style={{ color: "var(--text-faint)", background: "var(--surface)" }}>
                No accounts with posts yet
              </td>
            </tr>
          ) : (
            users.map((u, idx) => (
              <tr
                key={u.user_id}
                style={{
                  background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>
                  {u.account_name}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                  {u.domain ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                  {u.post_count}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/posts?user=${u.user_id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap hover:opacity-80"
                    style={{ background: "var(--accent)", color: "white" }}
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
