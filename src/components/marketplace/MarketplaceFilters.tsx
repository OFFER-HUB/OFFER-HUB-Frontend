"use client";

import { cn } from "@/lib/cn";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Development" },
  { value: "DESIGN", label: "Design & Creative" },
  { value: "WRITING", label: "Writing & Translation" },
  { value: "MARKETING", label: "Marketing & Sales" },
  { value: "VIDEO", label: "Video & Animation" },
  { value: "MUSIC", label: "Music & Audio" },
  { value: "DATA", label: "Data & Analytics" },
  { value: "OTHER", label: "Other" },
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

export function MarketplaceFilters({
  filters,
  onChange,
  priceLabel = "Budget",
  className,
}: MarketplaceFiltersProps): React.JSX.Element {
  const handleCategoryChange = (category: string) => {
    onChange({ ...filters, category });
  };

  const handleMinBudgetChange = (minBudget: number) => {
    onChange({ ...filters, minBudget });
  };

  const handleMaxBudgetChange = (maxBudget: number) => {
    onChange({ ...filters, maxBudget });
  };

  const handleResetFilters = () => {
    onChange({ category: "", minBudget: 0, maxBudget: 10000 });
  };

  return (
    <aside
      className={cn(
        "w-full p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-text-primary">Filters</h2>
        <button
          onClick={handleResetFilters}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="text-sm font-medium text-text-primary mb-3 block">Category</label>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleCategoryChange(cat.value)}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200",
                  filters.category === cat.value
                    ? "bg-primary shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] scale-110"
                    : "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] group-hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                )}
              >
                {filters.category === cat.value && (
                  <svg className="w-3 h-3 text-white animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className={cn(
                  "text-sm transition-colors duration-200",
                  filters.category === cat.value
                    ? "text-text-primary font-medium"
                    : "text-text-secondary group-hover:text-text-primary"
                )}
              >
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div className="mb-6">
        <label className="text-sm font-medium text-text-primary mb-3 block">{priceLabel} Range</label>

        {/* Min Budget */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Minimum</span>
            <span className="px-3 py-1 text-xs font-medium bg-secondary text-white rounded-xl shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
              ${filters.minBudget.toLocaleString("en-US")}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={filters.maxBudget - 100}
            step={50}
            value={filters.minBudget}
            onChange={(e) => handleMinBudgetChange(Number(e.target.value))}
            className="range-neumorphic w-full"
          />
        </div>

        {/* Max Budget */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Maximum</span>
            <span className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-xl shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
              ${filters.maxBudget.toLocaleString("en-US")}
            </span>
          </div>
          <input
            type="range"
            min={filters.minBudget + 100}
            max={10000}
            step={100}
            value={filters.maxBudget}
            onChange={(e) => handleMaxBudgetChange(Number(e.target.value))}
            className="range-neumorphic w-full"
          />
        </div>

        <div className="flex justify-between mt-3 text-xs text-text-secondary">
          <span>$0</span>
          <span>$10k</span>
        </div>
      </div>
    </aside>
  );
}
