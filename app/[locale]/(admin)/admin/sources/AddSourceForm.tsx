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
    <form action={formAction} className="max-w-lg space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded">
      <h2 className="font-medium">{t("addSource")}</h2>
      <div>
        <label className="block text-sm font-medium mb-1">{t("url")}</label>
        <input
          name="url"
          type="url"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t("title")}</label>
        <input
          name="title"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t("publisher")}</label>
        <input
          name="publisher"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t("notes")}</label>
        <textarea
          name="notes"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-sm"
      >
        {tCommon("submit")}
      </button>
    </form>
  );
}
