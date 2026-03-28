"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_INPUT, ICON_BUTTON } from "@/lib/styles";
import type {
  AdminDisputesFilters,
  AdminDisputeStatusFilter,
  AdminDisputePriorityFilter,
} from "@/types/admin.types";
import type { DisputeReason } from "@/types/dispute.types";
import { DISPUTE_REASON_LABELS } from "@/types/dispute.types";

export interface DisputesFiltersProps {
  filters: AdminDisputesFilters;
  onFiltersChange: (filters: AdminDisputesFilters) => void;
  className?: string;
}

const DEFAULT_FILTERS: AdminDisputesFilters = {
  search: "",
  status: "ALL",
  priority: "ALL",
  reason: "ALL",
  openedAfter: "",
  openedBefore: "",
};

function isFiltersDefault(filters: AdminDisputesFilters): boolean {
  return (
    filters.search === "" &&
    filters.status === "ALL" &&
    filters.priority === "ALL" &&
    filters.reason === "ALL" &&
    filters.openedAfter === "" &&
    filters.openedBefore === ""
  );
}

export function DisputesFilters({ filters, onFiltersChange, className }: DisputesFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  // Sync external reset
  useEffect(() => {
    if (filters.search === "" && localSearch !== "") {
      setLocalSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  function handleClear() {
    setLocalSearch("");
    onFiltersChange(DEFAULT_FILTERS);
  }

  const showClear = !isFiltersDefault({ ...filters, search: localSearch });

  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.search} size="sm" />
        </span>
        <input
          type="text"
          placeholder="Search by offer title, buyer, or seller..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className={cn(NEUMORPHIC_INPUT, "pl-10 pr-10")}
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="relative w-full sm:w-auto">
        <select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value as AdminDisputeStatusFilter })
          }
          className={cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer min-w-[140px]")}
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.chevronDown} size="sm" />
        </span>
      </div>

      {/* Priority filter */}
      <div className="relative w-full sm:w-auto">
        <select
          value={filters.priority}
          onChange={(e) =>
            onFiltersChange({ ...filters, priority: e.target.value as AdminDisputePriorityFilter })
          }
          className={cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer min-w-[140px]")}
          aria-label="Filter by priority"
        >
          <option value="ALL">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.chevronDown} size="sm" />
        </span>
      </div>

      {/* Reason filter */}
      <div className="relative w-full sm:w-auto">
        <select
          value={filters.reason}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              reason: e.target.value as DisputeReason | "ALL",
            })
          }
          className={cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer min-w-[160px]")}
          aria-label="Filter by reason"
        >
          <option value="ALL">All Reasons</option>
          {(Object.keys(DISPUTE_REASON_LABELS) as DisputeReason[]).map((r) => (
            <option key={r} value={r}>
              {DISPUTE_REASON_LABELS[r]}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.chevronDown} size="sm" />
        </span>
      </div>

      {/* Opened after */}
      <div className="relative w-full sm:w-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.calendar} size="sm" />
        </span>
        <input
          type="date"
          value={filters.openedAfter}
          onChange={(e) => onFiltersChange({ ...filters, openedAfter: e.target.value })}
          className={cn(NEUMORPHIC_INPUT, "pl-10 min-w-[160px] cursor-pointer")}
          aria-label="Opened after"
          title="Opened after"
        />
      </div>

      {/* Opened before */}
      <div className="relative w-full sm:w-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.calendar} size="sm" />
        </span>
        <input
          type="date"
          value={filters.openedBefore}
          onChange={(e) => onFiltersChange({ ...filters, openedBefore: e.target.value })}
          className={cn(NEUMORPHIC_INPUT, "pl-10 min-w-[160px] cursor-pointer")}
          aria-label="Opened before"
          title="Opened before"
        />
      </div>

      {/* Clear filters */}
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(ICON_BUTTON, "shrink-0")}
          title="Clear all filters"
          aria-label="Clear all filters"
        >
          <Icon path={ICON_PATHS.close} size="sm" className="text-text-secondary" />
        </button>
      )}
    </div>
  );
}
