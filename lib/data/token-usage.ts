"use server";

import { AI_ASSISTANTS, resolveAssistantKey, type AiAssistantId } from "@/lib/agent/ai-assistants";
import { estimateAiUsageCostUsd } from "@/lib/agent/ai-pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminForDataLoader } from "@/lib/auth";
import { isUuid } from "@/lib/uuid";

export type TokenUsageTotals = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  callCount: number;
  estimatedCostUsd: number;
};

export type TokenUsageByClient = {
  userId: string | null;
  clientId: string | null;
  accountName: string;
  domain: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  callCount: number;
  estimatedCostUsd: number;
  lastUsedAt: string | null;
};

export type TokenUsageByAssistant = {
  assistant: AiAssistantId;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  callCount: number;
  estimatedCostUsd: number;
  lastUsedAt: string | null;
};

export type TokenUsageReport = {
  tableMissing: boolean;
  totals: TokenUsageTotals;
  byAssistant: TokenUsageByAssistant[];
  byClient: TokenUsageByClient[];
};

type UsageRow = {
  user_id: string | null;
  client_id: string | null;
  assistant: string | null;
  operation: string;
  provider: string;
  model: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
};

function rowCostUsd(row: UsageRow): number {
  return estimateAiUsageCostUsd({
    provider: row.provider,
    model: row.model,
    operation: row.operation,
    promptTokens: row.prompt_tokens ?? 0,
    completionTokens: row.completion_tokens ?? 0,
    totalTokens: row.total_tokens ?? 0,
  });
}

function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("relation") && message.includes("does not exist")
  );
}

async function fetchUsageRows(sinceDays?: number): Promise<{ rows: UsageRow[]; tableMissing: boolean }> {
  await requireAdminForDataLoader();
  const admin = createAdminClient();
  let query = admin
    .from("ai_token_usage")
    .select(
      "user_id, client_id, assistant, operation, provider, model, prompt_tokens, completion_tokens, total_tokens, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50_000);
  if (sinceDays != null && sinceDays > 0) {
    const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", since);
  }
  const { data, error } = await query;

  if (error) {
    if (isMissingTableError(error.message)) {
      return { rows: [], tableMissing: true };
    }
    console.error("[token-usage] fetch:", error.message);
    return { rows: [], tableMissing: false };
  }
  return { rows: (data ?? []) as UsageRow[], tableMissing: false };
}

function aggregateTotals(rows: UsageRow[]): TokenUsageTotals {
  return rows.reduce(
    (acc, row) => ({
      promptTokens: acc.promptTokens + (row.prompt_tokens ?? 0),
      completionTokens: acc.completionTokens + (row.completion_tokens ?? 0),
      totalTokens: acc.totalTokens + (row.total_tokens ?? 0),
      callCount: acc.callCount + 1,
      estimatedCostUsd: acc.estimatedCostUsd + rowCostUsd(row),
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0, callCount: 0, estimatedCostUsd: 0 },
  );
}

function aggregateByAssistant(rows: UsageRow[]): TokenUsageByAssistant[] {
  const grouped = new Map<
    AiAssistantId,
    {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      callCount: number;
      estimatedCostUsd: number;
      lastUsedAt: string | null;
    }
  >();

  for (const row of rows) {
    const assistant = resolveAssistantKey(row.assistant, row.operation);
    const cost = rowCostUsd(row);
    const existing = grouped.get(assistant);
    if (existing) {
      existing.promptTokens += row.prompt_tokens ?? 0;
      existing.completionTokens += row.completion_tokens ?? 0;
      existing.totalTokens += row.total_tokens ?? 0;
      existing.callCount += 1;
      existing.estimatedCostUsd += cost;
      if (row.created_at && (!existing.lastUsedAt || row.created_at > existing.lastUsedAt)) {
        existing.lastUsedAt = row.created_at;
      }
    } else {
      grouped.set(assistant, {
        promptTokens: row.prompt_tokens ?? 0,
        completionTokens: row.completion_tokens ?? 0,
        totalTokens: row.total_tokens ?? 0,
        callCount: 1,
        estimatedCostUsd: cost,
        lastUsedAt: row.created_at ?? null,
      });
    }
  }

  const order = new Map<AiAssistantId, number>([
    ...AI_ASSISTANTS.map((id, i) => [id, i] as const),
    ["other", AI_ASSISTANTS.length],
  ]);

  return [...grouped.entries()]
    .map(([assistant, stats]) => ({ assistant, ...stats }))
    .sort((a, b) => {
      const orderDiff = (order.get(a.assistant) ?? 999) - (order.get(b.assistant) ?? 999);
      if (orderDiff !== 0) return orderDiff;
      return b.estimatedCostUsd - a.estimatedCostUsd;
    });
}

async function aggregateByClient(rows: UsageRow[]): Promise<TokenUsageByClient[]> {
  if (rows.length === 0) return [];

  const grouped = new Map<
    string,
    {
      userId: string | null;
      clientId: string | null;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      callCount: number;
      estimatedCostUsd: number;
      lastUsedAt: string | null;
    }
  >();

  for (const row of rows) {
    const key = `${row.user_id ?? ""}:${row.client_id ?? ""}`;
    const cost = rowCostUsd(row);
    const existing = grouped.get(key);
    if (existing) {
      existing.promptTokens += row.prompt_tokens ?? 0;
      existing.completionTokens += row.completion_tokens ?? 0;
      existing.totalTokens += row.total_tokens ?? 0;
      existing.callCount += 1;
      existing.estimatedCostUsd += cost;
      if (row.created_at && (!existing.lastUsedAt || row.created_at > existing.lastUsedAt)) {
        existing.lastUsedAt = row.created_at;
      }
    } else {
      grouped.set(key, {
        userId: row.user_id,
        clientId: row.client_id,
        promptTokens: row.prompt_tokens ?? 0,
        completionTokens: row.completion_tokens ?? 0,
        totalTokens: row.total_tokens ?? 0,
        callCount: 1,
        estimatedCostUsd: cost,
        lastUsedAt: row.created_at ?? null,
      });
    }
  }

  const usageRows = [...grouped.values()].sort((a, b) => b.totalTokens - a.totalTokens);

  const userIds = [...new Set(usageRows.map((r) => r.userId).filter((id): id is string => !!id && isUuid(id)))];
  const clientIds = [...new Set(usageRows.map((r) => r.clientId).filter((id): id is string => !!id && isUuid(id)))];

  const clientsByUser = new Map<
    string,
    { company_name: string | null; brand_name: string | null; domain: string | null }
  >();
  const clientsById = new Map<
    string,
    { user_id: string; company_name: string | null; brand_name: string | null; domain: string | null }
  >();

  const admin = createAdminClient();
  if (userIds.length > 0) {
    const { data: clients } = await admin
      .from("clients")
      .select("id, user_id, company_name, brand_name, domain")
      .in("user_id", userIds);
    for (const c of clients ?? []) {
      clientsByUser.set(c.user_id, c);
      clientsById.set(c.id, c);
    }
  }
  if (clientIds.length > 0) {
    const { data: extra } = await admin
      .from("clients")
      .select("id, user_id, company_name, brand_name, domain")
      .in("id", clientIds);
    for (const c of extra ?? []) {
      clientsByUser.set(c.user_id, c);
      clientsById.set(c.id, c);
    }
  }

  return usageRows.map((row) => {
    const client =
      (row.clientId ? clientsById.get(row.clientId) : null) ??
      (row.userId ? clientsByUser.get(row.userId) : null);
    const accountName =
      client?.company_name?.trim() ||
      client?.brand_name?.trim() ||
      client?.domain?.trim() ||
      "—";
    return {
      userId: row.userId,
      clientId: row.clientId,
      accountName,
      domain: client?.domain ?? null,
      promptTokens: row.promptTokens,
      completionTokens: row.completionTokens,
      totalTokens: row.totalTokens,
      callCount: row.callCount,
      estimatedCostUsd: row.estimatedCostUsd,
      lastUsedAt: row.lastUsedAt,
    };
  });
}

/** Single fetch for totals + per-client breakdown (avoids duplicate queries). */
export async function getTokenUsageReport(options?: { sinceDays?: number }): Promise<TokenUsageReport> {
  const { rows, tableMissing } = await fetchUsageRows(options?.sinceDays ?? 90);
  const [totals, byAssistant, byClient] = await Promise.all([
    Promise.resolve(aggregateTotals(rows)),
    Promise.resolve(aggregateByAssistant(rows)),
    aggregateByClient(rows),
  ]);
  return { tableMissing, totals, byAssistant, byClient };
}

/** @deprecated Use getTokenUsageReport */
export async function getTokenUsageTotals(): Promise<TokenUsageTotals> {
  const report = await getTokenUsageReport();
  return report.totals;
}

/** @deprecated Use getTokenUsageReport */
export async function getTokenUsageByClient(): Promise<TokenUsageByClient[]> {
  const report = await getTokenUsageReport();
  return report.byClient;
}
