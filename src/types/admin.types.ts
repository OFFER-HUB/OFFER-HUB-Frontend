// ─── Status & Role ────────────────────────────────────────────────────────────

export type AdminUserStatus =
  | "ACTIVE"
  | "BANNED"
  | "SUSPENDED"
  | "PENDING_VERIFICATION";

export type AdminUserRole = "BUYER" | "SELLER" | "BOTH" | "ADMIN";

// ─── Activity Log ─────────────────────────────────────────────────────────────

export type UserActivityType =
  | "ACCOUNT_CREATED"
  | "PROFILE_UPDATED"
  | "ROLE_CHANGED"
  | "STATUS_CHANGED"
  | "BAN"
  | "UNBAN";

export interface UserActivityRecord {
  id: string;
  type: UserActivityType;
  /** Human-readable description, e.g. "Role changed from BUYER to SELLER" */
  description: string;
  /** "system" | admin username | "user" */
  performedBy: string;
  createdAt: string; // ISO 8601
}

/** Color class per activity type — icon is resolved in the component via ICON_PATHS */
export const USER_ACTIVITY_COLOR: Record<UserActivityType, string> = {
  ACCOUNT_CREATED: "text-text-secondary",
  PROFILE_UPDATED: "text-primary",
  ROLE_CHANGED: "text-primary",
  STATUS_CHANGED: "text-warning",
  BAN: "text-error",
  UNBAN: "text-success",
};

// ─── Ban History ──────────────────────────────────────────────────────────────

export interface BanRecord {
  id: string;
  adminId: string;
  adminUsername: string;
  /** BAN when the user was banned, UNBAN when the ban was lifted */
  action: "BAN" | "UNBAN";
  reason: string;
  createdAt: string; // ISO 8601
}

// ─── User Statistics ──────────────────────────────────────────────────────────

export interface AdminUserStats {
  totalOrders: number;
  completedOrders: number;
  /** Pre-formatted, e.g. "$12,340.00" */
  totalEarnings: string;
  /** Pre-formatted, e.g. "$3,200.00" */
  totalSpent: string;
  /** 0.0 – 5.0 */
  averageRating: number;
  ratingCount: number;
  joinedDaysAgo: number;
}

// ─── Admin User ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  type: AdminUserRole;
  status: AdminUserStatus;
  registeredAt: string; // ISO 8601
  lastActiveAt: string; // ISO 8601
  stats: AdminUserStats;
  banHistory: BanRecord[];
  activityHistory: UserActivityRecord[];
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

export type AdminUserSortField =
  | "username"
  | "email"
  | "registeredAt"
  | "lastActiveAt"
  | "totalOrders"
  | "totalEarnings"
  | "averageRating";

export type SortDirection = "asc" | "desc";

export interface AdminUsersSort {
  field: AdminUserSortField;
  direction: SortDirection;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export type AdminUserStatusFilter = AdminUserStatus | "ALL";
export type AdminUserRoleFilter = AdminUserRole | "ALL";

export interface AdminUsersFilters {
  search: string;
  status: AdminUserStatusFilter;
  role: AdminUserRoleFilter;
  /** ISO date string or empty string (no filter) */
  registeredAfter: string;
  /** ISO date string or empty string (no filter) */
  registeredBefore: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface UpdateAdminUserPayload {
  username?: string;
  email?: string;
  type?: AdminUserRole;
  status?: AdminUserStatus;
}

export interface BanUserPayload {
  reason: string;
}

// ─── Config Maps (UI display helpers) ────────────────────────────────────────

export const ADMIN_USER_STATUS_CONFIG: Record<
  AdminUserStatus,
  { label: string; color: string; bg: string }
> = {
  ACTIVE: {
    label: "Active",
    color: "text-success",
    bg: "bg-success/10",
  },
  BANNED: {
    label: "Banned",
    color: "text-error",
    bg: "bg-error/10",
  },
  SUSPENDED: {
    label: "Suspended",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  PENDING_VERIFICATION: {
    label: "Pending",
    color: "text-text-secondary",
    bg: "bg-gray-100",
  },
};

export const ADMIN_USER_ROLE_LABELS: Record<AdminUserRole, string> = {
  BUYER: "Buyer",
  SELLER: "Seller",
  BOTH: "Both",
  ADMIN: "Admin",
};

// ─── Admin Disputes ───────────────────────────────────────────────────────────

import type { DisputeStatus, DisputeReason, DisputeEvidence, DisputeEvent, DisputeComment } from "@/types/dispute.types";

export type DisputePriority = "low" | "medium" | "high" | "critical";
export type DisputeResolutionOutcome = "buyer_wins" | "seller_wins" | "split" | "dismissed";

export interface AdminDisputeParty {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  totalDisputes: number;
  previousDisputes: AdminDisputeSummary[];
}

export interface AdminDisputeSummary {
  id: string;
  offerTitle: string;
  status: DisputeStatus;
  outcome?: DisputeResolutionOutcome;
  createdAt: string;
}

export interface AdminDisputeNote {
  id: string;
  content: string;
  adminUsername: string;
  createdAt: string;
}

export interface AdminDispute {
  id: string;
  offerId: string;
  offerTitle: string;
  /** Dispute amount in dollars, e.g. 350.00 */
  amount: number;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  priority: DisputePriority;
  evidence: DisputeEvidence[];
  events: DisputeEvent[];
  comments: DisputeComment[];
  /** The buyer/client party */
  buyer: AdminDisputeParty;
  /** The seller/freelancer party */
  seller: AdminDisputeParty;
  resolution?: string;
  resolutionOutcome?: DisputeResolutionOutcome;
  resolvedAt?: string;
  resolvedBy?: string;
  internalNotes: AdminDisputeNote[];
  createdAt: string;
  updatedAt: string;
}

// ─── Admin Dispute Sorting ────────────────────────────────────────────────────

export type AdminDisputeSortField =
  | "createdAt"
  | "updatedAt"
  | "amount"
  | "priority"
  | "status";

export interface AdminDisputesSort {
  field: AdminDisputeSortField;
  direction: SortDirection;
}

// ─── Admin Dispute Filters ────────────────────────────────────────────────────

export type AdminDisputeStatusFilter = DisputeStatus | "ALL";
export type AdminDisputePriorityFilter = DisputePriority | "ALL";

export interface AdminDisputesFilters {
  search: string;
  status: AdminDisputeStatusFilter;
  priority: AdminDisputePriorityFilter;
  reason: DisputeReason | "ALL";
  openedAfter: string;
  openedBefore: string;
}

// ─── Admin Dispute API Payloads ───────────────────────────────────────────────

export interface ResolveDisputePayload {
  outcome: DisputeResolutionOutcome;
  resolution: string;
}

export interface AddDisputeNotePayload {
  content: string;
}

export interface UpdateDisputeStatusPayload {
  status: DisputeStatus;
}

// ─── Config Maps ─────────────────────────────────────────────────────────────

export const ADMIN_DISPUTE_STATUS_CONFIG: Record<
  DisputeStatus,
  { label: string; color: string; bg: string }
> = {
  open: { label: "Open", color: "text-warning", bg: "bg-warning/10" },
  under_review: { label: "Under Review", color: "text-primary", bg: "bg-primary/10" },
  resolved: { label: "Resolved", color: "text-success", bg: "bg-success/10" },
  closed: { label: "Closed", color: "text-text-secondary", bg: "bg-gray-100" },
};

export const ADMIN_DISPUTE_PRIORITY_CONFIG: Record<
  DisputePriority,
  { label: string; color: string; bg: string }
> = {
  low: { label: "Low", color: "text-text-secondary", bg: "bg-gray-100" },
  medium: { label: "Medium", color: "text-primary", bg: "bg-primary/10" },
  high: { label: "High", color: "text-warning", bg: "bg-warning/10" },
  critical: { label: "Critical", color: "text-error", bg: "bg-error/10" },
};

export const ADMIN_DISPUTE_OUTCOME_CONFIG: Record<
  DisputeResolutionOutcome,
  { label: string; color: string }
> = {
  buyer_wins: { label: "Buyer Wins", color: "text-primary" },
  seller_wins: { label: "Seller Wins", color: "text-success" },
  split: { label: "Split", color: "text-warning" },
  dismissed: { label: "Dismissed", color: "text-text-secondary" },
};

export const RESOLUTION_TEMPLATES: string[] = [
  "After reviewing all evidence, we find in favor of the buyer. A full refund will be issued.",
  "After reviewing all evidence, we find in favor of the seller. Payment will be released.",
  "Both parties have agreed to a 50/50 split of the disputed amount.",
  "This dispute has been dismissed as the issue was resolved directly between parties.",
  "The work delivered meets the agreed specifications. Payment will be released to the seller.",
  "The delivered work does not meet agreed standards. A partial refund of 50% will be issued.",
];
