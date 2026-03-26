import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { getPostsForAdmin, getUsersWithPostCount } from "@/lib/data/posts";
import { PostsListClient } from "./PostsListClient";
import { UsersListClient } from "./UsersListClient";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; user?: string }>;
}) {
  const t = await getTranslations("admin");
  const params = await searchParams;
  const status = params.status as "idea" | "draft" | "review" | "published" | undefined;
  const userId = params.user?.trim() || undefined;

  if (!userId) {
    const users = await getUsersWithPostCount();
    return (
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--adm-on-surface)" }}>
            {t("posts")}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--adm-on-variant)" }}>
            Select an account to view and manage posts
          </p>
        </div>
        <UsersListClient users={users} />
      </div>
    );
  }

  const { posts, clientByAuthor } = await getPostsForAdmin(
    status ? { status, userId } : { userId }
  );
  const accountName =
    clientByAuthor[userId]?.company_name ?? clientByAuthor[userId]?.brand_name ?? "—";

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href="/admin/posts"
          className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: "var(--adm-on-variant)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All accounts
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--adm-on-surface)" }}>
          {accountName}
        </h1>
      </div>
      <PostsListClient
        initialPosts={posts}
        statusFilter={status}
        clientByAuthor={clientByAuthor}
        userId={userId}
      />
    </div>
  );
}
