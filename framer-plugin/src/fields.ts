import type { ManagedCollectionFieldInput } from "@framer/plugin"

/**
 * Field names MUST match framer-bridge EXPECTED_FIELDS (case-insensitive name match).
 * IDs are stable so canvas bindings survive renames of the display name.
 */
export const FIELD_DEFS = [
    { id: "witflow_title", name: "title", type: "string" as const },
    { id: "witflow_excerpt", name: "excerpt", type: "string" as const },
    {
        id: "witflow_content",
        name: "content",
        type: "formattedText" as const,
        contentType: "markdown" as const,
    },
    { id: "witflow_cover", name: "cover", type: "image" as const },
    { id: "witflow_seoTitle", name: "seoTitle", type: "string" as const },
    { id: "witflow_metaDescription", name: "metaDescription", type: "string" as const },
] as const

export type FieldDefId = (typeof FIELD_DEFS)[number]["id"]

export function getManagedCollectionFields(): ManagedCollectionFieldInput[] {
    return FIELD_DEFS.map(field => ({ ...field }))
}

export const FIELD_IDS = Object.fromEntries(FIELD_DEFS.map(field => [field.name, field.id])) as Record<
    (typeof FIELD_DEFS)[number]["name"],
    string
>
