import { AppLogo } from "@/components/AppLogo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--bg)" }}
    >
      {/* Logo */}
      <div className="mb-12">
        <AppLogo className="h-10 w-auto object-contain" />
      </div>

      {children}
    </div>
  );
}
