import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAuthUserWithRoles } from "@/lib/auth";
import { Link } from "@/lib/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

const AdminPostComposer = dynamic(
  () =>
    import("@/app/[locale]/(admin)/admin/posts/AdminPostComposer").then(
      (m) => m.AdminPostComposer,
    ),
  {
    loading: () => (
      <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
        Loading composer…
      </p>
    ),
  },
);

export default async function NewPostPage() {
  const { user } = await getAuthUserWithRoles();
  const t = await getTranslations("dashboard");

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select(
      "user_id, company_name, brand_name, logo_url, primary_color, secondary_color, tertiary_color, font_style",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client) notFound();

  const accountName = (client.company_name ?? client.brand_name)?.trim() || "—";

  return (
    <div className="min-w-0 max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[color:var(--adm-primary)] hover:underline hover:decoration-2 hover:underline-offset-4"
          style={{ color: "var(--adm-on-variant)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M19 12H5M12 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("myPosts")}
        </Link>
        <span style={{ color: "var(--adm-outline-variant)" }}>/</span>
        <span className="font-semibold" style={{ color: "var(--adm-on-surface)" }}>
          {t("newPost")}
        </span>
      </div>

      <h1
        className="mb-6 text-2xl font-extrabold tracking-tight"
        style={{ color: "var(--adm-on-surface)" }}
      >
        {t("manualPostTitle")}
      </h1>

      <AdminPostComposer
        authorUserId={user.id}
        accountName={accountName}
        brand={{
          company_name: client.company_name,
          brand_name: client.brand_name,
          logo_url: client.logo_url,
          primary_color: client.primary_color,
          secondary_color: client.secondary_color,
          font_style: client.font_style,
        }}
        postsListHref="/dashboard/posts"
        fullEditorHrefBase="/dashboard/posts"
      />
    </div>
  );
}
