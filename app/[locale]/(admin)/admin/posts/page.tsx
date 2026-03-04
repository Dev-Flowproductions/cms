import { getTranslations } from "next-intl/server";
import { getPostsForAdmin } from "@/lib/data/posts";
import { PostsListClient } from "./PostsListClient";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const t = await getTranslations("admin");
  const params = await searchParams;
  const status = params.status as "idea" | "draft" | "review" | "published" | undefined;
  const posts = await getPostsForAdmin(status ? { status } : undefined);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">{t("posts")}</h1>
      </div>
      <PostsListClient initialPosts={posts} statusFilter={status} />
    </div>
  );
}
