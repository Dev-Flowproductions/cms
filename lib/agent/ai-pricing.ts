/**
 * Estimated USD cost from provider-reported token usage + flat image fees.
 * Rates are approximate list prices; override via env for your contract if needed.
 */

export type AiUsageCostInput = {
  provider: string;
  model?: string | null;
  operation: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

type TokenRates = { inputPer1M: number; outputPer1M: number };

/** Flat fee per successful image generation (Responses orchestrator tokens billed separately). */
const DEFAULT_IMAGE_CALL_USD = 0.12;

const OPENAI_RATES: Array<{ prefix: string; rates: TokenRates }> = [
  { prefix: "gpt-4.1-mini", rates: { inputPer1M: 0.4, outputPer1M: 1.6 } },
  { prefix: "gpt-4.1", rates: { inputPer1M: 2, outputPer1M: 8 } },
  { prefix: "gpt-4o-mini", rates: { inputPer1M: 0.15, outputPer1M: 0.6 } },
  { prefix: "gpt-4o", rates: { inputPer1M: 2.5, outputPer1M: 10 } },
  { prefix: "gpt-5.5", rates: { inputPer1M: 1.25, outputPer1M: 10 } },
  { prefix: "gpt-5", rates: { inputPer1M: 1.25, outputPer1M: 10 } },
  { prefix: "text-embedding-3-large", rates: { inputPer1M: 0.13, outputPer1M: 0 } },
  { prefix: "text-embedding-3-small", rates: { inputPer1M: 0.02, outputPer1M: 0 } },
  { prefix: "text-embedding-ada-002", rates: { inputPer1M: 0.1, outputPer1M: 0 } },
];

const GEMINI_RATES: Array<{ prefix: string; rates: TokenRates }> = [
  { prefix: "gemini-3.1-flash-lite", rates: { inputPer1M: 0.075, outputPer1M: 0.3 } },
  { prefix: "gemini-2.5-flash", rates: { inputPer1M: 0.15, outputPer1M: 0.6 } },
  { prefix: "gemini-2.0-flash", rates: { inputPer1M: 0.1, outputPer1M: 0.4 } },
  { prefix: "gemini-embedding", rates: { inputPer1M: 0.025, outputPer1M: 0 } },
];

function normalizeModel(model: string | null | undefined): string {
  return (model ?? "").trim().toLowerCase();
}

function resolveTokenRates(provider: string, model: string): TokenRates | null {
  const table = provider === "gemini" ? GEMINI_RATES : OPENAI_RATES;
  for (const { prefix, rates } of table) {
    if (model === prefix || model.startsWith(prefix)) return rates;
  }
  if (provider === "openai") return { inputPer1M: 1, outputPer1M: 4 };
  if (provider === "gemini") return { inputPer1M: 0.1, outputPer1M: 0.4 };
  return null;
}

function imageCallUsd(): number {
  const raw = process.env.AI_IMAGE_COST_USD?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return DEFAULT_IMAGE_CALL_USD;
}

export function estimateAiUsageCostUsd(input: AiUsageCostInput): number {
  const provider = input.provider.trim().toLowerCase() || "openai";
  const operation = input.operation.trim().toLowerCase();
  const model = normalizeModel(input.model);
  const prompt = input.promptTokens ?? 0;
  const completion = input.completionTokens ?? 0;
  const total = input.totalTokens ?? prompt + completion;

  let cost = 0;

  const rates = resolveTokenRates(provider, model);
  if (rates) {
    const inputTokens = prompt > 0 ? prompt : operation === "embedding" ? total : prompt;
    cost += (inputTokens / 1_000_000) * rates.inputPer1M;
    cost += (completion / 1_000_000) * rates.outputPer1M;
  }

  if (operation === "image") {
    cost += imageCallUsd();
  }

  return cost;
}

/** USD → EUR multiplier (API list prices are USD). Override with AI_USD_TO_EUR. */
const DEFAULT_USD_TO_EUR = 0.92;

export function getUsdToEurRate(): number {
  const raw = process.env.AI_USD_TO_EUR?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return DEFAULT_USD_TO_EUR;
}

export function convertUsdToEur(usd: number): number {
  return usd * getUsdToEurRate();
}

export function formatEur(amountEur: number, locale?: string): string {
  const abs = Math.abs(amountEur);
  const fractionDigits = abs > 0 && abs < 0.01 ? 4 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amountEur);
}

/** Format a USD-denominated estimate as EUR for display. */
export function formatAiCostEur(usdAmount: number, locale?: string): string {
  return formatEur(convertUsdToEur(usdAmount), locale);
}
