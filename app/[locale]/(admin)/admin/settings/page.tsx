import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("admin");
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t("settings")}</h1>
      <p className="text-gray-600 dark:text-gray-400">{t("settingsPage.placeholder")}</p>
    </div>
  );
}
