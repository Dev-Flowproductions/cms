import { getTranslations } from "next-intl/server";
import { formatAiCostEur } from "@/lib/agent/ai-pricing";
import { Link } from "@/lib/navigation";
import { getTokenUsageReport } from "@/lib/data/token-usage";

function formatTokens(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function AdminTokenUsagePage() {
  const t = await getTranslations("admin.tokenUsage");
  const { tableMissing, totals, byAssistant, byClient } = await getTokenUsageReport();

  return (
    <div className="min-w-0 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--adm-on-surface)" }}>
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
          {t("subtitle")}
        </p>
      </div>

      {tableMissing && (
        <div
          className="admin-shell-glass mb-8 rounded-2xl border px-5 py-4"
          style={{
            borderColor: "rgba(245,158,11,0.35)",
            background: "rgba(245,158,11,0.08)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "#b45309" }}>
            {t("tableMissingTitle")}
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
            {t("tableMissingBody")}
          </p>
          <p className="mt-3 text-xs font-mono" style={{ color: "var(--adm-on-variant)" }}>
            supabase/migrations/20260526120000_ai_token_usage.sql
          </p>
          <a
            href="https://supabase.com/dashboard/project/lltufugrmmzdagqypscg/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: "var(--adm-primary)" }}
          >
            {t("tableMissingCta")}
          </a>
        </div>
      )}

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: t("estimatedCost"), value: formatAiCostEur(totals.estimatedCostUsd), highlight: true },
          { label: t("totalTokens"), value: formatTokens(totals.totalTokens) },
          { label: t("promptTokens"), value: formatTokens(totals.promptTokens) },
          { label: t("completionTokens"), value: formatTokens(totals.completionTokens) },
          { label: t("apiCalls"), value: formatTokens(totals.callCount) },
        ].map((stat) => {
          const highlight = "highlight" in stat && stat.highlight;
          return (
          <div
            key={stat.label}
            className="admin-shell-glass rounded-2xl border p-5"
            style={{ borderColor: "var(--adm-border-subtle)" }}
          >
            <div
              className="text-2xl font-bold tabular-nums"
              style={{ color: highlight ? "var(--adm-primary)" : "var(--adm-on-surface)" }}
            >
              {stat.value}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
              {stat.label}
            </div>
          </div>
          );
        })}
      </div>

      <div
        className="admin-shell-glass mb-10 overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--adm-border-subtle)" }}
      >
        <div
          className="border-b px-4 py-3"
          style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
        >
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
            {t("byAssistantTitle")}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--adm-border-subtle)" }}>
                {[
                  t("colAssistant"),
                  t("colCost"),
                  t("colTotal"),
                  t("colPrompt"),
                  t("colCompletion"),
                  t("colCalls"),
                  t("colLastUsed"),
                ].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--adm-on-variant)" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byAssistant.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--adm-on-variant)" }}
                  >
                    {tableMissing ? t("tableMissingEmpty") : t("empty")}
                  </td>
                </tr>
              ) : (
                byAssistant.map((row, idx) => (
                  <tr
                    key={row.assistant}
                    className="adm-row-hover"
                    style={{
                      background: idx % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderTop: "1px solid var(--adm-border-subtle)",
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--adm-on-surface)" }}>
                      {t.has(`assistant.${row.assistant}`)
                        ? t(`assistant.${row.assistant}`)
                        : row.assistant}
                    </td>
                    <td
                      className="px-4 py-3 tabular-nums font-semibold"
                      style={{ color: "var(--adm-primary)" }}
                    >
                      {formatAiCostEur(row.estimatedCostUsd)}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: "var(--adm-on-surface)" }}>
                      {formatTokens(row.totalTokens)}
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--adm-on-variant)" }}>
                      {formatTokens(row.promptTokens)}
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--adm-on-variant)" }}>
                      {formatTokens(row.completionTokens)}
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--adm-on-variant)" }}>
                      {formatTokens(row.callCount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--adm-on-variant)" }}>
                      {formatDate(row.lastUsedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="admin-shell-glass overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--adm-border-subtle)" }}
      >
        <div
          className="border-b px-4 py-3"
          style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
        >
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
            {t("byClientTitle")}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--adm-border-subtle)" }}>
                {[
                  t("colAccount"),
                  t("colDomain"),
                  t("colCost"),
                  t("colTotal"),
                  t("colPrompt"),
                  t("colCompletion"),
                  t("colCalls"),
                  t("colLastUsed"),
                ].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--adm-on-variant)" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byClient.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--adm-on-variant)" }}
                  >
                    {tableMissing ? t("tableMissingEmpty") : t("empty")}
                  </td>
                </tr>
              ) : (
                byClient.map((row, idx) => (
                  <tr
                    key={`${row.userId ?? "none"}-${row.clientId ?? "none"}`}
                    className="adm-row-hover"
                    style={{
                      background: idx % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderTop: "1px solid var(--adm-border-subtle)",
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--adm-on-surface)" }}>
                      {row.userId ? (
                        <Link
                          href={`/admin/posts?user=${encodeURIComponent(row.userId)}`}
                          className="hover:text-[color:var(--adm-primary)] hover:underline hover:decoration-2 hover:underline-offset-4"
                        >
                          {row.accountName}
                        </Link>
                      ) : (
                        row.accountName
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--adm-on-variant)" }}>
                      {row.domain ?? "—"}
                    </td>
                    <td
                      className="px-4 py-3 tabular-nums font-semibold"
                      style={{ color: "var(--adm-primary)" }}
                    >
                      {formatAiCostEur(row.estimatedCostUsd)}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: "var(--adm-on-surface)" }}>
                      {formatTokens(row.totalTokens)}
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--adm-on-variant)" }}>
                      {formatTokens(row.promptTokens)}
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--adm-on-variant)" }}>
                      {formatTokens(row.completionTokens)}
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: "var(--adm-on-variant)" }}>
                      {formatTokens(row.callCount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--adm-on-variant)" }}>
                      {formatDate(row.lastUsedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
        {t("footnote")}
      </p>
    </div>
  );
}
