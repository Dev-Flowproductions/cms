import "@framer/plugin/framer.css"

import { framer } from "@framer/plugin"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
import { syncExistingCollection } from "./sync"

const activeCollection = await framer.getActiveManagedCollection()
const { didSync } = await syncExistingCollection(activeCollection)

if (!didSync) {
    const root = document.getElementById("root")
    if (!root) throw new Error("Root element not found")

    createRoot(root).render(
        <StrictMode>
            <App collection={activeCollection} />
        </StrictMode>
    )
}
