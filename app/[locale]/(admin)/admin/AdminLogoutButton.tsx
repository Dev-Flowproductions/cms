"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";

export function AdminLogoutButton({ className = "" }: { className?: string }) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const supabase = createClient();

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.replace(`${window.location.origin}/${locale}/login`);
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${className}`}
      style={{
        background: "var(--adm-surface-high)",
        color: "var(--adm-primary)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.filter = "";
      }}
    >
      <svg
        className="h-[18px] w-[18px] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {loading ? t("signingOut") : t("signOut")}
    </button>
  );
}
