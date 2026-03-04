"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";

export function UserMenu({ email, initial }: { email: string; initial: string }) {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 focus:outline-none"
      >
        <span className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
          {email}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
          style={{
            background: open ? "var(--accent)" : "var(--accent-glow)",
            border: "1.5px solid var(--accent)",
            color: open ? "white" : "var(--accent)",
          }}
        >
          {initial}
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Email row */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-faint)" }}>
              {t("signedInAs")}
            </p>
            <p className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>
              {email}
            </p>
          </div>

          {/* Logout */}
          <div className="p-1.5">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left disabled:opacity-50"
              style={{ color: "var(--danger)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,92,106,0.08)";
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
