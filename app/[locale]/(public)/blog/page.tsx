import { Link } from "@/lib/navigation";
import { getLocale } from "next-intl/server";
import { getPublishedPostsList } from "@/lib/data/blog";

export default async function BlogListPage() {
  const locale = (await getLocale()) as "en" | "pt" | "fr";
  const { items } = await getPublishedPostsList(locale);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-10" style={{ color: "var(--text)" }}>
        Blog
      </h1>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No posts yet.</p>
      ) : (
        <ul className="space-y-8">
          {items.map((post) => (
            <li
              key={post.id}
              className="pb-8"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <Link href={`/blog/${post.slug}`} className="block group">
                <h2
                  className="text-lg font-semibold group-hover:underline"
                  style={{ color: "var(--text)" }}
                >
                  {post.title || post.slug}
                </h2>
                {post.published_at && (
                  <time className="text-xs mt-1 block" style={{ color: "var(--text-faint)" }}>
                    {new Date(post.published_at).toLocaleDateString(locale)}
                  </time>
                )}
                {post.excerpt && (
                  <p className="mt-2 text-sm line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
