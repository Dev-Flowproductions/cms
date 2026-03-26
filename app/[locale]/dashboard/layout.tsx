import "../(admin)/admin/admin-shell.css";
import { getAuthUserWithRoles, hasAdminRole } from "@/lib/auth";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getClientSettings } from "@/app/[locale]/(admin)/admin/users/actions";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, roles } = await getAuthUserWithRoles();
  const locale = await getLocale();

  if (hasAdminRole(roles)) {
    redirect(`/${locale}/admin`);
  }

  const clientSettings = await getClientSettings(user.id).catch(() => null);
  if (!clientSettings?.domain?.trim()) {
    redirect(`/${locale}/onboarding/domain`);
  }

  const initial = (user.email ?? "?")[0].toUpperCase();

  return (
    <DashboardShell userEmail={user.email ?? ""} userInitial={initial}>
      {children}
    </DashboardShell>
  );
}
