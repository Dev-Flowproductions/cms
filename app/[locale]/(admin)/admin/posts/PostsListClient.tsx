"use client";

import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";

type Row = {
  id: string;
  slug: string;
  status: string;
  primary_locale: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

export function PostsListClient({
  initialPosts,
  statusFilter,
}: {
  initialPosts: Row[];
  statusFilter?: string;
}) {
  const t = useTranslations("admin");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Link
          href="/admin/posts"
          className={`px-3 py-1.5 text-sm rounded ${!statusFilter ? "bg-gray-200 dark:bg-gray-700" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          {t("postsPage.filterAll")}
        </Link>
        {["draft", "review", "published"].map((s) => (
          <Link
            key={s}
            href={`/admin/posts?status=${s}`}
            className={`px-3 py-1.5 text-sm rounded ${statusFilter === s ? "bg-gray-200 dark:bg-gray-700" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            {s}
          </Link>
        ))}
      </div>
      <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3 font-medium">{t("slug")}</th>
              <th className="text-left p-3 font-medium">{t("status")}</th>
              <th className="text-left p-3 font-medium">{t("primaryLocale")}</th>
              <th className="text-left p-3 font-medium">{t("author")}</th>
              <th className="text-left p-3 font-medium">{t("table.updated")}</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {initialPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  {t("postsPage.noPosts")}
                </td>
              </tr>
            ) : (
              initialPosts.map((post) => (
                <tr key={post.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3 font-mono">{post.slug}</td>
                  <td className="p-3">{post.status}</td>
                  <td className="p-3">{post.primary_locale}</td>
                  <td className="p-3">{Array.isArray(post.profiles) ? post.profiles[0]?.display_name : post.profiles?.display_name ?? "—"}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {t("editPost")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
