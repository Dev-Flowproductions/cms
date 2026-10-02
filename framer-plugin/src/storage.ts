import type { ManagedCollection } from "@framer/plugin"

export type CmsLocale = "pt" | "en" | "fr"

export const PLUGIN_KEYS = {
    CMS_BASE_URL: "cms_base_url",
    SITE_ID: "site_id",
    API_KEY: "api_key",
    DEFAULT_LOCALE: "default_locale",
    LAST_SYNCED_AT: "last_synced_at",
} as const

export interface PluginSettings {
    cmsBaseUrl: string
    siteId: string
    apiKey: string
    defaultLocale: CmsLocale
}

export function isCmsLocale(value: string): value is CmsLocale {
    return value === "pt" || value === "en" || value === "fr"
}

export async function loadSettings(collection: ManagedCollection): Promise<PluginSettings> {
    const [cmsBaseUrl, siteId, apiKey, defaultLocaleRaw] = await Promise.all([
        collection.getPluginData(PLUGIN_KEYS.CMS_BASE_URL),
        collection.getPluginData(PLUGIN_KEYS.SITE_ID),
        collection.getPluginData(PLUGIN_KEYS.API_KEY),
        collection.getPluginData(PLUGIN_KEYS.DEFAULT_LOCALE),
    ])

    const localeCandidate = defaultLocaleRaw?.trim().toLowerCase() ?? ""
    const defaultLocale: CmsLocale = isCmsLocale(localeCandidate) ? localeCandidate : "en"

    return {
        cmsBaseUrl: cmsBaseUrl?.trim() ?? "",
        siteId: siteId?.trim() ?? "",
        apiKey: apiKey?.trim() ?? "",
        defaultLocale,
    }
}

export async function saveSettings(collection: ManagedCollection, settings: PluginSettings): Promise<void> {
    await collection.setPluginData(PLUGIN_KEYS.CMS_BASE_URL, settings.cmsBaseUrl.trim())
    await collection.setPluginData(PLUGIN_KEYS.SITE_ID, settings.siteId.trim())
    await collection.setPluginData(PLUGIN_KEYS.API_KEY, settings.apiKey.trim())
    await collection.setPluginData(PLUGIN_KEYS.DEFAULT_LOCALE, settings.defaultLocale)
}

export function settingsAreComplete(settings: PluginSettings): boolean {
    return Boolean(settings.cmsBaseUrl && settings.siteId && settings.apiKey)
}
