import { getTranslations } from "next-intl/server";
import { getAuthUserWithRoles } from "@/lib/auth";
import { getClientSettings, getMyProfile } from "@/app/[locale]/(admin)/admin/users/actions";
import { AccountSettingsCard } from "../AccountSettingsCard";

export default async function DashboardSettingsPage() {
  const { user } = await getAuthUserWithRoles();
  const t = await getTranslations("dashboard");
  const [clientSettings, profile] = await Promise.all([
    getClientSettings(user.id).catch(() => null),
    getMyProfile().catch(() => null),
  ]);

  if (!clientSettings) {
    return (
      <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
        {t("settingsLoadError")}
      </p>
    );
  }

  return (
    <div className="min-w-0 w-full max-w-6xl">
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: "var(--adm-primary-container)" }}
          >
            {t("workspaceUser")}
          </span>
          <div className="h-px w-12 bg-[var(--adm-outline-variant)]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl" style={{ color: "var(--adm-on-surface)" }}>
          {t("settings")}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
          {t("settingsPageSubtitle")}
        </p>
      </header>

      <AccountSettingsCard userId={user.id} settings={clientSettings} profile={profile} />
    </div>
  );
}
