"use client";

import { useRouter } from "@/lib/navigation";
import { approvePost, rejectPost } from "./actions";
import { useTranslations } from "next-intl";

export function ApproveRejectButtons({ postId }: { postId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();

  async function handleApprove() {
    const result = await approvePost(postId);
    if (result.error) alert(result.error);
    else router.refresh();
  }

  async function handleReject() {
    const reason = window.prompt(t("reviewQueuePage.rejectPrompt"));
    const result = await rejectPost(postId, reason ?? undefined);
    if (result.error) alert(result.error);
    else router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleApprove}
        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        style={{ background: "var(--gradient-success)", color: "var(--bg)" }}
      >
        {t("approve")}
      </button>
      <button
        type="button"
        onClick={handleReject}
        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid rgba(255,92,106,0.2)" }}
      >
        {t("reject")}
      </button>
    </div>
  );
}
