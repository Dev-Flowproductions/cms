import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { createPost } from "../actions";
import { NewPostForm } from "./NewPostForm";

export default async function NewPostPage() {
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
