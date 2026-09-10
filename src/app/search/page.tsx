"use client";

import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { Navbar } from "@/components/landing/Navbar";
import {
  SearchInput,
  SearchFilters,
  SearchResults,
  SearchTabStrip,
} from "@/components/search";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useSearchUrlState } from "@/hooks/useSearchUrlState";
import { useSearchResults } from "@/hooks/useSearchResults";
import { useState } from "react";

function SearchPageContent(): React.JSX.Element {
  const url = useSearchUrlState();
  const results = useSearchResults({
    q: url.q,
    tab: url.tab,
    sort: url.sort,
    category: url.category,
    minPrice: url.minPrice,
    maxPrice: url.maxPrice,
    minRating: url.minRating,
    skills: url.skills,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const counts = {
    offers: results.filteredOffers.length,
    services: results.filteredServices.length,
    freelancers: results.filteredFreelancers.length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Search</h1>
            <p className="text-text-secondary max-w-2xl">
              Find offers, services, and freelancers in one place. Filters sync to the URL so you
              can share results.
            </p>
          </header>

          <SearchInput
            className="mb-6"
            value={url.draftQ}
            onChange={url.setDraftQ}
            onSearch={(query) => url.setParams({ q: query || null })}
          />

          <div className="mb-6">
            <SearchTabStrip
              activeTab={url.tab}
              counts={counts}
              onTabChange={(tab) => url.setParams({ tab: tab === "offers" ? null : tab })}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <button
              type="button"
              className={cn(
                "lg:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium",
                "bg-white text-text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
              )}
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Icon path={ICON_PATHS.menu} size="sm" />
              Filters
            </button>

            <div
              className={cn(
                "w-full lg:w-72 shrink-0",
                mobileFiltersOpen
                  ? "fixed inset-0 z-50 flex flex-col bg-background/95 p-4 lg:relative lg:inset-auto lg:bg-transparent lg:p-0"
                  : "hidden lg:block"
              )}
            >
              {mobileFiltersOpen ? (
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <span className="font-semibold text-text-primary">Filters</span>
                  <button
                    type="button"
                    className="p-2 rounded-lg text-text-secondary hover:bg-white/80"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                  >
                    <Icon path={ICON_PATHS.close} size="md" />
                  </button>
                </div>
              ) : null}
              <SearchFilters
                tab={url.tab}
                filters={url.filtersForSidebar}
                onChange={url.handleFiltersChange}
                onClearAll={url.handleClearAllFilters}
                className={cn(mobileFiltersOpen && "flex-1 overflow-y-auto min-h-0")}
              />
              {mobileFiltersOpen ? (
                <button
                  type="button"
                  className="mt-4 lg:hidden w-full py-3 rounded-xl font-medium text-white bg-primary shadow-[4px_4px_8px_#d1d5db]"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Done
                </button>
              ) : null}
            </div>

            <SearchResults
              tab={url.tab}
              query={url.q}
              sort={url.sort}
              onSortChange={(s) => url.setParams({ sort: s === "relevance" ? null : s })}
              viewMode={url.viewMode}
              onViewModeChange={(m) => url.setParams({ view: m === "grid" ? null : m })}
              offers={results.filteredOffers}
              services={results.filteredServices}
              freelancers={results.filteredFreelancers}
              isLoading={results.isLoading}
              isLoadingMore={results.isLoadingMore}
              error={results.error}
              hasMore={results.hasMoreCurrent}
              onLoadMore={results.loadMore}
              counts={counts}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function SearchFallback(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary text-sm">Loading search…</p>
      </div>
    </>
  );
}

export default function SearchPage(): React.JSX.Element {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
