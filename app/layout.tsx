import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SchedulerTrigger } from "@/components/SchedulerTrigger";

export const metadata: Metadata = {
  title: "CMS WitFlow — AI-native editorial platform",
  description: "CMS WitFlow: citation-worthy, entity-structured content with a Human-in-the-Loop editorial pipeline.",
  icons: {
    icon: "/images/L_favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/L_favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Prevent flash: set data-theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.setAttribute('data-theme',s||p);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <SchedulerTrigger />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
