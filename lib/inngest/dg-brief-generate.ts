import { inngest } from "./client";
import { executeAgentGeneratePost } from "@/lib/agent/execute-generate-post";
import type { Locale } from "@/lib/types/db";

type DgBriefGenEvent = {
  postId: string;
  locale: string;
  focusKeyword?: string | null;
};

/**
 * Runs the same pipeline as POST /api/agent/generate for a post created from a DG brief
 * (async, durable — avoids Vercel cutting off work after the brief HTTP response returns).
 */
export const dgBriefRunGeneration = inngest.createFunction(
  {
    id: "dg-brief-run-generation",
    name: "DG brief: run article generation",
    retries: 1,
    triggers: [{ event: "cms/dg-brief.run-generation" }],
  },
  async ({ event, step }) => {
    const { postId, locale, focusKeyword } = event.data as DgBriefGenEvent;
    if (locale !== "pt" && locale !== "en" && locale !== "fr") {
      throw new Error(`Invalid locale: ${locale}`);
    }

    const result = await step.run("generate-from-dg-brief", async () => {
      return executeAgentGeneratePost({
        postId,
        locale: locale as Locale,
        focusKeyword: focusKeyword ?? undefined,
        dgBrief: true,
      });
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    return { ok: true as const, postId };
  },
);
