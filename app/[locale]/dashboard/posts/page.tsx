import { getTranslations } from "next-intl/server";
import { getAuthUserWithRoles } from "@/lib/auth";
import { getPostsForDashboard } from "@/lib/data/posts";
import { DashboardPostsTable } from "../DashboardPostsTable";

export default async function DashboardPostsPage() {
  const { user } = await getAuthUserWithRoles();
  const t = await getTranslations("dashboard");
  const posts = await getPostsForDashboard(user.id, false);

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: "var(--adm-primary-container)" }}
          >
            {t("workspaceUser")}
          </span>
          <div className="h-px w-12 bg-[var(--adm-outline-variant)]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl" style={{ color: "var(--adm-on-surface)" }}>
          {t("myPosts")}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
          {t("postsPageSubtitle")}
        </p>
      </header>

      <DashboardPostsTable posts={posts} isAdmin={false} />
    </div>
  );
}
