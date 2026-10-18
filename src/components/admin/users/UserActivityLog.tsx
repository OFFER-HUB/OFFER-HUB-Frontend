"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { formatDateTime } from "@/lib/date-formatters";
import type { AdminUserDetail } from "@/types/admin.types";

export interface UserActivityLogProps {
  detail: AdminUserDetail | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Shows a compact activity summary (registration date, email verification,
 * skills count) inside the UserEditModal.  Rendered as a log-style list so
 * it is easy to extend with real audit-log data when the backend exposes it.
 */
export function UserActivityLog({ detail, isLoading, error }: UserActivityLogProps) {
  return (
    <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-4")}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Activity
      </p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <LoadingSpinner size="sm" />
          Loading…
        </div>
      ) : error ? (
        <p className="text-xs text-error">{error}</p>
      ) : detail ? (
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <Icon
              path={ICON_PATHS.calendar}
              size="sm"
              className="text-primary mt-0.5 shrink-0"
            />
            <span className="text-text-secondary">
              Registered{" "}
              <span className="font-semibold text-text-primary">
                {formatDateTime(detail.createdAt)}
              </span>
            </span>
          </li>

          <li className="flex items-start gap-2">
            <Icon
              path={detail.emailVerified ? ICON_PATHS.check : ICON_PATHS.alertCircle}
              size="sm"
              className={cn(
                "mt-0.5 shrink-0",
                detail.emailVerified ? "text-success" : "text-warning"
              )}
            />
            <span className="text-text-secondary">
              Email{" "}
              <span className="font-semibold text-text-primary">
                {detail.emailVerified
                  ? `verified${detail.emailVerifiedAt ? ` ${formatDateTime(detail.emailVerifiedAt)}` : ""}`
                  : "not verified"}
              </span>
            </span>
          </li>

          {detail.skills.length > 0 && (
            <li className="flex items-start gap-2">
              <Icon
                path={ICON_PATHS.briefcase}
                size="sm"
                className="text-primary mt-0.5 shrink-0"
              />
              <span className="text-text-secondary">
                <span className="font-semibold text-text-primary">{detail.skills.length}</span>{" "}
                skill{detail.skills.length !== 1 ? "s" : ""} listed
              </span>
            </li>
          )}

          <li className="flex items-start gap-2">
            <Icon
              path={ICON_PATHS.shoppingCart}
              size="sm"
              className="text-primary mt-0.5 shrink-0"
            />
            <span className="text-text-secondary">
              <span className="font-semibold text-text-primary">
                {detail._count.applications}
              </span>{" "}
              application{detail._count.applications !== 1 ? "s" : ""} submitted
            </span>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
