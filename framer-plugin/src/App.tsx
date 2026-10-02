import "./App.css"

import type { ManagedCollection } from "@framer/plugin"
import { Configure } from "./Configure"

interface AppProps {
    collection: ManagedCollection
}

export function App({ collection }: AppProps) {
    return <Configure collection={collection} />
}
