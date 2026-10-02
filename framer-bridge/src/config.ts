import { parseLocaleMapEnv, type FramerLocaleMap } from "./map/locales.js";

export type CmsLocale = "pt" | "en" | "fr";

export interface BridgeConfig {
  framerApiKey: string;
  framerProjectUrl: string;
  framerCollectionName: string;
  webhookSecret: string;
  defaultLocale: CmsLocale;
  /** Optional CMS→Framer locale id overrides from FRAMER_LOCALE_MAP */
  localeMapOverride: FramerLocaleMap;
  autoDeploy: boolean;
  port: number;
  host: string;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseLocale(value: string | undefined): CmsLocale {
  const locale = (value ?? "en").trim().toLowerCase();
  if (locale === "pt" || locale === "en" || locale === "fr") {
    return locale;
  }
  throw new Error(`DEFAULT_LOCALE must be pt, en, or fr (got: ${value ?? ""})`);
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new Error(`Invalid boolean env value: ${value}`);
}

export function loadConfig(): BridgeConfig {
  return {
    framerApiKey: required("FRAMER_API_KEY"),
    framerProjectUrl: required("FRAMER_PROJECT_URL"),
    framerCollectionName: required("FRAMER_COLLECTION_NAME"),
    webhookSecret: required("WEBHOOK_SECRET"),
    defaultLocale: parseLocale(process.env.DEFAULT_LOCALE),
    localeMapOverride: parseLocaleMapEnv(process.env.FRAMER_LOCALE_MAP),
    autoDeploy: parseBool(process.env.FRAMER_AUTO_DEPLOY, true),
    port: Number.parseInt(process.env.PORT ?? "8787", 10) || 8787,
    host: process.env.HOST?.trim() || "0.0.0.0",
  };
}
