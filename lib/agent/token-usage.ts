import { resolveAssistantKey, type AiAssistantId } from "@/lib/agent/ai-assistants";
import { AsyncLocalStorage } from "node:async_hooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/uuid";

export type AiTokenUsageContext = {
  userId?: string | null;
  clientId?: string | null;
  postId?: string | null;
  assistant?: AiAssistantId | string | null;
};

const storage = new AsyncLocalStorage<AiTokenUsageContext>();

export function runWithAiUsageContext<T>(ctx: AiTokenUsageContext, fn: () => T): T {
  const parent = storage.getStore();
  return storage.run({ ...parent, ...ctx }, fn);
}

/** Merge context for the current async scope (e.g. set postId after row is created). */
export function bindAiUsageContext(ctx: Partial<AiTokenUsageContext>): void {
  const parent = storage.getStore() ?? {};
  storage.enterWith({ ...parent, ...ctx });
}

export function getAiUsageContext(): AiTokenUsageContext | undefined {
  return storage.getStore();
}

export type RecordAiTokenUsageParams = {
  operation: string;
  provider: string;
  model?: string | null;
  assistant?: AiAssistantId | string | null;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

const pendingUsageWrites: Promise<void>[] = [];

export async function flushAiTokenUsageWrites(): Promise<void> {
  if (pendingUsageWrites.length === 0) return;
  const batch = pendingUsageWrites.splice(0, pendingUsageWrites.length);
  await Promise.all(batch);
}

export function recordAiTokenUsage(params: RecordAiTokenUsageParams): void {
  const ctx = storage.getStore();
  const prompt = params.promptTokens ?? 0;
  const completion = params.completionTokens ?? 0;
  const total = params.totalTokens ?? prompt + completion;
  const assistant = resolveAssistantKey(
    params.assistant ?? ctx?.assistant ?? null,
    params.operation,
  );

  pendingUsageWrites.push(
    (async () => {
      try {
        const admin = createAdminClient();
        const userId = ctx?.userId && isUuid(ctx.userId) ? ctx.userId : null;
        const clientId = ctx?.clientId && isUuid(ctx.clientId) ? ctx.clientId : null;
        const postId = ctx?.postId && isUuid(ctx.postId) ? ctx.postId : null;
        await admin.from("ai_token_usage").insert({
          user_id: userId,
          client_id: clientId,
          post_id: postId,
          operation: params.operation,
          provider: params.provider,
          model: params.model ?? null,
          assistant,
          prompt_tokens: prompt,
          completion_tokens: completion,
          total_tokens: total,
        });
      } catch (e) {
        console.warn("[token-usage] failed to record:", e instanceof Error ? e.message : e);
      }
    })(),
  );
}
