import { Link } from "@/lib/navigation";
import { getLocale } from "next-intl/server";
import { getPublishedPostsList } from "@/lib/data/blog";

export default async function BlogListPage() {
  const locale = (await getLocale()) as "en" | "pt" | "fr";
  const { items } = await getPublishedPostsList(locale);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Blog</h1>
      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No posts yet.</p>
      ) : (
        <ul className="space-y-6">
          {items.map((post) => (
            <li key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <Link href={`/blog/${post.slug}`} className="block group">
                <h2 className="text-lg font-semibold group-hover:underline">{post.title || post.slug}</h2>
                {post.published_at && (
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.published_at).toLocaleDateString(locale)}
                  </time>
                )}
                {post.excerpt && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
