import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPostWithLocalizations } from "@/lib/data/post-detail";
import { requireTeamMember } from "@/lib/auth";
import { getSourcesList, getCitationsForPost } from "../../sources/actions";
import { EditPostForm } from "./EditPostForm";
import { updatePost, upsertLocalization, uploadCoverImage } from "../actions";
import { ReviewChecklistBlock } from "./ReviewChecklistBlock";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { roles } = await requireTeamMember();
  const data = await getPostWithLocalizations(id);
  if (!data) notFound();

  const canReview = roles.includes("reviewer") || roles.includes("admin");
  const showChecklist = canReview && data.status === "review";
  const sources = await getSourcesList();
  const citations = await getCitationsForPost(id);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const tPost = await getTranslations("post.status");
  const tContent = await getTranslations("post.contentType");

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

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t("editPost")}</h1>
      <EditPostForm
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
      />
      {showChecklist && <ReviewChecklistBlock postId={id} />}
    </div>
  );
}
