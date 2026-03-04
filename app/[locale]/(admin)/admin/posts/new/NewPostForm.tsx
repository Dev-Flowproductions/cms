"use client";

import { useActionState } from "react";

type Option = { value: string; label: string };

type Props = {
  action: (formData: FormData) => Promise<{ error?: string; postId?: string }>;
  statusOptions: Option[];
  contentTypes: Option[];
  labels: {
    slug: string;
    primaryLocale: string;
    contentType: string;
    status: string;
    submit: string;
  };
};

export function NewPostForm({ action, statusOptions, contentTypes, labels }: Props) {
  const [state, formAction] = useActionState(async (_: unknown, formData: FormData) => {
    return action(formData);
  }, null);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">
          {labels.slug}
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          placeholder="my-post-slug"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        />
      </div>
      <div>
        <label htmlFor="primary_locale" className="block text-sm font-medium mb-1">
          {labels.primaryLocale}
        </label>
        <select
          id="primary_locale"
          name="primary_locale"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        >
          <option value="en">en</option>
          <option value="pt">pt</option>
          <option value="fr">fr</option>
        </select>
      </div>
      <div>
        <label htmlFor="content_type" className="block text-sm font-medium mb-1">
          {labels.contentType}
        </label>
        <select
          id="content_type"
          name="content_type"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        >
          {contentTypes.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-1">
          {labels.status}
        </label>
        <select
          id="status"
          name="status"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium"
      >
        {labels.submit}
      </button>
    </form>
  );
}
