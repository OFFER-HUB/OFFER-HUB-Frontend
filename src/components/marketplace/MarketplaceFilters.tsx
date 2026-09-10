"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

export interface CategoryOption {
  value: string;
  label: string;
  iconPath: string;
}

export const CATEGORIES: CategoryOption[] = [
  { value: "", label: "All Categories", iconPath: ICON_PATHS.grid },
  { value: "WEB_DEVELOPMENT", label: "Web Development", iconPath: ICON_PATHS.desktop },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Apps", iconPath: ICON_PATHS.mobile },
  { value: "DESIGN", label: "Design & Creative", iconPath: ICON_PATHS.image },
  { value: "WRITING", label: "Writing & Content", iconPath: ICON_PATHS.document },
  { value: "MARKETING", label: "Marketing & Growth", iconPath: ICON_PATHS.trendingUp },
  { value: "VIDEO", label: "Video & Animation", iconPath: ICON_PATHS.video },
  { value: "MUSIC", label: "Music & Audio", iconPath: ICON_PATHS.chat },
  { value: "DATA", label: "Data & Analytics", iconPath: ICON_PATHS.chartBar },
  { value: "OTHER", label: "Other Services", iconPath: ICON_PATHS.folder },
];

export interface MarketplaceFiltersState {
  category: string;
  minBudget: number;
  maxBudget: number;
}

interface MarketplaceFiltersProps {
  filters: MarketplaceFiltersState;
  onChange: (filters: MarketplaceFiltersState) => void;
  priceLabel?: string;
  className?: string;
}

const BUDGET_PRESETS = [
  { label: "Any", min: 0, max: 10000 },
  { label: "< $100", min: 0, max: 100 },
  { label: "$100 - $500", min: 100, max: 500 },
  { label: "$500 - $1.5k", min: 500, max: 1500 },
  { label: "$1.5k+", min: 1500, max: 10000 },
];

export function MarketplaceFilters({
  filters,
  onChange,
  priceLabel = "Budget",
  className,
}: MarketplaceFiltersProps): React.JSX.Element {
  const [minInput, setMinInput] = useState<string>(filters.minBudget > 0 ? String(filters.minBudget) : "");
  const [maxInput, setMaxInput] = useState<string>(filters.maxBudget < 10000 ? String(filters.maxBudget) : "");

  const activeFiltersCount =
    (filters.category ? 1 : 0) +
    (filters.minBudget > 0 ? 1 : 0) +
    (filters.maxBudget < 10000 ? 1 : 0);

  const handleCategoryChange = (category: string) => {
    onChange({ ...filters, category });
  };

  const handleApplyBudgetInputs = () => {
    const min = minInput === "" ? 0 : Math.max(0, Number(minInput) || 0);
    const max = maxInput === "" ? 10000 : Math.min(10000, Number(maxInput) || 10000);
    onChange({
      ...filters,
      minBudget: min <= max ? min : max,
      maxBudget: max >= min ? max : min,
    });
  };

  const handlePresetClick = (min: number, max: number) => {
    setMinInput(min > 0 ? String(min) : "");
    setMaxInput(max < 10000 ? String(max) : "");
    onChange({ ...filters, minBudget: min, maxBudget: max });
  };

  const handleResetFilters = () => {
    setMinInput("");
    setMaxInput("");
    onChange({ category: "", minBudget: 0, maxBudget: 10000 });
  };

  return (
    <aside
      className={cn(
        "w-full p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_14px_#d1d5db,-6px_-6px_14px_#ffffff]",
        "border border-white/60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-border-light">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-background shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] flex items-center justify-center text-primary">
            <Icon path={ICON_PATHS.filter} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors px-2.5 py-1 rounded-lg hover:bg-primary/5 active:scale-95 cursor-pointer"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Categories
          </label>
          {filters.category && (
            <button
              onClick={() => handleCategoryChange("")}
              className="text-[11px] text-text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                type="button"
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 cursor-pointer text-left",
                  isSelected
                    ? "bg-primary text-white font-semibold shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]"
                    : "text-text-secondary hover:text-text-primary hover:bg-background/80"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    path={cat.iconPath}
                    size="sm"
                    className={cn(isSelected ? "text-white" : "text-text-secondary/70")}
                  />
                  <span className="truncate">{cat.label}</span>
                </div>
                {isSelected && (
                  <Icon path={ICON_PATHS.check} size="sm" className="text-white flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price / Budget Range */}
      <div className="pt-5 border-t border-border-light">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            {priceLabel} Range
          </label>
          {(filters.minBudget > 0 || filters.maxBudget < 10000) && (
            <button
              onClick={() => {
                setMinInput("");
                setMaxInput("");
                onChange({ ...filters, minBudget: 0, maxBudget: 10000 });
              }}
              className="text-[11px] text-text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {BUDGET_PRESETS.map((preset) => {
            const isPresetActive =
              filters.minBudget === preset.min && filters.maxBudget === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset.min, preset.max)}
                className={cn(
                  "py-1.5 px-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer truncate text-center",
                  isPresetActive
                    ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] font-semibold"
                    : "bg-background text-text-secondary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] hover:text-text-primary"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="text-[11px] text-text-secondary mb-1 block font-medium">Min ($)</span>
              <div className="flex items-center px-3 py-2 rounded-xl bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                <span className="text-xs text-text-secondary mr-1 font-semibold">$</span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="10000"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  onBlur={handleApplyBudgetInputs}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyBudgetInputs()}
                  className="w-full bg-transparent text-xs text-text-primary font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-text-secondary mb-1 block font-medium">Max ($)</span>
              <div className="flex items-center px-3 py-2 rounded-xl bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                <span className="text-xs text-text-secondary mr-1 font-semibold">$</span>
                <input
                  type="number"
                  placeholder="10000"
                  min="0"
                  max="10000"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  onBlur={handleApplyBudgetInputs}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyBudgetInputs()}
                  className="w-full bg-transparent text-xs text-text-primary font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyBudgetInputs}
            className={cn(
              "w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer",
              "bg-background text-primary",
              "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "hover:shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] hover:text-primary-hover",
              "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            Apply Price Filter
          </button>
        </div>
      </div>
    </aside>
  );
}
