import type { DisputeStatus } from "@/types/dispute.types";

export const DISPUTE_STATUS_FILTERS = ["all", "open", "under_review", "resolved", "closed"] as const;

export type DisputeStatusFilter = (typeof DISPUTE_STATUS_FILTERS)[number];

const TAB_LABELS: Record<DisputeStatusFilter, string> = {
  all: "All",
  open: "Open",
  under_review: "Under Review",
  resolved: "Resolved",
  closed: "Closed",
};

/** Human-readable label for a dispute status filter tab. */
export function getTabLabel(status: DisputeStatusFilter): string {
  return TAB_LABELS[status];
}

export const DISPUTE_STATUS_COLORS: Record<DisputeStatus, string> = {
  open: "bg-warning/20 text-warning",
  under_review: "bg-primary/20 text-primary",
  resolved: "bg-success/20 text-success",
  closed: "bg-text-secondary/20 text-text-secondary",
};