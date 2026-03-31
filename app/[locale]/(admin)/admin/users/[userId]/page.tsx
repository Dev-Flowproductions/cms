import { notFound } from "next/navigation";
import { getBlogAuthorsForClientByAdmin, getClientRowByUserId } from "../actions";
import { UserDetailClient } from "../UserDetailClient";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getClientRowByUserId(userId);
  if (!user) notFound();

  const blogAuthors = await getBlogAuthorsForClientByAdmin(userId);

  return <UserDetailClient user={user} blogAuthors={blogAuthors} />;
}
