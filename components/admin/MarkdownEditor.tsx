"use client";

import { useRef, useState } from "react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { MagicImproveButton } from "@/components/admin/MagicImproveButton";
import {
  applyImage,
  applyLinePrefix,
  applyLink,
  applyWrap,
  type MarkdownEditResult,
} from "@/lib/markdown-editor-utils";

type ToolbarButton = {
  id: string;
  label: string;
  title: string;
  action: "bold" | "italic" | "h2" | "h3" | "list" | "quote" | "link" | "image";
};

export function MarkdownEditor({
  value,
  onChange,
  wordCountLabel,
  labels,
  onImprove,
  improving,
  onUploadImage,
}: {
  value: string;
  onChange: (value: string) => void;
  wordCountLabel: string;
  labels: {
    write: string;
    preview: string;
    improve: string;
    placeholder: string;
    bold: string;
    italic: string;
    h2: string;
    h3: string;
    list: string;
    quote: string;
    link: string;
    image: string;
    linkUrl: string;
    linkText: string;
    linkInsert: string;
    linkCancel: string;
    imageUploading: string;
    imageUploadFailed: string;
    selectionHint: string;
  };
  onImprove?: () => void;
  improving?: boolean;
  onUploadImage?: (file: File) => Promise<string | null>;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectionHint, setSelectionHint] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const toolbar: ToolbarButton[] = [
    { id: "bold", label: "B", title: labels.bold, action: "bold" },
    { id: "italic", label: "I", title: labels.italic, action: "italic" },
    { id: "h2", label: "H2", title: labels.h2, action: "h2" },
    { id: "h3", label: "H3", title: labels.h3, action: "h3" },
    { id: "list", label: "List", title: labels.list, action: "list" },
    { id: "quote", label: "Quote", title: labels.quote, action: "quote" },
    { id: "link", label: "Link", title: labels.link, action: "link" },
    { id: "image", label: "Image", title: labels.image, action: "image" },
  ];

  function syncSelection() {
    const el = textareaRef.current;
    if (!el) return;
    selectionRef.current = { start: el.selectionStart, end: el.selectionEnd };
    const selected = value.slice(el.selectionStart, el.selectionEnd);
    setSelectionHint(selected.trim() ? labels.selectionHint : "");
  }

  function applyEdit(result: MarkdownEditResult) {
    onChange(result.value);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
      selectionRef.current = { start: result.selectionStart, end: result.selectionEnd };
    });
  }

  function getSelection() {
    const el = textareaRef.current;
    if (el && document.activeElement === el) {
      return { start: el.selectionStart, end: el.selectionEnd };
    }
    return selectionRef.current;
  }

  function runFormat(action: ToolbarButton["action"]) {
    const { start, end } = getSelection();

    if (action === "link") {
      const selected = value.slice(start, end);
      setLinkText(selected || linkText);
      setShowLinkForm(true);
      return;
    }

    if (action === "image") {
      setImageError(null);
      fileRef.current?.click();
      return;
    }

    let result: MarkdownEditResult;
    switch (action) {
      case "bold":
        result = applyWrap(value, start, end, "**", "**");
        break;
      case "italic":
        result = applyWrap(value, start, end, "_", "_");
        break;
      case "h2":
        result = applyLinePrefix(value, start, end, "## ");
        break;
      case "h3":
        result = applyLinePrefix(value, start, end, "### ");
        break;
      case "list":
        result = applyLinePrefix(value, start, end, "- ");
        break;
      case "quote":
        result = applyLinePrefix(value, start, end, "> ");
        break;
      default:
        return;
    }
    applyEdit(result);
  }

  function insertLink() {
    const { start, end } = getSelection();
    applyEdit(applyLink(value, start, end, linkUrl, linkText));
    setShowLinkForm(false);
    setLinkUrl("https://");
    setLinkText("");
  }

  async function handleImageFile(file: File) {
    setImageError(null);
    setUploadingImage(true);
    try {
      let url: string | null = null;
      if (onUploadImage) {
        url = await onUploadImage(file);
      } else {
        url = URL.createObjectURL(file);
      }
      if (!url) {
        setImageError(labels.imageUploadFailed);
        return;
      }
      const { start, end } = getSelection();
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      applyEdit(applyImage(value, start, end, url, alt));
    } catch {
      setImageError(labels.imageUploadFailed);
    } finally {
      setUploadingImage(false);
    }
  }

  const inputStyle = {
    background: "var(--adm-surface-highest)",
    border: "1px solid var(--adm-border-subtle)",
    color: "var(--adm-on-surface)",
    borderRadius: "0.75rem",
    padding: "0.75rem 0.875rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
    lineHeight: 1.6,
  } as React.CSSProperties;

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
    >
      <div
        className="border-b px-2 py-2 space-y-2"
        style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-highest)" }}
      >
        <div className="flex flex-wrap items-center gap-1">
          {toolbar.map((btn) => (
            <button
              key={btn.id}
              type="button"
              title={btn.title}
              disabled={btn.action === "image" && uploadingImage}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runFormat(btn.action)}
              className="min-w-[2rem] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-[var(--adm-interactive-hover-strong)] disabled:opacity-40"
              style={{
                color: "var(--adm-on-variant)",
                fontStyle: btn.action === "italic" ? "italic" : undefined,
                fontWeight: btn.action === "bold" ? 700 : undefined,
              }}
            >
              {btn.action === "image" && uploadingImage ? "…" : btn.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {onImprove && (
              <MagicImproveButton
                onClick={onImprove}
                loading={improving}
                disabled={!value.trim()}
                title={labels.improve}
              />
            )}
            <span className="text-[11px]" style={{ color: "var(--adm-on-variant)" }}>
              {wordCountLabel}
            </span>
            <button
              type="button"
              onClick={() => setMode((m) => (m === "write" ? "preview" : "write"))}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
              style={{
                background: mode === "preview" ? "var(--adm-primary-container)" : "transparent",
                color: mode === "preview" ? "#fff" : "var(--adm-primary)",
              }}
            >
              {mode === "write" ? labels.preview : labels.write}
            </button>
          </div>
        </div>

        {selectionHint && (
          <p className="text-[11px]" style={{ color: "var(--adm-primary)" }}>
            {selectionHint}
          </p>
        )}

        {showLinkForm && (
          <div
            className="flex flex-wrap items-end gap-2 rounded-xl border p-2"
            style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
          >
            <label className="min-w-[8rem] flex-1 text-xs">
              <span className="mb-1 block font-semibold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
                {labels.linkText}
              </span>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-highest)" }}
              />
            </label>
            <label className="min-w-[10rem] flex-[2] text-xs">
              <span className="mb-1 block font-semibold uppercase tracking-wider" style={{ color: "var(--adm-on-variant)" }}>
                {labels.linkUrl}
              </span>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-highest)" }}
              />
            </label>
            <button
              type="button"
              onClick={insertLink}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ background: "var(--adm-primary-container)" }}
            >
              {labels.linkInsert}
            </button>
            <button
              type="button"
              onClick={() => setShowLinkForm(false)}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--adm-outline-variant)", color: "var(--adm-on-variant)" }}
            >
              {labels.linkCancel}
            </button>
          </div>
        )}

        {imageError && (
          <p className="text-xs" style={{ color: "var(--adm-error)" }}>
            {imageError}
          </p>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImageFile(file);
          e.target.value = "";
        }}
      />

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={syncSelection}
          onKeyUp={syncSelection}
          onMouseUp={syncSelection}
          onFocus={syncSelection}
          rows={18}
          placeholder={labels.placeholder}
          style={{
            ...inputStyle,
            resize: "vertical",
            border: "none",
            borderRadius: 0,
            fontFamily: "ui-monospace, monospace",
          }}
        />
      ) : (
        <div className="min-h-[320px] p-3">
          {value.trim() ? (
            <MarkdownPreview content={value} />
          ) : (
            <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>
              {labels.placeholder}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
