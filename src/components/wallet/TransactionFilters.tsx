"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ICON_BUTTON, NEUMORPHIC_INPUT } from "@/lib/styles";
import type { WalletTransactionType } from "@/lib/api/wallet";

export type TransactionSortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export interface TransactionFiltersValue {
  search: string;
  types: WalletTransactionType[];
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: TransactionSortOption;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersValue;
  onChange: (filters: TransactionFiltersValue) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
  className?: string;
}

const TYPE_OPTIONS: { value: WalletTransactionType; label: string; className: string }[] = [
  { value: "credit", label: "Credit", className: "text-success" },
  { value: "debit", label: "Debit", className: "text-error" },
  { value: "reserve", label: "Reserve", className: "text-warning" },
];

const SORT_OPTIONS: { value: TransactionSortOption; label: string }[] = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Amount: high to low" },
  { value: "amount-asc", label: "Amount: low to high" },
];

export function TransactionFilters({
  filters,
  onChange,
  onClear,
  resultCount,
  totalCount,
  className,
}: TransactionFiltersProps): React.JSX.Element {
  const toggleType = (type: WalletTransactionType): void => {
    const nextTypes = filters.types.includes(type)
      ? filters.types.filter((value) => value !== type)
      : [...filters.types, type];
    onChange({ ...filters, types: nextTypes });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.types.length > 0 ||
    filters.startDate !== "" ||
    filters.endDate !== "" ||
    filters.minAmount !== "" ||
    filters.maxAmount !== "" ||
    filters.sortBy !== "date-desc";

  return (
    <section
      className={cn(
        "p-5 sm:p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Filters</h2>
          <p className="text-sm text-text-secondary mt-1">
            {resultCount} of {totalCount} transactions shown
          </p>
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClear}
            className={cn(ICON_BUTTON, "w-auto px-4 gap-2 text-sm font-medium text-text-secondary")}
          >
            <Icon path={ICON_PATHS.close} size="sm" />
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] gap-3">
        <div className="relative xl:col-span-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            <Icon path={ICON_PATHS.search} size="sm" />
          </span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search description"
            className={cn(NEUMORPHIC_INPUT, "pl-10")}
            aria-label="Search transactions by description"
          />
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            <Icon path={ICON_PATHS.calendar} size="sm" />
          </span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
            className={cn(NEUMORPHIC_INPUT, "pl-10")}
            aria-label="Start date"
          />
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            <Icon path={ICON_PATHS.calendar} size="sm" />
          </span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
            className={cn(NEUMORPHIC_INPUT, "pl-10")}
            aria-label="End date"
          />
        </div>

        <input
          type="number"
          min="0"
          step="0.01"
          value={filters.minAmount}
          onChange={(event) => onChange({ ...filters, minAmount: event.target.value })}
          placeholder="Min amount"
          className={NEUMORPHIC_INPUT}
          aria-label="Minimum amount"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          value={filters.maxAmount}
          onChange={(event) => onChange({ ...filters, maxAmount: event.target.value })}
          placeholder="Max amount"
          className={NEUMORPHIC_INPUT}
          aria-label="Maximum amount"
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-4">
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((option) => {
            const isActive = filters.types.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleType(option.value)}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                  isActive
                    ? "bg-primary text-white border-primary shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                    : "bg-background border-transparent text-text-secondary hover:text-text-primary",
                  !isActive && option.className
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-[250px]">
          <select
            value={filters.sortBy}
            onChange={(event) =>
              onChange({ ...filters, sortBy: event.target.value as TransactionSortOption })
            }
            className={cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer")}
            aria-label="Sort transactions"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            <Icon path={ICON_PATHS.chevronDown} size="sm" />
          </span>
        </div>
      </div>
    </section>
  );
}