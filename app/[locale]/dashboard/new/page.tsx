import { getAuthUserWithRoles } from "@/lib/auth";
import { Link } from "@/lib/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { UserMenu } from "../UserMenu";
import { ManualPostEditor } from "../ManualPostEditor";
import { getTranslations } from "next-intl/server";

export default async function NewPostPage() {
  const { user } = await getAuthUserWithRoles();
  const t = await getTranslations();
  const initial = (user.email ?? "?")[0].toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Topbar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: "color-mix(in srgb, var(--surface) 85%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-0 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("dashboard.myPosts")}
            </Link>
            <span style={{ color: "var(--border)" }}>/</span>
            <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>New post</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LocaleSwitcher />
            <UserMenu email={user.email ?? ""} initial={initial} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--accent)" }}
          >
            Manual post
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Write a new post
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Create a post yourself — no AI involved. You can add a cover image and edit SEO details after saving.
          </p>
        </div>

        <ManualPostEditor />
      </main>
    </div>
  );
}
