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
        className="lg:hidden fixed top-3 left-3 z-40 flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
          // Desktop: static sidebar
          "hidden lg:flex lg:sticky lg:top-0 lg:w-60 lg:flex-shrink-0",
          // Mobile: fixed full-height drawer
          open ? "!flex fixed top-0 left-0 z-50 w-72" : "",
        ].join(" ")}
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          transition: "transform 0.25s ease",
        }}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
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
