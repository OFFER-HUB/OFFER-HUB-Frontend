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
