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
    const reason = window.prompt("Reject reason (optional):");
    const result = await rejectPost(postId, reason ?? undefined);
    if (result.error) alert(result.error);
    else router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleApprove}
        className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
      >
        {t("approve")}
      </button>
      <button
        type="button"
        onClick={handleReject}
        className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        {t("reject")}
      </button>
    </div>
  );
}
