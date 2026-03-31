"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualPost } from "@/app/[locale]/(admin)/admin/posts/actions";
import { MarkdownPreview } from "@/components/MarkdownPreview";

const LOCALES = ["pt", "en", "fr"] as const;
type Locale = typeof LOCALES[number];

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

export function ManualPostEditor() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [locale, setLocale] = useState<Locale>("pt");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData();
    fd.set("title", title);
    fd.set("content_md", content);
    fd.set("seo_description", seoDesc);
    fd.set("primary_locale", locale);

    const result = await createManualPost(fd);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    startTransition(() => {
      router.push(`/dashboard/posts/${result.postId}`);
    });
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Locale selector */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--accent)" }}
        >
          Language
        </p>
        <div className="flex gap-2">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
              style={{
                background: locale === l ? "var(--accent)" : "var(--surface-raised)",
                color: locale === l ? "white" : "var(--text-muted)",
                border: locale === l ? "none" : "1px solid var(--border)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Content section */}
      <div
        className="rounded-2xl p-5 space-y-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          Content
        </p>

        <InputField label="Title" hint="required">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your post title"
            required
            style={inputStyle}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
          />
        </InputField>

        <InputField label="Meta description" hint="140–160 chars, shown in search results">
          <textarea
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            placeholder="A short summary of this post for search engines"
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
          />
          <p
            className="mt-1 text-xs"
            style={{ color: seoDesc.length > 160 ? "var(--danger)" : "var(--text-faint)" }}
          >
            {seoDesc.length} / 160
          </p>
        </InputField>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-baseline gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Body
              </label>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>Markdown supported</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                {wordCount} word{wordCount !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                style={{
                  background: showPreview ? "var(--accent)" : "var(--surface-raised)",
                  color: showPreview ? "white" : "var(--text-muted)",
                  border: showPreview ? "none" : "1px solid var(--border)",
                }}
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
            </div>
          </div>

          {showPreview ? (
            <div
              className="rounded-xl p-5 min-h-[300px]"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              {content ? (
                <MarkdownPreview content={content} coverImageUrl={null} />
              ) : (
                <p className="text-sm" style={{ color: "var(--text-faint)" }}>Nothing to preview yet.</p>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              placeholder={`# Your post title\n\nWrite your post content here using Markdown.\n\n## Section heading\n\nParagraph text...\n\n## Another section\n\nMore content...`}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "0.8rem" }}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(255,92,106,0.08)",
            border: "1px solid rgba(255,92,106,0.25)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "var(--accent)",
            color: "white",
            boxShadow: (!saving && title.trim()) ? "0 0 16px rgba(124,92,252,0.25)" : "none",
          }}
        >
          {saving ? "Creating…" : "Create post"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "var(--surface-raised)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          Cancel
        </button>
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
          Draft saved — you can add a cover image after creating
        </span>
      </div>
    </form>
  );
}
