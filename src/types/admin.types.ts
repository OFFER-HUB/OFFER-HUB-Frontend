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
//
// Mirrors the backend's `DisputeWithRelations` (apps/api resolution.types.ts):
// the dispute row plus its order with both parties, milestones and escrow.
// Enum values are the Prisma ones, uppercase — not the buyer-side
// `dispute.types.ts` vocabulary.

import type { OrderStatus } from "@/types/order.types";

export type AdminDisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED";
export type AdminDisputeReason = "NOT_DELIVERED" | "QUALITY_ISSUE" | "OTHER";
export type DisputeOpenedBy = "BUYER" | "SELLER";
export type ResolutionDecision = "FULL_RELEASE" | "FULL_REFUND" | "SPLIT";

export interface AdminDisputeParty {
  id: string;
  email: string | null;
}

export interface AdminDisputeMilestone {
  id: string;
  title: string;
  description?: string | null;
  /** Decimal string, e.g. "50.00" */
  amount: string;
  status: "OPEN" | "COMPLETED";
  completedAt?: string | null;
}

export interface AdminDisputeOrder {
  id: string;
  title: string;
  description?: string | null;
  /** Decimal string, e.g. "220.00" */
  amount: string;
  currency: string;
  status: OrderStatus;
  buyerId: string;
  sellerId: string;
  buyer: AdminDisputeParty;
  seller: AdminDisputeParty;
  service: { id: string; title: string } | null;
  escrow: { id: string; status: string } | null;
  milestones: AdminDisputeMilestone[];
  createdAt: string;
}

export interface AdminDispute {
  id: string;
  orderId: string;
  openedBy: DisputeOpenedBy;
  reason: AdminDisputeReason;
  /** Evidence URLs as stored — the backend keeps a JSON array of strings. */
  evidence: string[];
  status: AdminDisputeStatus;
  resolutionDecision: ResolutionDecision | null;
  decisionNote: string | null;
  createdAt: string;
  updatedAt: string;
  order: AdminDisputeOrder;
}

// ─── Listing ──────────────────────────────────────────────────────────────────

/** `GET /disputes` pages with a cursor-less `hasMore`, no total. */
export interface AdminDisputesPage {
  disputes: AdminDispute[];
  hasMore: boolean;
}

export type AdminDisputeStatusFilter = AdminDisputeStatus | "ALL";
export type AdminDisputeOpenedByFilter = DisputeOpenedBy | "ALL";

/** The filters `GET /disputes` actually supports. */
export interface AdminDisputesFilters {
  status: AdminDisputeStatusFilter;
  openedBy: AdminDisputeOpenedByFilter;
}

export interface AdminDisputesQuery extends AdminDisputesFilters {
  page: number;
  limit: number;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

/** `ResolveDisputeDto` — amounts are decimal strings with two places and must sum to the order amount for SPLIT. */
export interface ResolveDisputePayload {
  decision: ResolutionDecision;
  releaseAmount?: string;
  refundAmount?: string;
  note?: string;
}

// ─── Config Maps ─────────────────────────────────────────────────────────────

export const ADMIN_DISPUTE_STATUS_CONFIG: Record<
  AdminDisputeStatus,
  { label: string; color: string; bg: string }
> = {
  OPEN: { label: "Open", color: "text-warning", bg: "bg-warning/10" },
  UNDER_REVIEW: { label: "Under Review", color: "text-primary", bg: "bg-primary/10" },
  RESOLVED: { label: "Resolved", color: "text-success", bg: "bg-success/10" },
};

export const ADMIN_DISPUTE_REASON_LABELS: Record<AdminDisputeReason, string> = {
  NOT_DELIVERED: "Not delivered",
  QUALITY_ISSUE: "Quality issue",
  OTHER: "Other",
};

export const DISPUTE_OPENED_BY_LABELS: Record<DisputeOpenedBy, string> = {
  BUYER: "Buyer",
  SELLER: "Seller",
};

export const RESOLUTION_DECISION_CONFIG: Record<
  ResolutionDecision,
  { label: string; description: string; color: string; bg: string }
> = {
  FULL_RELEASE: {
    label: "Release to seller",
    description: "The work stands. The full escrow amount goes to the seller.",
    color: "text-success",
    bg: "bg-success/10",
  },
  FULL_REFUND: {
    label: "Refund buyer",
    description: "Nothing usable was delivered. The full amount goes back to the buyer.",
    color: "text-error",
    bg: "bg-error/10",
  },
  SPLIT: {
    label: "Split",
    description: "Pay the seller for completed work and refund the rest to the buyer.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
};

/** What to call a party in admin UI — rows only carry id and email. */
export function disputePartyName(party: AdminDisputeParty): string {
  return party.email ?? party.id;
}
