import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export type Role = "admin" | "editor" | "reviewer" | "contributor";

const TEAM_ROLES: Role[] = ["admin", "editor", "reviewer", "contributor"];
const REVIEWER_ROLES: Role[] = ["admin", "reviewer"];
const ADMIN_ROLES: Role[] = ["admin"];

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);
  if (error) return [];
  return (data?.map((r) => r.role_id as Role) ?? []).filter((r) =>
    TEAM_ROLES.includes(r)
  );
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  const roles = await getUserRoles(session.user.id);
  const hasRole = allowedRoles.some((r) => roles.includes(r));
  if (!hasRole) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }
  return { session, roles };
}

export async function requireTeamMember() {
  return requireRole(TEAM_ROLES);
}

export async function requireReviewer() {
  return requireRole(REVIEWER_ROLES);
}

export async function requireAdmin() {
  return requireRole(ADMIN_ROLES);
}

export function isTeamRole(role: string): role is Role {
  return TEAM_ROLES.includes(role as Role);
}
