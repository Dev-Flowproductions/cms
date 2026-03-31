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
    <section
      className="rounded-xl p-5"
      style={{ border: "1px solid var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
    >
      <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--adm-on-surface)" }}>
        Citations
      </h2>
      <ul className="space-y-2 mb-4">
        {citations.filter((c) => c.locale === currentLocale).map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-2 text-sm">
            <div>
              <a
                href={(source(c) as Source)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "var(--adm-primary)" }}
              >
                {(source(c) as Source)?.title || (source(c) as Source)?.url}
              </a>
              {c.claim && (
                <p className="text-xs mt-0.5" style={{ color: "var(--adm-on-variant)" }}>
                  {c.claim}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(c.id)}
              className="text-xs font-medium flex-shrink-0 hover:underline transition-colors"
              style={{ color: "var(--adm-error)" }}
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
          className="text-xs font-semibold transition-colors hover:underline"
          style={{ color: "var(--adm-primary)" }}
        >
          + Add citation
        </button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-2">
          <select
            name="source_id"
            required
            className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--adm-surface-highest)",
              border: "1px solid var(--adm-border-subtle)",
              color: "var(--adm-on-surface)",
            }}
          >
            <option value="">Select source</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>{s.title || s.url}</option>
            ))}
          </select>
          <input
            name="claim"
            placeholder="Claim"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--adm-surface-highest)",
              border: "1px solid var(--adm-border-subtle)",
              color: "var(--adm-on-surface)",
            }}
          />
          <input
            name="quote"
            placeholder="Quote"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--adm-surface-highest)",
              border: "1px solid var(--adm-border-subtle)",
              color: "var(--adm-on-surface)",
            }}
          />
          <input
            name="section_anchor"
            placeholder="Section anchor (#h2-intro)"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--adm-surface-highest)",
              border: "1px solid var(--adm-border-subtle)",
              color: "var(--adm-on-surface)",
            }}
          />
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: "var(--adm-primary-container)",
                color: "#fff",
                boxShadow: "0 0 14px rgba(104, 57, 234, 0.35)",
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: "var(--adm-surface-highest)",
                color: "var(--adm-on-variant)",
                border: "1px solid var(--adm-border-subtle)",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
