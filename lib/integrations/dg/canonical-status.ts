import type { PostStatus } from "@/lib/types/db";

/** Shared public lifecycle enum (docs/00_shared_integration_contract_dg_ai_cms.md). */
export type DgCanonicalArticleStatus =
  | "queued"
  | "drafting"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "failed";

const LABELS: Record<DgCanonicalArticleStatus, string> = {
  queued: "Queued",
  drafting: "Drafting",
  review: "In review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
};

export function dgCanonicalStatusLabel(status: DgCanonicalArticleStatus): string {
  return LABELS[status];
}

/** Map internal post.status to the canonical enum before syncing to DG. */
export function mapPostStatusToDgCanonical(status: PostStatus): DgCanonicalArticleStatus {
  switch (status) {
    case "idea":
      return "queued";
    case "research":
    case "draft":
    case "optimize":
    case "format":
      return "drafting";
    case "review":
      return "review";
    case "approved":
      return "approved";
    case "scheduled":
      return "scheduled";
    case "published":
      return "published";
    case "archived":
      return "failed";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
