export default function AdminUsersLoading() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-8 w-40 rounded-lg" style={{ background: "var(--adm-surface-high)" }} />
      <div className="h-12 w-full rounded-xl" style={{ background: "var(--adm-surface-high)" }} />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-lg" style={{ background: "var(--adm-surface-high)" }} />
        ))}
      </div>
    </div>
  );
}
