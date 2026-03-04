import { Link } from "@/lib/navigation";
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t("posts")}</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-sm font-medium"
        >
          {t("newPost")}
        </Link>
      </div>
      <PostsListClient initialPosts={posts} statusFilter={status} />
    </div>
  );
}
