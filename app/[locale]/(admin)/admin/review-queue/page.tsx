import { Link } from "@/lib/navigation";
import { getTranslations } from "next-intl/server";
import { getReviewQueuePosts } from "@/lib/data/review";
import { ApproveRejectButtons } from "./ApproveRejectButtons";

export default async function ReviewQueuePage() {
  const t = await getTranslations("admin");
  const posts = await getReviewQueuePosts();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t("reviewQueue")}</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No posts in review.</p>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-medium">Slug</th>
                <th className="text-left p-3 font-medium">Locale</th>
                <th className="text-left p-3 font-medium">Updated</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post: { id: string; slug: string; primary_locale: string; updated_at: string; profiles: unknown }) => (
                <tr key={post.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3">
                    <Link href={`/admin/posts/${post.id}`} className="font-mono text-blue-600 dark:text-blue-400 hover:underline">
                      {post.slug}
                    </Link>
                  </td>
                  <td className="p-3">{post.primary_locale}</td>
                  <td className="p-3 text-gray-500">{new Date(post.updated_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <ApproveRejectButtons postId={post.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
