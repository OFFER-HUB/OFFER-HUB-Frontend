"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_INPUT, ICON_BUTTON } from "@/lib/styles";
import type { AdminUsersFilters, AdminUserStatusFilter, AdminUserRoleFilter } from "@/types/admin.types";

export interface UsersFiltersProps {
  filters: AdminUsersFilters;
  onFiltersChange: (filters: AdminUsersFilters) => void;
  className?: string;
}

const DEFAULT_FILTERS: AdminUsersFilters = {
  search: "",
  status: "ALL",
  role: "ALL",
  registeredAfter: "",
  registeredBefore: "",
};

function isFiltersDefault(filters: AdminUsersFilters): boolean {
  return (
    filters.search === "" &&
    filters.status === "ALL" &&
    filters.role === "ALL" &&
    filters.registeredAfter === "" &&
    filters.registeredBefore === ""
  );
}

export function UsersFilters({ filters, onFiltersChange, className }: UsersFiltersProps) {
  // Local search with 300ms debounce to avoid re-filtering on every keystroke
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  // Sync external search reset (e.g. "Clear filters" button)
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
          placeholder="Search by name or email..."
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
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as AdminUserStatusFilter })}
          className={cn(
            NEUMORPHIC_INPUT,
            "appearance-none pr-10 cursor-pointer min-w-[140px]"
          )}
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING_VERIFICATION">Pending</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.chevronDown} size="sm" />
        </span>
      </div>

      {/* Role filter */}
      <div className="relative w-full sm:w-auto">
        <select
          value={filters.role}
          onChange={(e) => onFiltersChange({ ...filters, role: e.target.value as AdminUserRoleFilter })}
          className={cn(
            NEUMORPHIC_INPUT,
            "appearance-none pr-10 cursor-pointer min-w-[130px]"
          )}
          aria-label="Filter by role"
        >
          <option value="ALL">All Roles</option>
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
          <option value="BOTH">Both</option>
          <option value="ADMIN">Admin</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.chevronDown} size="sm" />
        </span>
      </div>

      {/* Registered after */}
      <div className="relative w-full sm:w-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.calendar} size="sm" />
        </span>
        <input
          type="date"
          value={filters.registeredAfter}
          onChange={(e) => onFiltersChange({ ...filters, registeredAfter: e.target.value })}
          className={cn(NEUMORPHIC_INPUT, "pl-10 min-w-[160px] cursor-pointer")}
          aria-label="Registered after"
          title="Registered after"
        />
      </div>

      {/* Registered before */}
      <div className="relative w-full sm:w-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon path={ICON_PATHS.calendar} size="sm" />
        </span>
        <input
          type="date"
          value={filters.registeredBefore}
          onChange={(e) => onFiltersChange({ ...filters, registeredBefore: e.target.value })}
          className={cn(NEUMORPHIC_INPUT, "pl-10 min-w-[160px] cursor-pointer")}
          aria-label="Registered before"
          title="Registered before"
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
