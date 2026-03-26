"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";

export function UserMenu({
  email,
  initial,
  variant = "default",
}: {
  email: string;
  initial: string;
  variant?: "default" | "editorial";
}) {
  const t = useTranslations("userMenu");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const supabase = createClient();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.replace(`${window.location.origin}/${locale}/login`);
  }

  const ed = variant === "editorial";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 focus:outline-none"
      >
        <span
          className="hidden max-w-[140px] truncate text-xs sm:block"
          style={{ color: ed ? "var(--adm-on-variant)" : "var(--text-muted)" }}
        >
          {email}
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all"
          style={
            ed
              ? {
                  background: open ? "var(--adm-primary-container)" : "rgba(104, 57, 234, 0.25)",
                  border: "1.5px solid var(--adm-primary)",
                  color: open ? "#fff" : "var(--adm-primary)",
                }
              : {
                  background: open ? "var(--accent)" : "var(--accent-glow)",
                  border: "1.5px solid var(--accent)",
                  color: open ? "white" : "var(--accent)",
                }
          }
        >
          {initial}
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl"
          style={
            ed
              ? {
                  background: "var(--adm-surface-high)",
                  border: "1px solid var(--adm-outline-variant)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                }
              : {
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }
          }
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: `1px solid ${ed ? "var(--adm-outline-variant)" : "var(--border)"}` }}
          >
            <p
              className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: ed ? "var(--adm-on-variant)" : "var(--text-faint)" }}
            >
              {t("signedInAs")}
            </p>
            <p className="truncate text-xs font-medium" style={{ color: ed ? "var(--adm-on-surface)" : "var(--text)" }}>
              {email}
            </p>
          </div>

          <div className="p-1.5">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all disabled:opacity-50"
              style={{ color: ed ? "var(--adm-error)" : "var(--danger)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = ed
                  ? "rgba(255, 180, 171, 0.1)"
                  : "rgba(255,92,106,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M13 7H5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {loading ? t("signingOut") : t("signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
