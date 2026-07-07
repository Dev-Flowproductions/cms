import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMS WitFlow — AI-native editorial platform",
  description:
    "CMS WitFlow: citation-worthy, entity-structured content with a Human-in-the-Loop editorial pipeline.",
  icons: {
    icon: "/images/L_favicon.png",
  },
};

/** Root passes through; `[locale]/layout.tsx` owns `<html lang>` and `<body>`. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
