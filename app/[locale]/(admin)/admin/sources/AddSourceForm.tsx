"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createSource } from "./actions";

export function AddSourceForm() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => createSource(formData),
    null
  );

  return (
    <form
      action={formAction}
      className="max-w-lg space-y-4 p-5 rounded-2xl"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
        {t("addSource")}
      </h2>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("url")}
        </label>
        <input name="url" type="url" required className="input-field" />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("title")}
        </label>
        <input name="title" type="text" className="input-field" />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("publisher")}
        </label>
        <input name="publisher" type="text" className="input-field" />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          {t("notes")}
        </label>
        <textarea name="notes" rows={2} className="input-field" />
      </div>
      {state?.error && (
        <p
          className="text-xs px-3 py-2 rounded-xl"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {state.error}
        </p>
      )}
      <button
        type="submit"
        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: "var(--accent)", color: "white" }}
      >
        {tCommon("submit")}
      </button>
    </form>
  );
}
