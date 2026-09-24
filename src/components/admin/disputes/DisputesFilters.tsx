"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INPUT } from "@/lib/styles";
import {
  ADMIN_DISPUTE_STATUS_CONFIG,
  DISPUTE_OPENED_BY_LABELS,
  type AdminDisputesFilters,
  type AdminDisputeOpenedByFilter,
  type AdminDisputeStatus,
  type AdminDisputeStatusFilter,
  type DisputeOpenedBy,
} from "@/types/admin.types";

export interface DisputesFiltersProps {
  filters: AdminDisputesFilters;
  onFiltersChange: (filters: AdminDisputesFilters) => void;
  className?: string;
}

const SELECT = cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer");

/** Only the filters `GET /disputes` understands: status and who opened it. */
export function DisputesFilters({ filters, onFiltersChange, className }: DisputesFiltersProps) {
  const hasActive = filters.status !== "ALL" || filters.openedBy !== "ALL";

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-4 flex flex-col sm:flex-row gap-3 sm:items-center", className)}>
      <div className="relative flex-1 sm:max-w-xs">
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as AdminDisputeStatusFilter })}
          className={SELECT}
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          {(Object.keys(ADMIN_DISPUTE_STATUS_CONFIG) as AdminDisputeStatus[]).map((status) => (
            <option key={status} value={status}>
              {ADMIN_DISPUTE_STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.chevronDown} size="sm" />
        </span>
      </div>

      <div className="relative flex-1 sm:max-w-xs">
        <select
          value={filters.openedBy}
          onChange={(e) => onFiltersChange({ ...filters, openedBy: e.target.value as AdminDisputeOpenedByFilter })}
          className={SELECT}
          aria-label="Filter by who opened the dispute"
        >
          <option value="ALL">Opened by anyone</option>
          {(Object.keys(DISPUTE_OPENED_BY_LABELS) as DisputeOpenedBy[]).map((side) => (
            <option key={side} value={side}>
              Opened by {DISPUTE_OPENED_BY_LABELS[side].toLowerCase()}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.chevronDown} size="sm" />
        </span>
      </div>

      {hasActive && (
        <button
          type="button"
          onClick={() => onFiltersChange({ status: "ALL", openedBy: "ALL" })}
          className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors flex items-center gap-1 sm:ml-auto"
        >
          <Icon path={ICON_PATHS.close} size="sm" />
          Clear filters
        </button>
      )}
    </div>
  );
}
