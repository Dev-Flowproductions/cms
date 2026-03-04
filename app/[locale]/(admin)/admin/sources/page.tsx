import { getTranslations } from "next-intl/server";
import { getSourcesList } from "./actions";
import { AddSourceForm } from "./AddSourceForm";

export default async function SourcesPage() {
  const t = await getTranslations("admin");
  const sources = await getSourcesList();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t("sources")}</h1>
      <AddSourceForm />
      <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3 font-medium">URL</th>
              <th className="text-left p-3 font-medium">{t("title")}</th>
              <th className="text-left p-3 font-medium">{t("publisher")}</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  No sources yet.
                </td>
              </tr>
            ) : (
              sources.map((s: { id: string; url: string; title: string | null; publisher: string | null }) => (
                <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs block">
                      {s.url}
                    </a>
                  </td>
                  <td className="p-3">{s.title ?? "—"}</td>
                  <td className="p-3">{s.publisher ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
