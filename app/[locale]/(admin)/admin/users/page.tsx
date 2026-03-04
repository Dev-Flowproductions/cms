import { listUsers, type ClientRow } from "./actions";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  // requireAdmin() inside listUsers will redirect() if not admin — must not be caught.
  // listUsers throws on genuine DB errors, which Next.js will surface as a 500.
  const users: ClientRow[] = await listUsers();
  return <UsersClient initialUsers={users} initialError={null} />;
}
