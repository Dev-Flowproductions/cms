"use client";

import { useTheme } from "@/components/ThemeProvider";

type Props = {
  className?: string;
  alt?: string;
};

/** Witflow logo: L_01 (light mode), L_02 (dark mode). */
export function AppLogo({ className = "h-8 w-auto object-contain", alt = "Witflow" }: Props) {
  const { theme } = useTheme();
  const src = theme === "dark" ? "/images/L_02.png" : "/images/L_01.png";
  return <img src={src} alt={alt} className={className} />;
}
