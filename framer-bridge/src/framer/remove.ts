import { withConnection } from "framer-api";
import type { BridgeConfig } from "../config.js";
import { publishAndMaybeDeploy, resolveManagedCollection } from "./collection.js";

export interface DeleteResult {
  action: "deleted";
  cmsId: string;
  event: string;
  removed: boolean;
  collectionId: string;
  collectionName: string;
  published: boolean;
  deployed: boolean;
  deploymentId?: string;
}

/**
 * Remove Managed Collection item by CMS post.id.
 * Unpublish and delete both map here. Idempotent when the item is already gone.
 */
export async function deletePostFromFramer(
  config: BridgeConfig,
  cmsId: string,
  event: string
): Promise<DeleteResult> {
  const id = cmsId.trim();
  if (!id) {
    throw new Error("post.id is required");
  }

  return withConnection(
    config.framerProjectUrl,
    async (framer) => {
      const collection = await resolveManagedCollection(framer, config.framerCollectionName);
      const existingIds = await collection.getItemIds();
      const exists = existingIds.includes(id);

      if (exists) {
        await collection.removeItems([id]);
      }

      const publish = await publishAndMaybeDeploy(framer, config.autoDeploy);

      return {
        action: "deleted" as const,
        cmsId: id,
        event,
        removed: exists,
        collectionId: collection.id,
        collectionName: collection.name,
        ...publish,
      };
    },
    config.framerApiKey
  );
}
