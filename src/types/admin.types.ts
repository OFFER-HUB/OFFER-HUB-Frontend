// ─── Status & Role ────────────────────────────────────────────────────────────

/** Prisma `UserStatus`. A banned account is `SUSPENDED` — there is no separate BANNED value. */
export type AdminUserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export type AdminUserRole = "BUYER" | "SELLER" | "BOTH";

// ─── Admin User ───────────────────────────────────────────────────────────────

/** One row of `GET /admin/users` — the backend's `USER_SELECT`, nothing derived. */
export interface AdminUser {
  id: string;
  externalUserId: string;
  /** Wallet-first accounts may have no email yet. */
  email: string | null;
  type: AdminUserRole;
  status: AdminUserStatus;
  emailVerified: boolean;
  emailVerifiedAt: string | null; // ISO 8601
  avatarUrl: string | null;
  bio: string | null;
  professionalTitle: string | null;
  location: string | null;
  timezone: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** `GET /admin/users/:id` — the row plus the aggregates the backend computes for one user. */
export interface AdminUserDetail extends AdminUser {
  skills: { name: string; level: string | null }[];
  balance: { available: string; reserved: string; currency: string } | null;
  _count: {
    buyerOrders: number;
    sellerOrders: number;
    services: number;
    applications: number;
  };
  stats: {
    completedOrders: number;
    /** Decimal string, e.g. "1250.00" */
    totalEarnings: string;
    /** Decimal string 0–5, or null when the user has no rated services */
    averageRating: string | null;
  };
}

// ─── Listing ──────────────────────────────────────────────────────────────────

export interface AdminUsersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUsersPage {
  users: AdminUser[];
  meta: AdminUsersMeta;
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

/** The only `sortBy` values `AdminUsersQueryDto` accepts. */
export type AdminUserSortField = "createdAt" | "email" | "status";

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

/** Everything the list endpoint is asked for; filtering, sorting and paging happen server-side. */
export interface AdminUsersQuery extends AdminUsersFilters {
  sort: AdminUsersSort;
  page: number;
  limit: number;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

/** Fields `AdminUpdateUserDto` accepts. Status changes go through ban/unban, not here. */
export interface UpdateAdminUserPayload {
  email?: string;
  type?: AdminUserRole;
  bio?: string;
  professionalTitle?: string;
  location?: string;
  timezone?: string;
}

export interface BanUserPayload {
  reason?: string;
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
  SUSPENDED: {
    label: "Suspended",
    color: "text-error",
    bg: "bg-error/10",
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
};

/**
 * What to call a user in admin UI. There is no username on the row, so fall
 * back through the fields that are actually there.
 */
export function adminUserDisplayName(user: Pick<AdminUser, "email" | "professionalTitle" | "externalUserId">): string {
  return user.email ?? user.professionalTitle ?? user.externalUserId;
}

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
