import { notFound } from "next/navigation";
import { getClientRowByUserId } from "../actions";
import { UserDetailClient } from "../UserDetailClient";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getClientRowByUserId(userId);
  if (!user) notFound();

  return <UserDetailClient user={user} />;
}
