import { getAuthUserWithRoles } from "@/lib/auth";
import { Link } from "@/lib/navigation";
import { ManualPostEditor } from "../ManualPostEditor";
import { getTranslations } from "next-intl/server";

export default async function NewPostPage() {
  await getAuthUserWithRoles();
  const t = await getTranslations("dashboard");

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--adm-on-variant)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("myPosts")}
        </Link>
        <span style={{ color: "var(--adm-outline-variant)" }}>/</span>
        <span className="font-semibold" style={{ color: "var(--adm-on-surface)" }}>
          {t("newPost")}
        </span>
      </div>

      <header className="mb-8">
        <p
          className="mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--adm-primary)" }}
        >
          {t("manualPostEyebrow")}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--adm-on-surface)" }}>
          {t("manualPostTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
          {t("manualPostDescription")}
        </p>
      </header>

      <ManualPostEditor />
    </div>
  );
}
