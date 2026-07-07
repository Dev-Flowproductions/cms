"use client";

import { useSyncExternalStore } from "react";

type Props = {
  className?: string;
  alt?: string;
};

function readTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribeTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/** Witflow logo: L_01 (light mode), L_02 (dark mode). */
export function AppLogo({ className = "h-8 w-auto object-contain", alt = "Witflow" }: Props) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark");
  const src = theme === "dark" ? "/images/L_02.png" : "/images/L_01.png";
  return <img src={src} alt={alt} className={className} />;
}
