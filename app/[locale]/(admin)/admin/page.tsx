import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";

const QUICK_LINKS = [
  { href: "/admin/posts", labelKey: "posts" as const },
  { href: "/admin/review-queue", labelKey: "reviewQueue" as const },
  { href: "/admin/sources", labelKey: "sources" as const },
  { href: "/admin/settings", labelKey: "settings" as const },
];

export default async function AdminPage() {
  const t = await getTranslations("admin");
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--accent)" }}
        >
          Admin panel
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          {t("dashboard")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {t("dashboardWelcome")}
        </p>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between px-6 py-5 rounded-2xl transition-all"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {t(item.labelKey)}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-1"
              style={{ color: "var(--accent)" }}
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
