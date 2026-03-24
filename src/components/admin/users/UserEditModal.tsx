"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, NEUMORPHIC_INPUT } from "@/lib/styles";
import {
  ADMIN_USER_STATUS_CONFIG,
  ADMIN_USER_ROLE_LABELS,
  USER_ACTIVITY_COLOR,
  type AdminUser,
  type UpdateAdminUserPayload,
  type AdminUserRole,
  type AdminUserStatus,
  type BanRecord,
  type UserActivityRecord,
  type UserActivityType,
} from "@/types/admin.types";

export interface UserEditModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSave: (userId: string, payload: UpdateAdminUserPayload) => Promise<void>;
  /** Opens the BanUserModal for this user */
  onBan: (user: AdminUser) => void;
}

interface FormData {
  username: string;
  email: string;
  type: AdminUserRole;
  status: AdminUserStatus;
}

// ─── Ban History sub-component ────────────────────────────────────────────────

function BanHistorySection({ records }: { records: BanRecord[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-gray-100 pt-4">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between w-full text-sm font-medium text-text-primary hover:text-primary transition-colors"
      >
        <span>
          Ban History{" "}
          <span className="text-text-secondary font-normal">({records.length})</span>
        </span>
        <Icon
          path={ICON_PATHS.chevronDown}
          size="sm"
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {records.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-3">No ban history.</p>
          ) : (
            [...records].reverse().map((record) => (
              <div
                key={record.id}
                className={cn(NEUMORPHIC_INSET, "rounded-xl p-3 text-xs space-y-1")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide",
                      record.action === "BAN"
                        ? "bg-error/10 text-error"
                        : "bg-success/10 text-success"
                    )}
                  >
                    {record.action === "BAN" ? "Banned" : "Unbanned"}
                  </span>
                  <span className="text-text-secondary shrink-0">
                    {new Date(record.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-text-secondary">{record.reason}</p>
                <p className="text-text-secondary/70">
                  by{" "}
                  <span className="font-medium text-text-secondary">{record.adminUsername}</span>
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Activity Log sub-component ──────────────────────────────────────────────

const ACTIVITY_ICON: Record<UserActivityType, string> = {
  ACCOUNT_CREATED: ICON_PATHS.user,
  PROFILE_UPDATED: ICON_PATHS.edit,
  ROLE_CHANGED: ICON_PATHS.shield,
  STATUS_CHANGED: ICON_PATHS.alertCircle,
  BAN: ICON_PATHS.flag,
  UNBAN: ICON_PATHS.lock,
};

const ACTIVITY_LABEL: Record<UserActivityType, string> = {
  ACCOUNT_CREATED: "Created",
  PROFILE_UPDATED: "Profile",
  ROLE_CHANGED: "Role",
  STATUS_CHANGED: "Status",
  BAN: "Banned",
  UNBAN: "Unbanned",
};

function ActivityLogSection({ records }: { records: UserActivityRecord[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-gray-100 pt-4">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between w-full text-sm font-medium text-text-primary hover:text-primary transition-colors"
      >
        <span>
          Activity Log{" "}
          <span className="text-text-secondary font-normal">({records.length})</span>
        </span>
        <Icon
          path={ICON_PATHS.chevronDown}
          size="sm"
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {records.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-3">No activity recorded.</p>
          ) : (
            [...records].reverse().map((record) => (
              <div
                key={record.id}
                className={cn(NEUMORPHIC_INSET, "rounded-xl p-3 text-xs flex items-start gap-3")}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    USER_ACTIVITY_COLOR[record.type].replace("text-", "bg-") + "/10"
                  )}
                >
                  <Icon
                    path={ACTIVITY_ICON[record.type]}
                    size="sm"
                    className={USER_ACTIVITY_COLOR[record.type]}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className={cn(
                        "font-semibold text-[10px] uppercase tracking-wide",
                        USER_ACTIVITY_COLOR[record.type]
                      )}
                    >
                      {ACTIVITY_LABEL[record.type]}
                    </span>
                    <span className="text-text-secondary shrink-0">
                      {new Date(record.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-text-secondary leading-snug">{record.description}</p>
                  <p className="text-text-secondary/60 mt-0.5">
                    by{" "}
                    <span className="font-medium text-text-secondary">{record.performedBy}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stats Grid sub-component ─────────────────────────────────────────────────

function StatsGrid({ user }: { user: AdminUser }) {
  const { stats } = user;
  const statItems = [
    {
      icon: ICON_PATHS.shoppingCart,
      label: "Orders",
      value: `${stats.completedOrders}/${stats.totalOrders}`,
    },
    {
      icon: ICON_PATHS.currency,
      label: "Earnings",
      value: stats.totalEarnings,
    },
    {
      icon: ICON_PATHS.star,
      label: "Rating",
      value:
        stats.ratingCount > 0
          ? `${stats.averageRating.toFixed(1)} (${stats.ratingCount})`
          : "No ratings",
    },
    {
      icon: ICON_PATHS.calendar,
      label: "Member for",
      value: `${stats.joinedDaysAgo} days`,
    },
  ];

  return (
    <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-4")}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Statistics
      </p>
      <div className="grid grid-cols-2 gap-3">
        {statItems.map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon path={icon} size="sm" className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-secondary uppercase tracking-wide leading-none mb-0.5">
                {label}
              </p>
              <p className="text-xs font-semibold text-text-primary truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function UserEditModal({ isOpen, user, onClose, onSave, onBan }: UserEditModalProps) {
  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    type: "BUYER",
    status: "ACTIVE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form when user changes
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        type: user.type,
        status: user.status,
      });
      setError(null);
    }
  }, [user]);

  // Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !user) return null;

  async function handleSave() {
    if (!user) return;

    const trimmedUsername = form.username.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedUsername) {
      setError("Username cannot be empty.");
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(user.id, {
        username: trimmedUsername,
        email: trimmedEmail,
        type: form.type,
        status: form.status,
      });
      onClose();
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBan() {
    onClose();
    onBan(user!);
  }

  const statusCfg = ADMIN_USER_STATUS_CONFIG[user.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className={cn(
          NEUMORPHIC_CARD,
          "relative w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <Icon path={ICON_PATHS.close} size="md" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pr-10">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon path={ICON_PATHS.edit} size="md" className="text-primary" />
          </div>
          <div>
            <h2 id="edit-modal-title" className="text-lg font-bold text-text-primary">
              Edit User
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text-secondary">{user.email}</span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  statusCfg.color,
                  statusCfg.bg
                )}
              >
                {statusCfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="edit-username" className="block text-sm font-medium text-text-primary mb-1.5">
              Username
            </label>
            <input
              id="edit-username"
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              disabled={isSubmitting}
              className={cn(NEUMORPHIC_INPUT, "disabled:opacity-50")}
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-text-primary mb-1.5">
              Email
            </label>
            <input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={isSubmitting}
              className={cn(NEUMORPHIC_INPUT, "disabled:opacity-50")}
            />
          </div>
          <div className="relative">
            <label htmlFor="edit-role" className="block text-sm font-medium text-text-primary mb-1.5">
              Role
            </label>
            <select
              id="edit-role"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AdminUserRole }))}
              disabled={isSubmitting}
              className={cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer disabled:opacity-50")}
            >
              {(Object.keys(ADMIN_USER_ROLE_LABELS) as AdminUserRole[]).map((role) => (
                <option key={role} value={role}>
                  {ADMIN_USER_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            <span className="absolute right-3 bottom-3 text-text-secondary pointer-events-none">
              <Icon path={ICON_PATHS.chevronDown} size="sm" />
            </span>
          </div>
          <div className="relative">
            <label htmlFor="edit-status" className="block text-sm font-medium text-text-primary mb-1.5">
              Status
            </label>
            <select
              id="edit-status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdminUserStatus }))}
              disabled={isSubmitting}
              className={cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer disabled:opacity-50")}
            >
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Banned</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </select>
            <span className="absolute right-3 bottom-3 text-text-secondary pointer-events-none">
              <Icon path={ICON_PATHS.chevronDown} size="sm" />
            </span>
          </div>
        </div>

        {/* User statistics */}
        <div className="mb-5">
          <StatsGrid user={user} />
        </div>

        {/* Activity log */}
        <div className="mb-2">
          <ActivityLogSection records={user.activityHistory} />
        </div>

        {/* Ban history */}
        <div className="mb-5">
          <BanHistorySection records={user.banHistory} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 text-error text-sm mb-4">
            <Icon path={ICON_PATHS.alertCircle} size="sm" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-text-secondary hover:text-text-primary bg-background hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {user.status !== "BANNED" && (
            <button
              type="button"
              onClick={handleBan}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-error bg-error/10 hover:bg-error/20 transition-colors disabled:opacity-50"
            >
              <Icon path={ICON_PATHS.flag} size="sm" />
              Ban User
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-primary disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="text-white" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
