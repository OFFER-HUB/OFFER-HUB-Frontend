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

export type DisputeEventType =
  | "created"
  | "evidence_added"
  | "status_changed"
  | "comment_added"
  | "resolved";

export interface DisputeEvent {
  id: string;
  type: DisputeEventType;
  description: string;
  timestamp: string;
  actor: string;
  actorRole: "client" | "freelancer" | "admin";
}

export interface DisputeComment {
  id: string;
  content: string;
  author: string;
  authorRole: "client" | "freelancer" | "admin";
  timestamp: string;
}

export interface Dispute {
  id: string;
  offerId: string;
  offerTitle: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  evidence: DisputeEvidence[];
  events: DisputeEvent[];
  comments: DisputeComment[];
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  freelancerName?: string;
  clientName?: string;
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
