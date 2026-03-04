"use client";

import { useActionState, useState } from "react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { CoverImageUpload } from "./CoverImageUpload";
import { CitationsBlock } from "./CitationsBlock";

type Option = { value: string; label: string };

type Post = {
  id: string;
  slug: string;
  status: string;
  content_type: string;
  primary_locale: string;
  cover_image_path: string | null;
  published_at: string | null;
  scheduled_for: string | null;
  post_localizations: Array<{
    id: string;
    locale: string;
    title: string;
    excerpt: string;
    content_md: string;
  }>;
};

type Props = {
  post: Post;
  statusOptions: Option[];
  contentTypes: Option[];
  locales: readonly string[];
  labels: Record<string, string>;
  updatePostAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  upsertLocalizationAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  uploadCoverAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  supabaseUrl: string;
  sources: Array<{ id: string; url: string; title: string | null }>;
  citations: Array<{
    id: string;
    source_id: string;
    locale: string;
    quote: string | null;
    claim: string | null;
    section_anchor: string | null;
    sources: unknown;
  }>;
};

export function EditPostForm({
  post,
  statusOptions,
  contentTypes,
  locales,
  labels,
  updatePostAction,
  upsertLocalizationAction,
  uploadCoverAction,
  supabaseUrl,
  sources,
  citations,
}: Props) {
  const [postState, setPostState] = useActionState(
    async (_: unknown, formData: FormData) => updatePostAction(formData),
    null
  );
  const [locState, setLocState] = useActionState(
    async (_: unknown, formData: FormData) => upsertLocalizationAction(formData),
    null
  );
  const [activeLocale, setActiveLocale] = useState(post.primary_locale);
  const [draftContent, setDraftContent] = useState<Record<string, string>>(
    () => Object.fromEntries(post.post_localizations.map((l) => [l.locale, l.content_md]))
  );

  const locMap = new Map(post.post_localizations.map((l) => [l.locale, l]));
  const currentLoc = locMap.get(activeLocale) ?? {
    locale: activeLocale,
    title: "",
    excerpt: "",
    content_md: "",
  };
  const currentContent = draftContent[activeLocale] ?? currentLoc.content_md;

  return (
    <div className="space-y-8">
      {/* Post-level fields */}
      <section className="border border-gray-200 dark:border-gray-700 rounded p-4">
        <h2 className="font-medium mb-4">{labels.postSettings}</h2>
        <form action={setPostState} className="space-y-4">
          <input type="hidden" name="id" value={post.id} />
          <div>
            <label className="block text-sm font-medium mb-1">{labels.slug}</label>
            <input
              name="slug"
              defaultValue={post.slug}
              className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-1">{labels.status}</label>
              <select
                name="status"
                defaultValue={post.status}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{labels.primaryLocale}</label>
              <select
                name="primary_locale"
                defaultValue={post.primary_locale}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
              >
                {locales.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{labels.coverImage}</label>
              <CoverImageUpload
                postId={post.id}
                currentPath={post.cover_image_path}
                supabaseUrl={supabaseUrl}
                uploadAction={uploadCoverAction}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{labels.contentType}</label>
              <select
                name="content_type"
                defaultValue={post.content_type}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
              >
                {contentTypes.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{labels.publishedAt}</label>
              <input
                type="datetime-local"
                name="published_at"
                defaultValue={
                  post.published_at
                    ? new Date(post.published_at).toISOString().slice(0, 16)
                    : ""
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{labels.scheduledFor}</label>
              <input
                type="datetime-local"
                name="scheduled_for"
                defaultValue={
                  post.scheduled_for
                    ? new Date(post.scheduled_for).toISOString().slice(0, 16)
                    : ""
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          {postState?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{postState.error}</p>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-sm"
          >
            {labels.save}
          </button>
        </form>
      </section>

      {/* Per-locale content */}
      <section className="border border-gray-200 dark:border-gray-700 rounded p-4">
        <h2 className="font-medium mb-4">{labels.title} / {labels.excerpt} / {labels.content}</h2>
        <div className="flex gap-2 mb-4">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLocale(l)}
              className={`px-3 py-1.5 text-sm rounded ${activeLocale === l ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <form action={setLocState} className="space-y-4">
          <input type="hidden" name="locale" value={activeLocale} />
          <div>
            <label className="block text-sm font-medium mb-1">{labels.title}</label>
            <input
              name="title"
              key={`title-${activeLocale}`}
              defaultValue={currentLoc.title}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{labels.excerpt}</label>
            <textarea
              name="excerpt"
              key={`excerpt-${activeLocale}`}
              defaultValue={currentLoc.excerpt}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{labels.content} {labels.markdownHint}</label>
            <textarea
              name="content_md"
              key={`content-${activeLocale}`}
              value={currentContent}
              onChange={(e) =>
                setDraftContent((prev) => ({ ...prev, [activeLocale]: e.target.value }))
              }
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 font-mono text-sm"
            />
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">{labels.preview}</p>
              <MarkdownPreview content={currentContent} />
            </div>
          </div>
          {locState?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{locState.error}</p>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-sm"
          >
            {labels.save}
          </button>
        </form>
      </section>

      <CitationsBlock
        postId={post.id}
        currentLocale={activeLocale}
        sources={sources}
        citations={citations}
      />
    </div>
  );
}
