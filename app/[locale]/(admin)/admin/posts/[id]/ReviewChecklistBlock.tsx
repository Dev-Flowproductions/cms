"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import {
  getReviewChecklist,
  saveReviewChecklist,
} from "../../review-queue/actions";
import { DEFAULT_CHECKLIST_KEYS } from "../../review-queue/constants";
import { useTranslations } from "next-intl";

const CHECKLIST_MESSAGE_KEYS: Record<string, string> = {
  credibility: "credibility",
  brand_voice: "brandVoice",
  entity_accuracy: "entityAccuracy",
  intent_completeness: "intentCompleteness",
  formatting: "formatting",
};

export function ReviewChecklistBlock({ postId }: { postId: string }) {
  const t = useTranslations("admin");
  const tChecklist = useTranslations("checklist");
  const router = useRouter();
  const [items, setItems] = useState<Array<{ key: string; label: string; passed: boolean; notes?: string }>>([]);
  const [status, setStatus] = useState<"pending" | "passed" | "failed">("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getReviewChecklist(postId).then((data) => {
      if (data?.items && Array.isArray(data.items)) {
        setItems(data.items as Array<{ key: string; label: string; passed: boolean; notes?: string }>);
        setStatus((data.status as "pending" | "passed" | "failed") ?? "pending");
      } else {
        setItems(
          DEFAULT_CHECKLIST_KEYS.map((key) => ({
            key,
            label: key,
            passed: false,
            notes: "",
          }))
        );
      }
      setLoading(false);
    });
  }, [postId]);

  async function handleSave() {
    setSaving(true);
    const allPassed = items.every((i) => i.passed);
    await saveReviewChecklist(postId, items, allPassed ? "passed" : "pending");
    setStatus(allPassed ? "passed" : "pending");
    setSaving(false);
    router.refresh();
  }

  function setItemPassed(index: number, passed: boolean) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], passed };
      return next;
    });
  }

  function setItemNotes(index: number, notes: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], notes };
      return next;
    });
  }

  if (loading) return <p className="text-sm text-gray-500">Loading checklist...</p>;

  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded p-4">
      <h2 className="font-medium mb-4">{t("checklist")}</h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={item.key} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={item.passed}
              onChange={(e) => setItemPassed(i, e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <span className="text-sm">{tChecklist((CHECKLIST_MESSAGE_KEYS[item.key] ?? item.key) as "credibility" | "brandVoice" | "entityAccuracy" | "intentCompleteness" | "formatting")}</span>
              <input
                type="text"
                placeholder="Notes"
                value={item.notes ?? ""}
                onChange={(e) => setItemNotes(i, e.target.value)}
                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-gray-500">Status: {status}</p>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-3 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-sm disabled:opacity-50"
      >
        {saving ? "Saving..." : t("save", { ns: "common" })}
      </button>
    </section>
  );
}
