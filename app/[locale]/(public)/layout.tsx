import { Link } from "@/lib/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { getTranslations } from "next-intl/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: "rgba(17,17,24,0.85)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <nav className="max-w-5xl mx-auto px-6 py-0 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent)" }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1.5 3h10M1.5 6.5h6.5M1.5 10h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-bold text-sm" style={{ color: "var(--text)" }}>CMS</span>
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {t("blog")}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              {t("admin")}
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {children}
      </main>
      <footer
        className="py-6 text-center text-xs"
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--text-faint)",
        }}
      >
        AI-native CMS &mdash; Built to flow.
      </footer>
    </div>
  );
}
