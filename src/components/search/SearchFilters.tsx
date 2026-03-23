"use client";

import { cn } from "@/lib/cn";
import { SEARCH_SKILL_OPTIONS, type SearchTab } from "@/lib/api/search";

const CATEGORIES = [
  { value: "", label: "All categories" },
  ...SEARCH_SKILL_OPTIONS,
];

export interface SearchFiltersState {
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  skills: Set<string>;
}

interface SearchFiltersProps {
  tab: SearchTab;
  filters: SearchFiltersState;
  onChange: (next: SearchFiltersState) => void;
  onClearAll: () => void;
  className?: string;
}

const PRICE_MAX = 10000;

/**
 * Sidebar filters: category, price/budget range, minimum rating (services & freelancers), skill categories.
 */
export function SearchFilters({
  tab,
  filters,
  onChange,
  onClearAll,
  className,
}: SearchFiltersProps): React.JSX.Element {
  const priceLabel = tab === "offers" ? "Budget range" : "Price range";
  const showRating = tab !== "offers";

  const setCategory = (category: string) => onChange({ ...filters, category });
  const setMin = (minPrice: number) => onChange({ ...filters, minPrice });
  const setMax = (maxPrice: number) => onChange({ ...filters, maxPrice });
  const setMinRating = (minRating: number) => onChange({ ...filters, minRating });

  const toggleSkill = (value: string) => {
    const next = new Set(filters.skills);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange({ ...filters, skills: next });
  };

  return (
    <aside
      className={cn(
        "w-full p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6 gap-2">
        <h2 className="text-lg font-bold text-text-primary">Filters</h2>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          Clear all
        </button>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-text-primary mb-3 block">Category</label>
        <select
          value={filters.category}
          onChange={(e) => setCategory(e.target.value)}
          className={cn(
            "w-full px-4 py-3 rounded-xl text-sm text-text-primary bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            "border-0 outline-none focus:ring-2 focus:ring-primary/30"
          )}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value || "all"} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-text-primary mb-3 block">{priceLabel}</label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min={0}
            max={PRICE_MAX}
            value={filters.minPrice || ""}
            onChange={(e) => setMin(Math.max(0, Number(e.target.value) || 0))}
            placeholder="Min"
            className={cn(
              "w-full min-w-0 px-3 py-2 rounded-xl text-sm bg-background text-text-primary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "border-0 outline-none"
            )}
            aria-label="Minimum price"
          />
          <span className="text-text-secondary text-sm">–</span>
          <input
            type="number"
            min={0}
            max={PRICE_MAX}
            value={filters.maxPrice >= PRICE_MAX ? "" : filters.maxPrice}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMax(Number.isNaN(v) || v <= 0 ? PRICE_MAX : v);
            }}
            placeholder="Max"
            className={cn(
              "w-full min-w-0 px-3 py-2 rounded-xl text-sm bg-background text-text-primary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "border-0 outline-none"
            )}
            aria-label="Maximum price"
          />
        </div>
        <p className="mt-2 text-xs text-text-secondary">Leave max empty for no upper limit (up to {PRICE_MAX}).</p>
      </div>

      {showRating ? (
        <div className="mb-6">
          <label htmlFor="search-min-rating" className="text-sm font-medium text-text-primary mb-3 block">
            Minimum rating
          </label>
          <input
            id="search-min-rating"
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={filters.minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>Any</span>
            <span>{filters.minRating > 0 ? `${filters.minRating}+ stars` : "Any"}</span>
            <span>5</span>
          </div>
        </div>
      ) : (
        <p className="mb-6 text-xs text-text-secondary">
          Rating filters apply to services and freelancers. Switch tabs to refine by rating.
        </p>
      )}

      <div className="mb-2">
        <label className="text-sm font-medium text-text-primary mb-3 block">Skills (categories)</label>
        <p className="text-xs text-text-secondary mb-3">
          Match items tagged with any selected category. Leave empty to include all.
        </p>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
          {SEARCH_SKILL_OPTIONS.map((s) => {
            const on = filters.skills.has(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSkill(s.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  on
                    ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db]"
                    : "bg-background text-text-secondary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] hover:text-text-primary"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
