export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export type DisputeReason =
  | "quality_issues"
  | "deadline_missed"
  | "communication_problems"
  | "payment_dispute"
  | "scope_disagreement"
  | "other";

export interface DisputeEvidence {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Dispute {
  id: string;
  offerId: string;
  offerTitle: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  evidence: DisputeEvidence[];
  createdAt: string;
  updatedAt: string;
  resolution?: string;
}

export interface DisputeFormData {
  offerId: string;
  reason: DisputeReason;
  description: string;
  evidence: File[];
}

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  quality_issues: "Quality Issues",
  deadline_missed: "Deadline Missed",
  communication_problems: "Communication Problems",
  payment_dispute: "Payment Dispute",
  scope_disagreement: "Scope Disagreement",
  other: "Other",
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: "Open",
  under_review: "Under Review",
  resolved: "Resolved",
  closed: "Closed",
};
