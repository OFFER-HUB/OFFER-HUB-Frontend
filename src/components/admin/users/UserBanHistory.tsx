"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { formatDateTime } from "@/lib/date-formatters";
import type { AdminUserDetail } from "@/types/admin.types";

export interface UserBanHistoryProps {
  detail: AdminUserDetail | null;
}

/**
 * Displays the suspension history for a user inside the UserEditModal.
 * When the user has no ban history, or the detail has not loaded yet,
 * the section renders nothing so the modal stays compact.
 */
export function UserBanHistory({ detail }: UserBanHistoryProps) {
  // Only render for suspended users who have a record
  if (!detail || detail.status !== "SUSPENDED") return null;

  return (
    <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-4 space-y-3")}>
      <div className="flex items-center gap-2">
        <Icon path={ICON_PATHS.flag} size="sm" className="text-error shrink-0" />
        <p className="text-xs font-semibold text-error uppercase tracking-wider">
          Account Suspended
        </p>
      </div>

      <div className="space-y-1 text-xs text-text-secondary">
        <div className="flex justify-between gap-2">
          <span className="font-medium text-text-primary">Status</span>
          <span className="text-error font-semibold">Suspended</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="font-medium text-text-primary">Last updated</span>
          <span>{formatDateTime(detail.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
