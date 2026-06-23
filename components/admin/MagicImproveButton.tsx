"use client";

export function MagicImproveButton({
  onClick,
  loading,
  disabled,
  title,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      aria-label={title}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all disabled:opacity-40"
      style={{
        background: loading ? "var(--adm-surface-highest)" : "var(--adm-primary-soft-bg)",
        borderColor: "var(--adm-outline-variant)",
        color: "var(--adm-primary)",
        boxShadow: loading ? "none" : "0 0 12px rgba(104, 57, 234, 0.2)",
      }}
    >
      {loading ? (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
