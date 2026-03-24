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
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold">{t("posts")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
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
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/posts"
          className="text-sm font-medium flex items-center gap-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All accounts
        </Link>
        <h1 className="text-xl font-bold">
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
