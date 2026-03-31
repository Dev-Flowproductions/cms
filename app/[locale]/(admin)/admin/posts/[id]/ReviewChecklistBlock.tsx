"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { getReviewChecklist, saveReviewChecklist, approvePost, rejectPost } from "../../review-queue/actions";
import { DEFAULT_CHECKLIST_KEYS } from "../../review-queue/constants";

const CHECKLIST_LABELS: Record<string, string> = {
  credibility: "Credibility — all claims are accurate and attributable",
  brand_voice: "Brand voice — tone matches the client's website",
  entity_accuracy: "Entity accuracy — names, dates, and facts are correct",
  intent_completeness: "Intent completeness — post fully answers the search intent",
  formatting: "Formatting — structure follows the required template",
};

export function ReviewChecklistBlock({ postId }: { postId: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Array<{ key: string; label: string; passed: boolean; notes: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReviewChecklist(postId).then((data) => {
      if (data?.items && Array.isArray(data.items)) {
        setItems(
          (data.items as Array<{ key: string; label: string; passed: boolean; notes?: string }>).map((i) => ({
            ...i,
            notes: i.notes ?? "",
          }))
        );
      } else {
        setItems(
          DEFAULT_CHECKLIST_KEYS.map((key) => ({
            key,
            label: CHECKLIST_LABELS[key] ?? key,
            passed: false,
            notes: "",
          }))
        );
      }
      setLoading(false);
    });
  }, [postId]);

  const allPassed = items.length > 0 && items.every((i) => i.passed);

  function setItemPassed(index: number, passed: boolean) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, passed } : item));
  }

  function setItemNotes(index: number, notes: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, notes } : item));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      await saveReviewChecklist(postId, items, allPassed ? "passed" : "pending");
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    setError(null);
    // Save checklist first so status is up-to-date
    try {
      await saveReviewChecklist(postId, items, allPassed ? "passed" : "pending");
    } catch { /* non-fatal */ }

    const result = await approvePost(postId);
    if (result.error) {
      setError(result.error);
      setApproving(false);
      return;
    }

    // Fire webhook if this post's author has one configured
    try {
      await fetch(`/api/publish/${postId}`, { method: "POST" });
    } catch { /* non-fatal — webhook failure doesn't block approval */ }

    setApproving(false);
    router.refresh();
  }

  async function handleReject() {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return; // cancelled
    setRejecting(true);
    setError(null);
    const result = await rejectPost(postId, reason || undefined);
    setRejecting(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl p-5" style={{ border: "1px solid var(--adm-border-subtle)", background: "var(--adm-surface-high)" }}>
        <p className="text-sm" style={{ color: "var(--adm-on-variant)" }}>Loading checklist…</p>
      </div>
    );
  }

  return (
    <div
      className="mt-6 rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(104, 57, 234, 0.35)", background: "var(--adm-surface-high)" }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--adm-border-subtle)", background: "rgba(104, 57, 234, 0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(104, 57, 234, 0.15)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--adm-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--adm-primary)" }}>
              Review checklist
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--adm-on-variant)" }}>
              {items.filter((i) => i.passed).length} / {items.length} items passed
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--adm-border-subtle)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${items.length ? (items.filter((i) => i.passed).length / items.length) * 100 : 0}%`,
              background: allPassed ? "#4ade80" : "var(--adm-primary)",
            }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="px-6 py-5 space-y-3">
        {items.map((item, i) => (
          <div
            key={item.key}
            className="rounded-xl px-4 py-3 transition-all"
            style={{
              background: item.passed ? "rgba(34,211,160,0.06)" : "var(--adm-surface-highest)",
              border: item.passed ? "1px solid rgba(34,211,160,0.2)" : "1px solid var(--adm-border-subtle)",
            }}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setItemPassed(i, !item.passed)}
                className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: item.passed ? "#4ade80" : "var(--adm-surface-high)",
                  border: item.passed ? "none" : "1px solid var(--adm-border-subtle)",
                }}
              >
                {item.passed && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: item.passed ? "var(--adm-on-surface)" : "var(--adm-on-variant)" }}>
                  {CHECKLIST_LABELS[item.key] ?? item.key}
                </p>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={item.notes}
                  onChange={(e) => setItemNotes(i, e.target.value)}
                  className="mt-1.5 w-full text-xs px-2.5 py-1.5 rounded-lg outline-none transition-all"
                  style={{
                    background: "var(--adm-surface-high)",
                    border: "1px solid var(--adm-border-subtle)",
                    color: "var(--adm-on-surface)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--adm-primary)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--adm-border-subtle)"; }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer — actions */}
      {error && (
        <div className="mx-6 mb-4 px-4 py-2.5 rounded-xl text-xs" style={{ background: "rgba(255, 180, 171, 0.08)", border: "1px solid rgba(255, 180, 171, 0.28)", color: "var(--adm-error)" }}>
          {error}
        </div>
      )}

      <div
        className="px-6 py-4 flex items-center gap-3 flex-wrap"
        style={{ borderTop: "1px solid var(--adm-border-subtle)" }}
      >
        {/* Save checklist */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "var(--adm-surface-highest)",
            color: "var(--adm-on-variant)",
            border: "1px solid var(--adm-border-subtle)",
          }}
        >
          {saving ? "Saving…" : "Save checklist"}
        </button>
        {savedOk && <span className="text-xs font-medium" style={{ color: "#4ade80" }}>✓ Saved</span>}

        <div className="flex-1" />

        {/* Reject */}
        <button
          type="button"
          onClick={handleReject}
          disabled={rejecting || approving}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "rgba(255, 180, 171, 0.1)",
            color: "var(--adm-error)",
            border: "1px solid rgba(255, 180, 171, 0.25)",
          }}
        >
          {rejecting ? "Rejecting…" : "Reject — send back to draft"}
        </button>

        {/* Approve */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving || rejecting || !allPassed}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: allPassed ? "var(--adm-gradient-cta)" : "var(--adm-surface-highest)",
            color: allPassed ? "#fff" : "var(--adm-on-variant)",
            border: allPassed ? "none" : "1px solid var(--adm-border-subtle)",
            boxShadow: allPassed ? "var(--adm-cta-glow-shadow)" : "none",
          }}
          title={!allPassed ? "Tick all checklist items before approving" : undefined}
        >
          {approving ? (
            <>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
              Approving…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Approve post
            </>
          )}
        </button>
        {!allPassed && (
          <p className="w-full text-xs text-right" style={{ color: "var(--adm-on-variant)" }}>
            Tick all items to enable approval
          </p>
        )}
      </div>
    </div>
  );
}
