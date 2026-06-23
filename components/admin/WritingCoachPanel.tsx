"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PostStructureSection } from "@/lib/agent/post-structure-guide";
import type { Locale } from "@/lib/types/db";

const DEFAULT_TIPS: Record<Locale, string[]> = {
  en: [
    "Add a title, then open with 2–3 intro sentences.",
    "Include one data-backed claim and a bold definition of your main term.",
  ],
  pt: [
    "Adicione um título e comece com 2–3 frases de introdução.",
    "Inclua uma afirmação com dados e a definição a negrito do termo principal.",
  ],
  fr: [
    "Ajoutez un titre, puis 2–3 phrases d'introduction.",
    "Incluez une affirmation appuyée par des données et une définition en gras du terme clé.",
  ],
};

export function WritingCoachPanel({
  authorUserId,
  locale,
  title,
  content,
  structureSections,
  labels,
}: {
  authorUserId: string;
  locale: Locale;
  title: string;
  content: string;
  structureSections: PostStructureSection[];
  labels: {
    title: string;
    subtitle: string;
    refresh: string;
    loading: string;
    empty: string;
    checklist: string;
    showChecklist: string;
    hideChecklist: string;
    error: string;
  };
}) {
  const [tips, setTips] = useState<string[]>(DEFAULT_TIPS[locale] ?? DEFAULT_TIPS.en);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchTips = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/agent/composer-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author_user_id: authorUserId,
            locale,
            title,
            content_md: content,
          }),
          signal,
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? labels.error);
          return;
        }
        if (Array.isArray(json.tips) && json.tips.length > 0) {
          setTips(json.tips);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(labels.error);
      } finally {
        setLoading(false);
      }
    },
    [authorUserId, locale, title, content, labels.error]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const hasDraft = title.trim().length > 0 || content.trim().length > 20;
    if (!hasDraft) {
      setTips(DEFAULT_TIPS[locale] ?? DEFAULT_TIPS.en);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      void fetchTips(controller.signal);
    }, 3500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [title, content, locale, fetchTips]);

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}
    >
      <div
        className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--adm-border-subtle)", background: "var(--adm-primary-soft-bg)" }}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--adm-primary-container)", boxShadow: "var(--adm-cta-glow-shadow)" }}
          >
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--adm-on-surface)" }}>
              {labels.title}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--adm-on-variant)" }}>
              {labels.subtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchTips()}
          disabled={loading}
          className="shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
          style={{
            borderColor: "var(--adm-outline-variant)",
            color: "var(--adm-primary)",
            background: "var(--adm-surface-highest)",
          }}
        >
          {loading ? labels.loading : labels.refresh}
        </button>
      </div>

      <div className="px-4 py-3 space-y-2">
        {error && (
          <p className="text-xs" style={{ color: "var(--adm-error)" }}>
            {error}
          </p>
        )}
        <ul className="space-y-2">
          {tips.map((tip) => (
            <li
              key={tip}
              className="flex gap-2 text-xs leading-relaxed"
              style={{ color: "var(--adm-on-surface)" }}
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--adm-primary)" }} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        {tips.length === 0 && !loading && (
          <p className="text-xs" style={{ color: "var(--adm-on-variant)" }}>
            {labels.empty}
          </p>
        )}
      </div>

      <div className="border-t px-4 py-2" style={{ borderColor: "var(--adm-border-subtle)" }}>
        <button
          type="button"
          onClick={() => setShowChecklist((v) => !v)}
          className="text-xs font-semibold"
          style={{ color: "var(--adm-primary)" }}
        >
          {showChecklist ? labels.hideChecklist : labels.showChecklist}
        </button>
        {showChecklist && (
          <div className="mt-3 space-y-3 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-on-variant)" }}>
              {labels.checklist}
            </p>
            {structureSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--adm-on-surface)" }}>
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0"
                      style={{ color: "var(--adm-on-variant)" }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
