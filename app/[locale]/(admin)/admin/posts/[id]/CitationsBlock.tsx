"use client";

import { useState } from "react";
import { useRouter } from "@/lib/navigation";
import { addCitation, removeCitation } from "../../sources/actions";

type Source = { id: string; url: string; title: string | null };
type Citation = {
  id: string;
  source_id: string;
  locale: string;
  quote: string | null;
  claim: string | null;
  section_anchor: string | null;
  sources: unknown;
};

export function CitationsBlock({
  postId,
  currentLocale,
  sources,
  citations,
}: {
  postId: string;
  currentLocale: string;
  sources: Source[];
  citations: Citation[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("locale", currentLocale);
    const result = await addCitation(postId, formData);
    if (result.error) alert(result.error);
    else {
      setAdding(false);
      form.reset();
      router.refresh();
    }
  }

  async function handleRemove(id: string) {
    const result = await removeCitation(id);
    if (result.error) alert(result.error);
    else router.refresh();
  }

  const source = (c: Citation) => {
    const s = c.sources;
    return Array.isArray(s) ? s[0] : s;
  };

  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded p-4">
      <h2 className="font-medium mb-4">Citations</h2>
      <ul className="space-y-2 mb-4">
        {citations.filter((c) => c.locale === currentLocale).map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-2 text-sm">
            <div>
              <a
                href={(source(c) as Source)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {(source(c) as Source)?.title || (source(c) as Source)?.url}
              </a>
              {c.claim && <p className="text-gray-600 dark:text-gray-400">{c.claim}</p>}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(c.id)}
              className="text-red-600 dark:text-red-400 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          + Add citation
        </button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-2">
          <select
            name="source_id"
            required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
          >
            <option value="">Select source</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>{s.title || s.url}</option>
            ))}
          </select>
          <input
            name="claim"
            placeholder="Claim"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
          />
          <input
            name="quote"
            placeholder="Quote"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
          />
          <input
            name="section_anchor"
            placeholder="Section anchor (#h2-intro)"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-sm">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm">Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}
