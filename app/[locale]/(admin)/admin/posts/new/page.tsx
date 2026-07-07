import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/uuid";
import { createPost } from "../actions";
import { NewPostForm } from "./NewPostForm";

const AdminPostComposer = dynamic(
  () => import("../AdminPostComposer").then((m) => m.AdminPostComposer),
  { loading: () => <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>Loading composer…</p> },
);

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const userId = params.user?.trim();

  if (userId) {
    if (!isUuid(userId)) notFound();

    const admin = createAdminClient();
    const { data: client } = await admin
      .from("clients")
      .select(
        "user_id, company_name, brand_name, logo_url, primary_color, secondary_color, tertiary_color, font_style"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (!client) notFound();

    const t = await getTranslations("admin");
    const accountName = (client.company_name ?? client.brand_name)?.trim() || "—";

    return (
      <div className="min-w-0 max-w-6xl">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6" style={{ color: "var(--adm-on-surface)" }}>
          {t("composerPage.title")}
        </h1>
        <AdminPostComposer
          authorUserId={userId}
          accountName={accountName}
          brand={{
            company_name: client.company_name,
            brand_name: client.brand_name,
            logo_url: client.logo_url,
            primary_color: client.primary_color,
            secondary_color: client.secondary_color,
            font_style: client.font_style,
          }}
          postsListHref={`/admin/posts?user=${userId}`}
        />
      </div>
    );
  }

  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const tPost = await getTranslations("post.status");
  const tContent = await getTranslations("post.contentType");

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createPost(formData);
    if (result.error) return result;
    if (result.postId) {
      const locale = await getLocale();
      redirect(`/${locale}/admin/posts/${result.postId}`);
    }
    return result;
  }

  const statusOptions = [
    "idea",
    "research",
    "draft",
    "optimize",
    "format",
    "review",
    "approved",
    "scheduled",
    "published",
    "archived",
  ] as const;
  const contentTypes = ["hero", "hub", "hygiene"] as const;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t("newPost")}</h1>
      <NewPostForm
        action={handleCreate}
        statusOptions={statusOptions.map((s) => ({ value: s, label: tPost(s) }))}
        contentTypes={contentTypes.map((c) => ({ value: c, label: tContent(c) }))}
        labels={{
          slug: t("slug"),
          primaryLocale: t("primaryLocale"),
          contentType: t("contentType"),
          status: t("status"),
          submit: tCommon("submit"),
        }}
      />
    </div>
  );
}
