"use client";

export default function AdminPostsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--adm-border-subtle)" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--adm-on-surface)" }}>
        Could not load posts.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white"
        style={{ background: "var(--adm-primary-container)" }}
      >
        Try again
      </button>
    </div>
  );
}
