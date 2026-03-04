import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export type Role = "admin" | "editor" | "reviewer" | "contributor";

const TEAM_ROLES: Role[] = ["admin", "editor", "reviewer", "contributor"];
const REVIEWER_ROLES: Role[] = ["admin", "reviewer"];
const ADMIN_ROLES: Role[] = ["admin"];

/** Prefer getUser() for server-side checks; getSession() reads from cookie only and is not validated. */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/** Validates the user with the Auth server. Use this for server-side auth checks instead of getSession(). */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
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
  const user = await getUser();
  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  const roles = await getUserRoles(user.id);
  const hasRole = allowedRoles.some((r) => roles.includes(r));
  if (!hasRole) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }
  return { user, roles };
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

/** Returns user and their roles, or redirects to login. Use for dashboard etc. */
export async function getAuthUserWithRoles() {
  const user = await requireAuth();
  const roles = await getUserRoles(user.id);
  return { user, roles };
}

/** True if the user has the admin role. */
export function hasAdminRole(roles: Role[]): boolean {
  return ADMIN_ROLES.some((r) => roles.includes(r));
}

export function isTeamRole(role: string): role is Role {
  return TEAM_ROLES.includes(role as Role);
}
