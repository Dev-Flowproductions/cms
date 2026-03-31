"use client";

import { useState, useEffect } from "react";
import { usePathname } from "@/lib/navigation";

export function AdminSidebarShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Hamburger — fixed top-left on mobile, hidden on desktop */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-xl transition-all"
        style={{
          background: "var(--adm-surface-high)",
          border: "1px solid var(--adm-outline-variant)",
          color: "var(--adm-on-variant)",
          boxShadow: "var(--adm-menu-button-shadow)",
        }}
        aria-label="Open menu"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Overlay backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "flex flex-col h-screen overflow-y-auto",
          // Desktop: static sidebar (16rem — matches editorial shell)
          "hidden lg:flex lg:sticky lg:top-0 lg:w-64 lg:flex-shrink-0",
          // Mobile: fixed full-height drawer
          open ? "!flex fixed top-0 left-0 z-50 w-72" : "",
        ].join(" ")}
        style={{
          background: "var(--adm-sidebar)",
          borderRight: "1px solid var(--adm-border-subtle)",
          transition: "transform 0.25s ease",
        }}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg lg:hidden"
          style={{
            background: "var(--adm-surface-high)",
            border: "1px solid var(--adm-outline-variant)",
            color: "var(--adm-on-variant)",
          }}
          aria-label="Close menu"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {children}
      </aside>
    </>
  );
}
