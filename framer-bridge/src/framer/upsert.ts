import { withConnection, type ManagedCollectionItemInput } from "framer-api";
import type { BridgeConfig, CmsLocale } from "../config.js";
import { buildFieldDataMultiLocale, buildFieldMap } from "../map/fields.js";
import { buildCmsToFramerLocaleMap } from "../map/locales.js";
import { collectLocaleContents, resolveLocaleContent, slugify } from "../map/post-to-item.js";
import type { WebhookPost } from "../webhook/types.js";
import { publishAndMaybeDeploy, resolveManagedCollection } from "./collection.js";

export interface UpsertResult {
  action: "upserted";
  cmsId: string;
  slug: string;
  locale: string;
  localesApplied: CmsLocale[];
  localesSkipped: string[];
  collectionId: string;
  collectionName: string;
  fieldsUsed: string[];
  fieldsSkipped: string[];
  published: boolean;
  deployed: boolean;
  deploymentId?: string;
}

export async function upsertPostToFramer(
  config: BridgeConfig,
  post: WebhookPost
): Promise<UpsertResult> {
  if (!post.id?.trim()) {
    throw new Error("post.id is required");
  }

  const byLocale = collectLocaleContents(post);
  const base = resolveLocaleContent(post, config.defaultLocale);
  // Prefer configured default when that locale exists in the payload
  const baseContent = byLocale[config.defaultLocale] ?? base;
  const slug = (post.slug?.trim() && slugify(post.slug)) || slugify(baseContent.title);

  return withConnection(
    config.framerProjectUrl,
    async (framer) => {
      const collection = await resolveManagedCollection(framer, config.framerCollectionName);
      const fields = await collection.getFields();
      const fieldMap = buildFieldMap(fields);

      if (!fieldMap.byKey.title) {
        throw new Error(
          `Managed Collection "${collection.name}" is missing required field "title". ` +
            `Missing mapped fields: ${fieldMap.missing.join(", ") || "(none)"}`
        );
      }

      const framerLocales = await framer.getLocales();
      const { map: localeMap, skipped: mapSkipped } = buildCmsToFramerLocaleMap(
        framerLocales,
        config.localeMapOverride
      );

      const { fieldData, statusByLocale, used, skipped, localesApplied, localesSkipped } =
        buildFieldDataMultiLocale(fieldMap, baseContent, byLocale, localeMap);

      const item: ManagedCollectionItemInput = {
        id: post.id,
        slug,
        fieldData,
        ...(Object.keys(statusByLocale).length > 0 ? { statusByLocale } : {}),
      };

      await collection.addItems([item]);

      const publish = await publishAndMaybeDeploy(framer, config.autoDeploy);

      return {
        action: "upserted" as const,
        cmsId: post.id,
        slug,
        locale: baseContent.locale,
        localesApplied,
        localesSkipped: [...localesSkipped, ...mapSkipped],
        collectionId: collection.id,
        collectionName: collection.name,
        fieldsUsed: used,
        fieldsSkipped: [...fieldMap.missing.map((k) => `${k}(missing)`), ...skipped],
        ...publish,
      };
    },
    config.framerApiKey
  );
}
