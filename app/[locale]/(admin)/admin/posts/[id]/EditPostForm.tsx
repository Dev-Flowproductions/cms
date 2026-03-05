"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { CoverImageUpload } from "./CoverImageUpload";
import { CitationsBlock } from "./CitationsBlock";

type Option = { value: string; label: string };

type Localization = {
  id: string;
  locale: string;
  title: string;
  excerpt: string;
  content_md: string;
  seo_title?: string | null;
  seo_description?: string | null;
  focus_keyword?: string | null;
  faq_blocks?: Array<{ question: string; answer: string }> | null;
};

type Post = {
  id: string;
  slug: string;
  status: string;
  content_type: string;
  primary_locale: string;
  cover_image_path: string | null;
  published_at: string | null;
  scheduled_for: string | null;
  post_localizations: Localization[];
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

function InputField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </label>
        {hint && <span className="text-xs" style={{ color: "var(--text-faint)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: "0.75rem",
  padding: "0.625rem 0.875rem",
  width: "100%",
  fontSize: "0.875rem",
  outline: "none",
} as React.CSSProperties;

const focusStyle = { borderColor: "var(--accent)" };
const blurStyle  = { borderColor: "var(--border)" };

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
  const [isPending, startTransition] = useTransition();
  const [coverUrl, setCoverUrl] = useState<string | null>(
    post.cover_image_path
      ? `${supabaseUrl}/storage/v1/object/public/covers/${post.cover_image_path}`
      : null
  );

  const locMap = new Map(post.post_localizations.map((l) => [l.locale, l]));
  const currentLoc = locMap.get(activeLocale) ?? {
    locale: activeLocale, title: "", excerpt: "", content_md: "",
    seo_title: null, seo_description: null, focus_keyword: null, faq_blocks: null,
  };

  // Local draft state for all editable localization fields
  const [drafts, setDrafts] = useState<Record<string, Partial<Localization>>>(() =>
    Object.fromEntries(post.post_localizations.map((l) => [l.locale, l]))
  );

  const draft = drafts[activeLocale] ?? currentLoc;

  function setField(field: keyof Localization, value: string) {
    setDrafts((prev) => ({ ...prev, [activeLocale]: { ...(prev[activeLocale] ?? currentLoc), [field]: value } }));
  }

  // AI generation state
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    setGenSuccess(false);
    try {
      const res = await fetch("/api/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: post.id,
          locale: activeLocale,
          focus_keyword: draft.focus_keyword ?? undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setGenError(json.error ?? "Generation failed"); return; }

      // Merge generated content into local draft state so the editor updates immediately
      startTransition(() => {
        setDrafts((prev) => ({
          ...prev,
          [activeLocale]: {
            ...(prev[activeLocale] ?? currentLoc),
            title: json.data.title,
            excerpt: json.data.excerpt,
            content_md: json.data.content_md,
            seo_title: json.data.seo_title,
            seo_description: json.data.seo_description,
            focus_keyword: json.data.focus_keyword,
            faq_blocks: json.data.faq_blocks,
          },
        }));
      });
      setGenSuccess(true);
      // If the API auto-generated a cover image, update the preview immediately
      if (json.coverPublicUrl) {
        setCoverUrl(json.coverPublicUrl);
      }
      setTimeout(() => setGenSuccess(false), 4000);
      router.refresh();
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  }

  const sectionStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "1rem",
    padding: "1.5rem",
  };

  const sectionHeadingStyle = {
    color: "var(--accent)",
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    marginBottom: "1rem",
  };

  return (
    <div className="space-y-6">

      {/* ── Post settings ── */}
      <section style={sectionStyle}>
        <p style={sectionHeadingStyle}>{labels.postSettings}</p>
        <form action={setPostState} className="space-y-5">
          <input type="hidden" name="id" value={post.id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField label={labels.slug}>
              <input name="slug" defaultValue={post.slug}
                style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </InputField>

            <InputField label={labels.status}>
              <select name="status" defaultValue={post.status}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
              >
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </InputField>

            <InputField label={labels.contentType}>
              <select name="content_type" defaultValue={post.content_type}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
              >
                {contentTypes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </InputField>

            <InputField label={labels.primaryLocale}>
              <select name="primary_locale" defaultValue={post.primary_locale}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
              >
                {locales.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </InputField>

            <InputField label={labels.publishedAt}>
              <input type="datetime-local" name="published_at"
                defaultValue={post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : ""}
                style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </InputField>

            <InputField label={labels.scheduledFor}>
              <input type="datetime-local" name="scheduled_for"
                defaultValue={post.scheduled_for ? new Date(post.scheduled_for).toISOString().slice(0, 16) : ""}
                style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
              />
            </InputField>
          </div>

            <InputField label={labels.coverImage}>
            <CoverImageUpload
              postId={post.id}
              currentPath={post.cover_image_path}
              supabaseUrl={supabaseUrl}
              uploadAction={uploadCoverAction}
              focusKeyword={draft.focus_keyword ?? undefined}
              onCoverChange={setCoverUrl}
            />
          </InputField>

          {postState?.error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>{postState.error}</p>
          )}
          <button type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {labels.save}
          </button>
        </form>
      </section>

      {/* ── Content (per locale) ── */}
      <section style={sectionStyle}>
        {/* Header row: locale tabs + Generate button */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex gap-2">
            {locales.map((l) => (
              <button key={l} type="button" onClick={() => setActiveLocale(l)}
                className="px-3 py-1.5 text-xs font-semibold uppercase rounded-lg transition-all"
                style={{
                  background: activeLocale === l ? "var(--accent)" : "var(--surface-raised)",
                  color: activeLocale === l ? "white" : "var(--text-muted)",
                  border: activeLocale === l ? "none" : "1px solid var(--border)",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Generate with AI */}
          <div className="flex items-center gap-3">
            {genError && <span className="text-xs" style={{ color: "var(--danger)" }}>{genError}</span>}
            {genSuccess && <span className="text-xs font-medium" style={{ color: "var(--success)" }}>✓ Generated</span>}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: generating ? "var(--surface-raised)" : "linear-gradient(135deg, #7c5cfc, #a78bfa)",
                color: "white",
                border: generating ? "1px solid var(--border)" : "none",
                boxShadow: generating ? "none" : "0 0 20px rgba(124,92,252,0.3)",
              }}
            >
              {generating ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="currentColor" />
                  </svg>
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </div>

        <form action={setLocState} className="space-y-5">
          <input type="hidden" name="locale" value={activeLocale} />

          {/* Focus keyword — drives AI generation */}
          <InputField label="Focus keyword" hint="drives AI generation">
            <input
              name="focus_keyword"
              key={`kw-${activeLocale}`}
              value={draft.focus_keyword ?? ""}
              onChange={e => setField("focus_keyword", e.target.value)}
              placeholder="e.g. seo strategy 2025"
              style={inputStyle}
              onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
            />
          </InputField>

          <InputField label={labels.title}>
            <input name="title" key={`title-${activeLocale}`}
              value={draft.title ?? ""}
              onChange={e => setField("title", e.target.value)}
              style={inputStyle}
              onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
            />
          </InputField>

          <InputField label={labels.excerpt}>
            <textarea name="excerpt" key={`excerpt-${activeLocale}`}
              value={draft.excerpt ?? ""}
              onChange={e => setField("excerpt", e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
            />
          </InputField>

          {/* SEO fields */}
          <div
            className="rounded-xl p-4 space-y-4"
            style={{ background: "rgba(124,92,252,0.05)", border: "1px solid rgba(124,92,252,0.15)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              SEO / AEO
            </p>
            <InputField label="SEO title" hint="50-60 chars">
              <input name="seo_title" key={`seo_title-${activeLocale}`}
                value={draft.seo_title ?? ""}
                onChange={e => setField("seo_title", e.target.value)}
                placeholder="Keyword-rich title for search engines"
                style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
              />
              <p className="mt-1 text-xs" style={{ color: (draft.seo_title?.length ?? 0) > 60 ? "var(--danger)" : "var(--text-faint)" }}>
                {draft.seo_title?.length ?? 0} / 60
              </p>
            </InputField>
            <InputField label="Meta description" hint="140-160 chars">
              <textarea name="seo_description" key={`seo_desc-${activeLocale}`}
                value={draft.seo_description ?? ""}
                onChange={e => setField("seo_description", e.target.value)}
                placeholder="Compelling description with keyword and CTA"
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
              />
              <p className="mt-1 text-xs" style={{ color: (draft.seo_description?.length ?? 0) > 160 ? "var(--danger)" : "var(--text-faint)" }}>
                {draft.seo_description?.length ?? 0} / 160
              </p>
            </InputField>
          </div>

          {/* Content */}
          <InputField label={labels.content} hint={labels.markdownHint}>
            <textarea name="content_md" key={`content-${activeLocale}`}
              value={draft.content_md ?? ""}
              onChange={e => setField("content_md", e.target.value)}
              rows={16}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "0.8rem" }}
              onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
            />
          </InputField>

          {/* Preview */}
          {draft.content_md && (
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                {labels.preview}
              </p>
              <MarkdownPreview content={draft.content_md} coverImageUrl={coverUrl} />
            </div>
          )}

          {/* FAQ blocks (read-only preview — edited via AI) */}
          {draft.faq_blocks && draft.faq_blocks.length > 0 && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(34,211,160,0.05)", border: "1px solid rgba(34,211,160,0.15)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--success)" }}>
                FAQ blocks (AEO · {draft.faq_blocks.length} items)
              </p>
              {draft.faq_blocks.map((faq, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Q: {faq.question}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>A: {faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {locState?.error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>{locState.error}</p>
          )}
          {locState?.success && (
            <p className="text-sm font-medium" style={{ color: "var(--success)" }}>Saved!</p>
          )}

          <button type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--accent)", color: "white" }}
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
