const ARTICLE_TYPES = new Set(["BlogPosting", "Article", "NewsArticle"]);

function patchArticleLikeNode(
  node: Record<string, unknown>,
  datePublished: string,
  dateModified: string,
): void {
  const types = node["@type"];
  const typeStr =
    typeof types === "string"
      ? types
      : Array.isArray(types)
        ? (types.find((t) => typeof t === "string") as string | undefined)
        : undefined;
  if (!typeStr || !ARTICLE_TYPES.has(typeStr)) return;
  node.datePublished = datePublished;
  node.dateModified = dateModified;
}

/**
 * Align JSON-LD article dates with real publish metadata.
 * Stored `jsonld` from generation often uses the draft/generation timestamp; webhooks and DB should use
 * canonical `published_at` for datePublished (first vs subsequent publish) and the current moment for dateModified.
 */
export function applyPublishTimestampsToJsonLd(
  jsonld: unknown,
  dates: { datePublished: string; dateModified: string },
): unknown {
  if (jsonld == null || typeof jsonld !== "object") return jsonld;
  try {
    const clone = JSON.parse(JSON.stringify(jsonld)) as Record<string, unknown>;
    const graph = clone["@graph"];
    if (Array.isArray(graph)) {
      for (const node of graph) {
        if (node && typeof node === "object") {
          patchArticleLikeNode(node as Record<string, unknown>, dates.datePublished, dates.dateModified);
        }
      }
    } else {
      patchArticleLikeNode(clone, dates.datePublished, dates.dateModified);
    }
    return clone;
  } catch {
    return jsonld;
  }
}
