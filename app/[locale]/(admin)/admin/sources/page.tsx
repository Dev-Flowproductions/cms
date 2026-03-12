import { getTranslations } from "next-intl/server";
import { getSourcesList } from "./actions";
import { AddSourceForm } from "./AddSourceForm";

export default async function SourcesPage() {
  const t = await getTranslations("admin");
  const sources = await getSourcesList();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
          Admin
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          {t("sources")}
        </h1>
      </div>

      <AddSourceForm />

      <div
        className="mt-6 rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                URL
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {t("title")}
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {t("publisher")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-faint)" }}>
                  No sources yet.
                </td>
              </tr>
            ) : (
              sources.map((s: { id: string; url: string; title: string | null; publisher: string | null }, i: number) => (
                <tr
                  key={s.id}
                  style={{ borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none" }}
                >
                  <td className="px-5 py-3">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono hover:underline truncate max-w-xs block"
                      style={{ color: "var(--accent)" }}
                    >
                      {s.url}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: "var(--text)" }}>
                    {s.title ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    {s.publisher ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
