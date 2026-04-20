"use client";

import { useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";

/** Full Site ID block for admin user detail (DG / external integrations). */
export function AdminSiteIdPanel({ siteId }: { siteId: string }) {
  const t = useTranslations("admin.usersPage");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(siteId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be denied */
    }
  }

  return (
    <div
      className="mt-4 max-w-2xl rounded-xl border px-4 py-3"
      style={{
        borderColor: "var(--adm-border-subtle)",
        background: "var(--adm-surface-high)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--adm-on-variant)" }}
      >
        {t("siteIdLabel")}
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
        {t("siteIdHelp")}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code
          className="min-w-0 flex-1 break-all rounded-lg px-2 py-1.5 font-mono text-xs sm:text-sm"
          style={{
            background: "var(--adm-surface)",
            color: "var(--adm-on-surface)",
            border: "1px solid var(--adm-border-subtle)",
          }}
        >
          {siteId}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:py-1.5"
          style={{
            background: "var(--adm-primary-container)",
            color: "#fff",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
            <path
              d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {copied ? t("siteIdCopied") : t("siteIdCopy")}
        </button>
      </div>
    </div>
  );
}

/** Compact copy control for admin users list (outside row link). */
export function AdminSiteIdRow({ siteId }: { siteId: string }) {
  const t = useTranslations("admin.usersPage");
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(siteId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-2 pl-1"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
        {t("siteIdLabel")}
      </span>
      <code
        className="max-w-[min(100%,12rem)] truncate font-mono text-[10px]"
        style={{ color: "var(--adm-on-surface)" }}
        title={siteId}
      >
        {siteId}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors"
        style={{
          background: "rgba(104, 57, 234, 0.15)",
          color: "var(--adm-primary)",
        }}
      >
        {copied ? t("siteIdCopied") : t("siteIdCopy")}
      </button>
    </div>
  );
}
