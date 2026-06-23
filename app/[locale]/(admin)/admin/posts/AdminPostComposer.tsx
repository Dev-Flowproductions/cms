"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { Link, useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import {
  adminCreateManualPostForUser,
  uploadCoverImage,
  uploadContentImage,
  upsertLocalization,
  updatePost,
} from "@/app/[locale]/(admin)/admin/posts/actions";
import { WritingCoachPanel } from "@/components/admin/WritingCoachPanel";
import { BrandedMarkdownPreview, type ClientBrandPreview } from "@/components/admin/BrandedMarkdownPreview";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { ComposerCoverPanel } from "@/components/admin/ComposerCoverPanel";
import { MagicImproveButton } from "@/components/admin/MagicImproveButton";
import { ScoreBadge } from "@/components/ScoreDisplay";
import { getPostStructureGuide } from "@/lib/agent/post-structure-guide";
import type { Locale } from "@/lib/types/db";

const LOCALES = ["pt", "en", "fr"] as const;

const inputStyle = {
  background: "var(--adm-surface-highest)",
  border: "1px solid var(--adm-border-subtle)",
  color: "var(--adm-on-surface)",
  borderRadius: "0.75rem",
  padding: "0.625rem 0.875rem",
  width: "100%",
  fontSize: "0.875rem",
  outline: "none",
} as React.CSSProperties;

const focusStyle = { borderColor: "var(--adm-primary)" };
const blurStyle = { borderColor: "var(--adm-border-subtle)" };

function InputField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
          {label}
        </label>
        {hint && (
          <span className="text-xs" style={{ color: "var(--adm-on-variant)", opacity: 0.75 }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function AdminPostComposer({
  authorUserId,
  accountName,
  brand,
  postsListHref,
}: {
  authorUserId: string;
  accountName: string;
  brand: ClientBrandPreview;
  postsListHref: string;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [locale, setLocale] = useState<Locale>("pt");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improvingTitle, setImprovingTitle] = useState(false);
  const [improvingContent, setImprovingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [optimizedFingerprint, setOptimizedFingerprint] = useState<string | null>(null);
  const [seoScore, setSeoScore] = useState<{ seo: number; aeo: number; geo: number } | null>(null);
  const [optimizeReady, setOptimizeReady] = useState(false);

  const structureSections = getPostStructureGuide(locale, "hero");
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const draftPromiseRef = useRef<Promise<string | null> | null>(null);

  const draftFingerprint = useMemo(
    () => `${locale}:${title.trim()}:${content}`,
    [locale, title, content],
  );
  const canPublish = Boolean(
    postId && optimizedFingerprint === draftFingerprint && optimizeReady,
  );

  function deriveDraftTitle(): string {
    if (title.trim()) return title.trim();
    const heading = content.match(/^##\s+(.+)$/m)?.[1]?.trim();
    if (heading) return heading.slice(0, 120);
    const plain = content
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*/g, "")
      .trim()
      .split(/\n/)[0]
      ?.trim();
    if (plain) return plain.slice(0, 120);
    return t("composerPage.untitled");
  }

  function buildLocalizationFormData(): FormData {
    const fd = new FormData();
    fd.set("locale", locale);
    fd.set("title", title.trim() || deriveDraftTitle());
    fd.set("excerpt", "");
    fd.set("content_md", content);
    return fd;
  }

  async function ensureDraft(options?: { requireTitle?: boolean }): Promise<string | null> {
    if (postId) return postId;

    if (options?.requireTitle && !title.trim() && !content.trim()) {
      setError(t("composerPage.titleRequired"));
      return null;
    }

    if (draftPromiseRef.current) return draftPromiseRef.current;

    draftPromiseRef.current = (async () => {
      const fd = new FormData();
      fd.set("author_id", authorUserId);
      fd.set("title", deriveDraftTitle());
      fd.set("content_md", content);
      fd.set("primary_locale", locale);
      fd.set("content_type", "hero");

      const result = await adminCreateManualPostForUser(fd);
      if (result.error) {
        setError(result.error);
        return null;
      }
      if (result.postId) {
        setPostId(result.postId);
        return result.postId;
      }
      return null;
    })();

    try {
      return await draftPromiseRef.current;
    } finally {
      draftPromiseRef.current = null;
    }
  }

  async function persistDraft(): Promise<string | null> {
    const id = await ensureDraft({ requireTitle: true });
    if (!id) return null;

    const metaFd = new FormData();
    metaFd.set("primary_locale", locale);
    const metaResult = await updatePost(id, metaFd);
    if (metaResult.error) {
      setError(metaResult.error);
      return null;
    }

    const result = await upsertLocalization(id, buildLocalizationFormData());
    if (result.error) {
      setError(result.error);
      return null;
    }
    return id;
  }

  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const id = await persistDraft();
    setSaving(false);
    if (id) {
      startTransition(() => router.refresh());
    }
  }

  async function handleOptimize() {
    if (!title.trim() && !content.trim()) {
      setError(t("composerPage.titleRequired"));
      return;
    }
    if (content.trim().split(/\s+/).length < 40) {
      setError(t("composerPage.optimizeNeedsContent"));
      return;
    }

    setOptimizing(true);
    setError(null);
    setOptimizedFingerprint(null);
    setOptimizeReady(false);
    setSeoScore(null);

    try {
      const id = await persistDraft();
      if (!id) return;

      const res = await fetch("/api/agent/optimize-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: id,
          locale,
          title: title.trim() || deriveDraftTitle(),
          content_md: content,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t("composerPage.optimizeFailed"));
        return;
      }

      const newTitle = typeof json.title === "string" ? json.title : title;
      const newContent = typeof json.content_md === "string" ? json.content_md : content;
      setTitle(newTitle);
      setContent(newContent);
      if (json.seo_score) setSeoScore(json.seo_score);

      setOptimizedFingerprint(`${locale}:${newTitle.trim()}:${newContent}`);
      setOptimizeReady(Boolean(json.meets_publish_bar));

      if (!json.meets_publish_bar) {
        setError(t("composerPage.optimizeBelowBar"));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("composerPage.optimizeFailed"));
    } finally {
      setOptimizing(false);
    }
  }

  async function handlePublish() {
    if (!canPublish || !postId) return;

    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/publish/${postId}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t("composerPage.publishFailed"));
        return;
      }
      startTransition(() => router.push(postsListHref));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("composerPage.publishFailed"));
    } finally {
      setPublishing(false);
    }
  }

  async function handleImprove(field: "title" | "content") {
    if (field === "title" && !title.trim() && !content.trim()) {
      setError(t("composerPage.improveNeedsContent"));
      return;
    }
    if (field === "content" && !content.trim()) {
      setError(t("composerPage.improveNeedsContent"));
      return;
    }

    const setLoading = field === "title" ? setImprovingTitle : setImprovingContent;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/improve-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_user_id: authorUserId,
          locale,
          field,
          title: title.trim(),
          content_md: content,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t("composerPage.improveFailed"));
        return;
      }
      if (json.title) setTitle(json.title);
      if (json.content_md) setContent(json.content_md);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("composerPage.improveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={postsListHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[color:var(--adm-primary)]"
          style={{ color: "var(--adm-on-variant)" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("composerPage.backToPosts")}
        </Link>
        <span className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
          {t("composerPage.forAccount", { name: accountName })}
        </span>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(255, 180, 171, 0.08)",
            border: "1px solid rgba(255, 180, 171, 0.28)",
            color: "var(--adm-error)",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form onSubmit={handleSaveDraft} className="space-y-5 min-w-0">
          <WritingCoachPanel
            authorUserId={authorUserId}
            locale={locale}
            title={title}
            content={content}
            structureSections={structureSections}
            labels={{
              title: t("composerPage.coachTitle"),
              subtitle: t("composerPage.coachSubtitle"),
              refresh: t("composerPage.coachRefresh"),
              loading: t("composerPage.coachLoading"),
              empty: t("composerPage.coachEmpty"),
              checklist: t("composerPage.structureTitle"),
              showChecklist: t("composerPage.coachShowChecklist"),
              hideChecklist: t("composerPage.coachHideChecklist"),
              error: t("composerPage.coachError"),
            }}
          />

          <InputField label={t("primaryLocale")}>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label={t("title")}>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
              />
              <MagicImproveButton
                onClick={() => handleImprove("title")}
                loading={improvingTitle}
                disabled={saving}
                title={t("composerPage.improveTitle")}
              />
            </div>
          </InputField>

          <InputField label={t("content")} hint={t("editPostPage.markdownHint")}>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              wordCountLabel={t("composerPage.wordCount", { count: wordCount })}
              onImprove={() => handleImprove("content")}
              improving={improvingContent}
              onUploadImage={async (file) => {
                const id = await ensureDraft();
                if (!id) return null;
                const fd = new FormData();
                fd.set("file", file);
                const result = await uploadContentImage(id, fd);
                if (result.error) {
                  setError(result.error);
                  return null;
                }
                return result.publicUrl ?? null;
              }}
              labels={{
                write: t("composerPage.editorWrite"),
                preview: t("composerPage.editorPreview"),
                improve: t("composerPage.improveContent"),
                placeholder: t("composerPage.editorPlaceholder"),
                bold: t("composerPage.editorBold"),
                italic: t("composerPage.editorItalic"),
                h2: t("composerPage.editorH2"),
                h3: t("composerPage.editorH3"),
                list: t("composerPage.editorList"),
                quote: t("composerPage.editorQuote"),
                link: t("composerPage.editorLink"),
                image: t("composerPage.editorImage"),
                linkUrl: t("composerPage.editorLinkUrl"),
                linkText: t("composerPage.editorLinkText"),
                linkInsert: t("composerPage.editorLinkInsert"),
                linkCancel: t("composerPage.editorLinkCancel"),
                imageUploading: t("composerPage.editorImageUploading"),
                imageUploadFailed: t("composerPage.editorImageUploadFailed"),
                selectionHint: t("composerPage.editorSelectionHint"),
              }}
            />
          </InputField>

          <ComposerCoverPanel
            postId={postId}
            coverUrl={coverUrl}
            onCoverChange={setCoverUrl}
            onEnsureDraft={() => ensureDraft()}
            uploadAction={uploadCoverImage}
            coverQuery={title.trim() || deriveDraftTitle()}
            labels={{
              title: t("coverImage"),
              upload: t("composerPage.coverUpload"),
              uploadHint: t("composerPage.coverUploadHint"),
              generate: t("composerPage.coverGenerate"),
              generateHint: t("composerPage.coverGenerateHint"),
              generating: t("composerPage.coverGenerating"),
              uploading: t("composerPage.coverUploading"),
              empty: t("composerPage.coverEmpty"),
              dropHint: t("composerPage.coverDropHint"),
              saved: t("composerPage.coverSaved"),
              createFailed: t("composerPage.coverCreateFailed"),
            }}
          />

          <div className="space-y-3 pt-2">
            {seoScore && (
              <div
                className="rounded-xl border px-4 py-3"
                style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-highest)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--adm-on-variant)" }}>
                  {t("composerPage.scoreTitle")}
                </p>
                <ScoreBadge score={seoScore} />
              </div>
            )}

            {optimizedFingerprint && optimizedFingerprint !== draftFingerprint && (
              <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
                {t("composerPage.optimizeStale")}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving || optimizing || publishing}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "var(--adm-primary-container)", boxShadow: "var(--adm-cta-glow-shadow)" }}
              >
                {saving ? t("composerPage.saving") : postId ? t("composerPage.savedDraft") : t("composerPage.saveDraft")}
              </button>

              <button
                type="button"
                onClick={() => void handleOptimize()}
                disabled={saving || optimizing || publishing}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "var(--adm-primary)", boxShadow: "var(--adm-cta-glow-shadow)" }}
              >
                {optimizing ? t("composerPage.optimizing") : t("composerPage.optimizeSeo")}
              </button>

              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={!canPublish || saving || optimizing || publishing}
                title={!canPublish ? t("composerPage.publishLockedHint") : undefined}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  background: canPublish ? "var(--adm-success, #16a34a)" : "var(--adm-surface-high)",
                  color: canPublish ? "#fff" : "var(--adm-on-variant)",
                  border: canPublish ? "none" : "1px solid var(--adm-outline-variant)",
                }}
              >
                {publishing ? t("composerPage.publishing") : t("composerPage.publish")}
              </button>

              {postId && (
                <Link
                  href={`/admin/posts/${postId}`}
                  className="inline-flex items-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all"
                  style={{
                    background: "var(--adm-surface-high)",
                    color: "var(--adm-on-surface)",
                    borderColor: "var(--adm-outline-variant)",
                  }}
                >
                  {t("composerPage.openFullEditor")}
                </Link>
              )}
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
              {t("composerPage.optimizeRequiredHint")}
            </p>
          </div>
        </form>

        <div className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
              {t("editPostPage.preview")}
            </p>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="text-xs font-semibold"
              style={{ color: "var(--adm-primary)" }}
            >
              {showPreview ? t("composerPage.hidePreview") : t("composerPage.showPreview")}
            </button>
          </div>
          {showPreview && (
            <BrandedMarkdownPreview
              brand={brand}
              content={content}
              coverImageUrl={coverUrl}
              title={title || t("composerPage.untitled")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
