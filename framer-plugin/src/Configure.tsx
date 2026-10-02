import { framer, type ManagedCollection, useIsAllowedTo } from "@framer/plugin"
import { useEffect, useState } from "react"
import {
    type CmsLocale,
    loadSettings,
    type PluginSettings,
    settingsAreComplete,
} from "./storage"
import { applyFieldsAndSave, configureMethods, syncCollection } from "./sync"
import { testConnection } from "./witflow-api"

interface ConfigureProps {
    collection: ManagedCollection
}

type BusyState = "idle" | "saving" | "testing" | "syncing"

export function Configure({ collection }: ConfigureProps) {
    const [settings, setSettings] = useState<PluginSettings | null>(null)
    const [busy, setBusy] = useState<BusyState>("idle")
    const canManage = useIsAllowedTo(...configureMethods)

    useEffect(() => {
        let cancelled = false
        loadSettings(collection)
            .then(value => {
                if (!cancelled) setSettings(value)
            })
            .catch(error => {
                console.error(error)
                framer.notify("Failed to load saved settings.", { variant: "error" })
                if (!cancelled) {
                    setSettings({
                        cmsBaseUrl: "",
                        siteId: "",
                        apiKey: "",
                        defaultLocale: "en",
                    })
                }
            })
        return () => {
            cancelled = true
        }
    }, [collection])

    useEffect(() => {
        framer.showUI({
            width: 360,
            height: 520,
            minWidth: 320,
            minHeight: 480,
            resizable: true,
        })
    }, [])

    if (!settings) {
        return (
            <main className="loading">
                <div className="framer-spinner" />
            </main>
        )
    }

    const update = <K extends keyof PluginSettings>(key: K, value: PluginSettings[K]) => {
        setSettings(current => (current ? { ...current, [key]: value } : current))
    }

    const handleSave = async () => {
        if (!canManage) {
            framer.notify("Insufficient permissions.", { variant: "error" })
            return
        }
        try {
            setBusy("saving")
            await applyFieldsAndSave(collection, settings)
            framer.notify("Settings saved. Collection fields applied.", { variant: "success" })
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Save failed"
            framer.notify(message, { variant: "error" })
        } finally {
            setBusy("idle")
        }
    }

    const handleTest = async () => {
        if (!settingsAreComplete(settings)) {
            framer.notify("Fill CMS base URL, Site ID, and API key first.", { variant: "warning" })
            return
        }
        try {
            setBusy("testing")
            await testConnection(settings.cmsBaseUrl, settings.siteId, settings.apiKey)
            framer.notify("Connection OK.", { variant: "success" })
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Connection failed"
            framer.notify(message, { variant: "error" })
        } finally {
            setBusy("idle")
        }
    }

    const handleSync = async () => {
        if (!canManage) {
            framer.notify("Insufficient permissions.", { variant: "error" })
            return
        }
        if (!settingsAreComplete(settings)) {
            framer.notify("Fill CMS base URL, Site ID, and API key first.", { variant: "warning" })
            return
        }
        try {
            setBusy("syncing")
            await applyFieldsAndSave(collection, settings)
            const result = await syncCollection(collection, settings)
            const suffix = result.errors.length > 0 ? ` (${result.errors.length} errors — see console)` : ""
            if (result.errors.length > 0) {
                console.warn("Sync errors:", result.errors)
            }
            framer.notify(`Synced ${result.upserted} posts${suffix}`, {
                variant: result.errors.length > 0 ? "warning" : "success",
            })
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Sync failed"
            framer.notify(message, { variant: "error" })
        } finally {
            setBusy("idle")
        }
    }

    const disabled = busy !== "idle" || !canManage

    return (
        <main className="configure framer-hide-scrollbar">
            <div className="intro compact">
                <div className="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none">
                        <title>Witflow CMS</title>
                        <path
                            fill="currentColor"
                            d="M15.5 8c3.59 0 6.5 1.38 6.5 3.083 0 1.702-2.91 3.082-6.5 3.082S9 12.785 9 11.083C9 9.38 11.91 8 15.5 8Zm6.5 7.398c0 1.703-2.91 3.083-6.5 3.083S9 17.101 9 15.398v-2.466c0 1.703 2.91 3.083 6.5 3.083s6.5-1.38 6.5-3.083Zm0 4.316c0 1.703-2.91 3.083-6.5 3.083S9 21.417 9 19.714v-2.466c0 1.702 2.91 3.083 6.5 3.083S22 18.95 22 17.248Z"
                        />
                    </svg>
                </div>
                <div className="content">
                    <h2>Witflow CMS</h2>
                    <p>Configure the Managed Collection, then Sync now or rely on the bridge webhook.</p>
                </div>
            </div>

            <form
                onSubmit={event => {
                    event.preventDefault()
                    void handleSave()
                }}
            >
                <label htmlFor="cmsBaseUrl">
                    CMS base URL
                    <input
                        id="cmsBaseUrl"
                        type="url"
                        placeholder="https://your-cms.example"
                        value={settings.cmsBaseUrl}
                        onChange={event => update("cmsBaseUrl", event.target.value)}
                        disabled={disabled}
                        required
                    />
                </label>

                <label htmlFor="siteId">
                    Site ID
                    <input
                        id="siteId"
                        type="text"
                        placeholder="Client UUID"
                        value={settings.siteId}
                        onChange={event => update("siteId", event.target.value)}
                        disabled={disabled}
                        required
                    />
                </label>

                <label htmlFor="apiKey">
                    API key
                    <input
                        id="apiKey"
                        type="password"
                        autoComplete="off"
                        value={settings.apiKey}
                        onChange={event => update("apiKey", event.target.value)}
                        disabled={disabled}
                        required
                    />
                </label>

                <label htmlFor="defaultLocale">
                    Default locale (base value)
                    <select
                        id="defaultLocale"
                        value={settings.defaultLocale}
                        onChange={event => update("defaultLocale", event.target.value as CmsLocale)}
                        disabled={disabled}
                    >
                        <option value="en">en</option>
                        <option value="pt">pt</option>
                        <option value="fr">fr</option>
                    </select>
                </label>
                <p className="field-hint">
                    Sync writes pt/en/fr into Framer Localization when those locales exist on the
                    project (auto-match by code/slug). Default locale is the item base language.
                </p>

                <aside className="help-box">
                    <strong>Content sync</strong>
                    <p>
                        Use <strong>Sync now</strong> to pull published posts from Witflow. For local
                        CMS, use an HTTPS base URL (e.g. tunnel) — <code>http://localhost</code> fails
                        in the Framer plugin (mixed content / CORS).
                    </p>
                    <p className="muted">
                        Realtime Publish via <code>framer-bridge</code> is{" "}
                        <strong>fallback A</strong> on Dev Managed Collections: Server API may not
                        see this collection. Prefer Sync until dual-write is re-validated.
                    </p>
                </aside>

                <footer className="actions">
                    <button type="submit" disabled={disabled} title={canManage ? undefined : "Insufficient permissions"}>
                        {busy === "saving" ? <div className="framer-spinner" /> : "Save"}
                    </button>
                    <button type="button" disabled={disabled} onClick={() => void handleTest()}>
                        {busy === "testing" ? <div className="framer-spinner" /> : "Test connection"}
                    </button>
                    <button type="button" className="primary" disabled={disabled} onClick={() => void handleSync()}>
                        {busy === "syncing" ? <div className="framer-spinner" /> : "Sync now"}
                    </button>
                </footer>
            </form>
        </main>
    )
}
