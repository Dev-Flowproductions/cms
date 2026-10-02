import {
    framer,
    type ManagedCollection,
    type ProtectedMethod,
} from "@framer/plugin"
import { getManagedCollectionFields } from "./fields"
import { buildCmsToFramerLocaleMap } from "./locales"
import { mapApiPostToItem } from "./map-api-post"
import {
    loadSettings,
    PLUGIN_KEYS,
    type PluginSettings,
    saveSettings,
    settingsAreComplete,
} from "./storage"
import { fetchAllPublishedPosts } from "./witflow-api"

export const syncMethods = [
    "ManagedCollection.addItems",
    "ManagedCollection.setPluginData",
] as const satisfies ProtectedMethod[]

export const configureMethods = [
    "ManagedCollection.setFields",
    ...syncMethods,
] as const satisfies ProtectedMethod[]

export interface SyncResult {
    upserted: number
    errors: string[]
}

/**
 * Pull published posts from Witflow Content API and upsert into the Managed Collection.
 * Multi-locale via valueByLocale. Does NOT remove orphan items (deletes = bridge webhook).
 */
export async function syncCollection(
    collection: ManagedCollection,
    settings: PluginSettings,
    signal?: AbortSignal
): Promise<SyncResult> {
    if (!settingsAreComplete(settings)) {
        throw new Error("CMS base URL, Site ID, and API key are required.")
    }

    const posts = await fetchAllPublishedPosts(
        settings.cmsBaseUrl,
        settings.siteId,
        settings.apiKey,
        signal
    )

    const framerLocales = await framer.getLocales()
    const { map: localeMap } = buildCmsToFramerLocaleMap(framerLocales)

    const items = []
    const errors: string[] = []

    for (const post of posts) {
        if (!post.id?.trim()) {
            errors.push(`${post.slug || "(no slug)"}: missing id`)
            continue
        }
        try {
            items.push(mapApiPostToItem(post, settings.defaultLocale, localeMap))
        } catch (error) {
            const message = error instanceof Error ? error.message : "map failed"
            errors.push(`${post.slug || post.id}: ${message}`)
        }
    }

    if (items.length > 0) {
        await collection.addItems(items)
    }

    await collection.setPluginData(PLUGIN_KEYS.LAST_SYNCED_AT, new Date().toISOString())

    return { upserted: items.length, errors }
}

export async function applyFieldsAndSave(
    collection: ManagedCollection,
    settings: PluginSettings
): Promise<void> {
    await collection.setFields(getManagedCollectionFields())
    await saveSettings(collection, settings)
}

export async function syncExistingCollection(collection: ManagedCollection): Promise<{ didSync: boolean }> {
    if (framer.mode !== "syncManagedCollection") {
        return { didSync: false }
    }

    if (!framer.isAllowedTo(...syncMethods)) {
        framer.notify("Insufficient permissions to sync this collection.", { variant: "error" })
        return { didSync: false }
    }

    const settings = await loadSettings(collection)

    if (!settingsAreComplete(settings)) {
        framer.notify("Configure CMS base URL, Site ID, and API key first.", { variant: "error" })
        return { didSync: false }
    }

    try {
        const result = await syncCollection(collection, settings)
        const suffix = result.errors.length > 0 ? ` (${result.errors.length} errors)` : ""
        framer.closePlugin(`Synced ${result.upserted} posts${suffix}`, {
            variant: result.errors.length > 0 ? "warning" : "success",
        })
        return { didSync: true }
    } catch (error) {
        console.error(error)
        const message = error instanceof Error ? error.message : "Sync failed"
        framer.notify(message, { variant: "error" })
        return { didSync: false }
    }
}
