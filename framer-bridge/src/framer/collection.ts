import type { ManagedCollection } from "framer-api";

export async function resolveManagedCollection(
  framer: {
    getManagedCollections(): Promise<ManagedCollection[]>;
  },
  name: string
): Promise<ManagedCollection> {
  const collections = await framer.getManagedCollections();
  const match = collections.find(
    (collection) => collection.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (!match) {
    const available = collections.map((c) => c.name).join(", ") || "(none)";
    throw new Error(
      `Managed Collection "${name}" not found. Available: ${available}. ` +
        "Expected a Managed Collection (custom item ids = CMS post.id)."
    );
  }
  return match;
}

export async function publishAndMaybeDeploy(
  framer: {
    publish(): Promise<{ deployment?: { id: string } }>;
    deploy(deploymentId: string): Promise<unknown>;
  },
  autoDeploy: boolean
): Promise<{ published: boolean; deployed: boolean; deploymentId?: string }> {
  const publishResult = await framer.publish();
  const deploymentId = publishResult.deployment?.id;
  let deployed = false;

  if (autoDeploy && deploymentId) {
    await framer.deploy(deploymentId);
    deployed = true;
  }

  return { published: true, deployed, deploymentId };
}
