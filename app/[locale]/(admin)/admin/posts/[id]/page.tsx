import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { getPostWithLocalizations } from "@/lib/data/post-detail";
import { requireTeamMember } from "@/lib/auth";
import { getSourcesList, getCitationsForPost } from "../../sources/actions";
import { EditPostForm } from "./EditPostForm";
import { updatePost, upsertLocalization, uploadCoverImage } from "../actions";
import { ReviewChecklistBlock } from "./ReviewChecklistBlock";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { roles } = await requireTeamMember();
  const data = await getPostWithLocalizations(id);
  if (!data) notFound();

  const canReview = roles.includes("admin");
  const showChecklist = canReview && data.status === "review";
  const sources = await getSourcesList();
  const citations = await getCitationsForPost(id);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const tPost = await getTranslations("post.status");
  const tContent = await getTranslations("post.contentType");

  // Fetch the author's webhook config so the UI knows whether auto-publish is on
  const adminClient = createAdminClient();
  const { data: authorClient } = await adminClient
    .from("clients")
    .select("webhook_url, auto_publish")
    .eq("user_id", data.author_id)
    .maybeSingle();

  const statusOptions = [
    "draft",
    "published",
  ] as const;
  const contentTypes = ["hero", "hub", "hygiene"] as const;
  const locales = ["pt", "en", "fr"] as const;

  async function handleUpdatePost(formData: FormData) {
    "use server";
    return updatePost(id, formData);
  }

  async function handleUpsertLocalization(formData: FormData) {
    "use server";
    return upsertLocalization(id, formData);
  }

  async function handleUploadCover(formData: FormData) {
    "use server";
    return uploadCoverImage(id, formData);
  }

  const postsListHref = `/admin/posts?user=${data.author_id}`;

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <Link
          href={postsListHref}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: "var(--adm-on-variant)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("backToPosts")}
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--adm-on-surface)" }}>
          {t("editPost")}
        </h1>
        <p className="mt-1 font-mono text-sm" style={{ color: "var(--adm-on-variant)" }}>
          {data.slug}
        </p>
      </div>
      <EditPostForm
        postsListHref={postsListHref}
        post={data}
        statusOptions={statusOptions.map((s) => ({ value: s, label: tPost(s) }))}
        contentTypes={contentTypes.map((c) => ({ value: c, label: tContent(c) }))}
        locales={locales}
        labels={{
          slug: t("slug"),
          status: t("status"),
          primaryLocale: t("primaryLocale"),
          contentType: t("contentType"),
          coverImage: t("coverImage"),
          publishedAt: t("publishedAt"),
          scheduledFor: t("scheduledFor"),
          title: t("title"),
          excerpt: t("excerpt"),
          content: t("content"),
          save: tCommon("save"),
          postSettings: t("editPostPage.postSettings"),
          markdownHint: t("editPostPage.markdownHint"),
          preview: t("editPostPage.preview"),
        }}
        updatePostAction={handleUpdatePost}
        upsertLocalizationAction={handleUpsertLocalization}
        uploadCoverAction={handleUploadCover}
        supabaseUrl={supabaseUrl}
        sources={sources}
        citations={citations}
        publishConfig={{
          hasWebhook: !!authorClient?.webhook_url,
          autoPublish: authorClient?.auto_publish ?? false,
        }}
      />
      {showChecklist && <ReviewChecklistBlock postId={id} />}
    </div>
  );
}
