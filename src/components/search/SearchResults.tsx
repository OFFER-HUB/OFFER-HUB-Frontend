"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfferCard } from "@/components/marketplace/OfferCard";
import { ServiceCard } from "@/components/marketplace/ServiceCard";
import { FreelancerSearchCard } from "@/components/search/FreelancerSearchCard";
import type { MarketplaceOffer, MarketplaceService } from "@/lib/api/marketplace";
import type { FreelancerSearchHit, SearchSort, SearchTab } from "@/lib/api/search";

export type ResultsViewMode = "grid" | "list";

interface SearchResultsProps {
  tab: SearchTab;
  query: string;
  sort: SearchSort;
  onSortChange: (sort: SearchSort) => void;
  viewMode: ResultsViewMode;
  onViewModeChange: (mode: ResultsViewMode) => void;
  offers: MarketplaceOffer[];
  services: MarketplaceService[];
  freelancers: FreelancerSearchHit[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  counts: { offers: number; services: number; freelancers: number };
}

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
  { value: "date", label: "Date" },
];

/**
 * Tab strip, sort and view controls, and result grids for offers, services, and freelancers.
 */
export function SearchResults({
  tab,
  query,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  offers,
  services,
  freelancers,
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  onLoadMore,
  counts,
}: SearchResultsProps): React.JSX.Element {
  const tabLabel =
    tab === "offers" ? "Offers" : tab === "services" ? "Services" : "Freelancers";
  const visibleCount =
    tab === "offers" ? offers.length : tab === "services" ? services.length : freelancers.length;
  const totalForTab =
    tab === "offers" ? counts.offers : tab === "services" ? counts.services : counts.freelancers;

  const gridClass =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      : "flex flex-col gap-4";

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">{tabLabel}</span>
          {" · "}
          Showing {visibleCount}
          {totalForTab !== visibleCount ? ` of ${totalForTab} loaded` : ""}
          {query ? (
            <>
              {" "}
              for &ldquo;{query}&rdquo;
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-text-secondary sr-only" htmlFor="search-sort">
            Sort by
          </label>
          <select
            id="search-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SearchSort)}
            className={cn(
              "text-sm px-3 py-2 rounded-xl bg-background text-text-primary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "border-0 outline-none focus:ring-2 focus:ring-primary/30"
            )}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div
            className={cn(
              "inline-flex rounded-xl p-1 bg-background",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
            role="group"
            aria-label="Result layout"
          >
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "bg-primary text-white shadow-sm" : "text-text-secondary"
              )}
              aria-pressed={viewMode === "grid"}
              title="Grid view"
            >
              <Icon path={ICON_PATHS.image} size="sm" ariaLabel="Grid view" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "bg-primary text-white shadow-sm" : "text-text-secondary"
              )}
              aria-pressed={viewMode === "list"}
              title="List view"
            >
              <Icon path={ICON_PATHS.list} size="sm" ariaLabel="List view" />
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className={cn(
            "mb-6 p-4 rounded-2xl text-sm text-red-800 bg-red-50",
            "border border-red-100"
          )}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <LoadingSpinner size="lg" className="text-primary" />
          <p className="text-sm text-text-secondary">Searching…</p>
        </div>
      ) : tab === "offers" && offers.length === 0 ? (
        <EmptyState
          icon={ICON_PATHS.search}
          title="No offers found"
          message="Try another keyword, clearing filters, or browsing the marketplace."
        />
      ) : tab === "services" && services.length === 0 ? (
        <EmptyState
          icon={ICON_PATHS.search}
          title="No services found"
          message="Adjust filters or search terms to see more results."
        />
      ) : tab === "freelancers" && freelancers.length === 0 ? (
        <EmptyState
          icon={ICON_PATHS.users}
          title="No freelancers found"
          message="We derive freelancer profiles from active services. Try broadening your search."
        />
      ) : (
        <>
          <div className={gridClass}>
            {tab === "offers"
              ? offers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    highlightQuery={query}
                    className={viewMode === "list" ? "max-w-none" : undefined}
                  />
                ))
              : null}
            {tab === "services"
              ? services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    highlightQuery={query}
                    className={viewMode === "list" ? "max-w-none" : undefined}
                  />
                ))
              : null}
            {tab === "freelancers"
              ? freelancers.map((hit) => (
                  <FreelancerSearchCard
                    key={hit.userId}
                    hit={hit}
                    query={query}
                    listLayout={viewMode === "list"}
                  />
                ))
              : null}
          </div>

          {hasMore ? (
            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className={cn(
                  "px-8 py-3 rounded-xl font-medium text-primary bg-white",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
