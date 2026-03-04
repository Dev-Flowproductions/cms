"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";

export function AdminLogoutButton() {
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
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all w-full disabled:opacity-50"
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
  );
}
