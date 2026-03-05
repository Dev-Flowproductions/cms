"use client";

import { useRef, useState } from "react";
import { useRouter } from "@/lib/navigation";

type UploadResult = { error?: string; success?: boolean };

export function CoverImageUpload({
  postId,
  currentPath,
  supabaseUrl,
  uploadAction,
  focusKeyword,
  onCoverChange,
}: {
  postId: string;
  currentPath: string | null;
  supabaseUrl: string;
  uploadAction: (formData: FormData) => Promise<UploadResult>;
  focusKeyword?: string | null;
  onCoverChange?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const storedUrl = currentPath
    ? `${supabaseUrl}/storage/v1/object/public/covers/${currentPath}`
    : null;

  const displayUrl = previewUrl ?? storedUrl;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }

  async function handleUpload() {
    if (!fileRef.current?.files?.[0]) {
      setError("Please choose a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", fileRef.current.files[0]);
    setError(null);
    setUploading(true);
    const result = await uploadAction(formData);
    setUploading(false);
    if (result?.error) { setError(result.error); return; }
    const objectUrl = URL.createObjectURL(fileRef.current.files[0]);
    setPreviewUrl(objectUrl);
    onCoverChange?.(objectUrl);
    showSuccess();
    router.refresh();
  }

  async function handleGenerate() {
    const query = focusKeyword ?? "blog content technology";
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/agent/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, query }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to generate cover"); return; }
      setPreviewUrl(json.publicUrl);
      onCoverChange?.(json.publicUrl);
      showSuccess();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  }

  function showSuccess() {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="space-y-3">
      {/* Cover preview */}
      {displayUrl && (
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ border: "1px solid var(--border)", maxWidth: "320px", aspectRatio: "16/9" }}
        >
          <img
            src={displayUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* File picker */}
        <label
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: selectedFile ? "var(--text)" : "var(--text-muted)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v9M4 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {selectedFile ? selectedFile : "Choose file"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>

        {/* Upload selected file */}
        {selectedFile && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        )}

        {/* Divider */}
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>or</span>

        {/* Auto-generate from Unsplash */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || uploading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: generating ? "var(--surface-raised)" : "linear-gradient(135deg, #7c5cfc, #a78bfa)",
            color: generating ? "var(--text-muted)" : "white",
            border: generating ? "1px solid var(--border)" : "none",
            boxShadow: generating ? "none" : "0 0 16px rgba(124,92,252,0.25)",
          }}
        >
          {generating ? (
            <>
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="currentColor" />
              </svg>
              Generate cover
            </>
          )}
        </button>

        {success && (
          <span className="text-xs font-medium" style={{ color: "var(--success)" }}>✓ Saved</span>
        )}
      </div>

      {focusKeyword && (
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          Will search Unsplash for: <span style={{ color: "var(--text-muted)" }}>{focusKeyword}</span>
        </p>
      )}

      {error && (
        <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>
      )}
    </div>
  );
}
