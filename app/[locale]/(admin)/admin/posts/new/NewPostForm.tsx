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
        <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          {labels.slug}
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          placeholder="my-post-slug"
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="primary_locale" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          {labels.primaryLocale}
        </label>
        <select id="primary_locale" name="primary_locale" className="input-field">
          <option value="en">en</option>
          <option value="pt">pt</option>
          <option value="fr">fr</option>
        </select>
      </div>
      <div>
        <label htmlFor="content_type" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          {labels.contentType}
        </label>
        <select id="content_type" name="content_type" className="input-field">
          {contentTypes.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          {labels.status}
        </label>
        <select id="status" name="status" className="input-field">
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
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
        {labels.submit}
      </button>
    </form>
  );
}
