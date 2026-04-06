import { AppLogo } from "@/components/AppLogo";
import { getTranslations } from "next-intl/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("common");
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--bg)" }}
    >
      <div className="mb-12 text-center">
        <AppLogo className="mx-auto h-10 w-auto object-contain" />
        <p className="mt-4 text-lg font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          {t("appName")}
        </p>
      </div>

      {children}
    </div>
  );
}
