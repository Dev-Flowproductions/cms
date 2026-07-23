"use client";

import { useRef, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { readApiJsonResponse } from "@/lib/http/read-api-json";

type UploadResult = { error?: string; success?: boolean; publicUrl?: string };

export function ComposerCoverPanel({
  postId,
  coverUrl,
  coverQuery,
  labels,
  onCoverChange,
  onEnsureDraft,
  uploadAction,
}: {
  postId: string | null;
  coverUrl: string | null;
  coverQuery: string;
  labels: {
    title: string;
    upload: string;
    uploadHint: string;
    generate: string;
    generateHint: string;
    generating: string;
    uploading: string;
    empty: string;
    dropHint: string;
    saved: string;
    createFailed: string;
  };
  onCoverChange: (url: string) => void;
  onEnsureDraft: () => Promise<string | null>;
  uploadAction: (postId: string, formData: FormData) => Promise<UploadResult>;
}) {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const displayUrl = localPreview ?? coverUrl;

  async function resolvePostId(): Promise<string | null> {
    if (postId) return postId;
    return onEnsureDraft();
  }

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const id = await resolvePostId();
      if (!id) {
        setError(labels.createFailed);
        return;
      }

      setLocalPreview(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadAction(id, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.publicUrl) onCoverChange(result.publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const id = await resolvePostId();
      if (!id) {
        setError(labels.createFailed);
        return;
      }

      const res = await fetch("/api/agent/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: id, query: coverQuery.trim() || "blog article" }),
      });
      const { ok, data } = await readApiJsonResponse(res);
      if (!ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to generate cover");
        return;
      }
      const publicUrl = (data.publicUrl ?? data.cover_image_url) as string | undefined;
      if (!publicUrl) {
        setError("Cover generated but no image URL was returned");
        return;
      }
      setLocalPreview(publicUrl);
      onCoverChange(publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) void uploadFile(file);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
        {labels.title}
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="relative overflow-hidden rounded-2xl border transition-colors"
        style={{
          borderColor: dragOver ? "var(--adm-primary)" : "var(--adm-border-subtle)",
          background: "var(--adm-surface-highest)",
          aspectRatio: "16/9",
        }}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <svg className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium" style={{ color: "var(--adm-on-variant)" }}>
              {labels.empty}
            </p>
            <p className="text-xs" style={{ color: "var(--adm-on-variant)", opacity: 0.75 }}>
              {labels.dropHint}
            </p>
          </div>
        )}
        {success && (
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "rgba(74, 222, 128, 0.9)", color: "#052e16" }}
          >
            {labels.saved}
          </span>
        )}
        {(generating || uploading) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(6, 14, 32, 0.55)" }}
          >
            <svg className="h-8 w-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
            <p className="text-xs font-semibold text-white">
              {generating ? labels.generating : labels.uploading}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={uploading || generating}
          onClick={() => fileRef.current?.click()}
          className="rounded-2xl border p-4 text-left transition-all disabled:opacity-50 hover:border-[var(--adm-primary)]"
          style={{
            borderColor: "var(--adm-border-subtle)",
            background: "var(--adm-surface-high)",
          }}
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--adm-primary-soft-bg)" }}>
            <svg className="h-4 w-4" style={{ color: "var(--adm-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--adm-on-surface)" }}>
            {uploading ? labels.uploading : labels.upload}
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
            {labels.uploadHint}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file);
            }}
          />
        </button>

        <button
          type="button"
          disabled={uploading || generating}
          onClick={handleGenerate}
          className="rounded-2xl border p-4 text-left transition-all disabled:opacity-50 hover:border-[var(--adm-primary)]"
          style={{
            borderColor: "var(--adm-border-subtle)",
            background: "var(--adm-surface-high)",
          }}
        >
          <div
            className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--adm-gradient-cta)", boxShadow: "var(--adm-cta-glow-shadow)" }}
          >
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--adm-on-surface)" }}>
            {generating ? labels.generating : labels.generate}
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
            {labels.generateHint}
          </p>
        </button>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "var(--adm-error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
