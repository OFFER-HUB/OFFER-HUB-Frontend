"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicOffers, type MarketplaceOffer } from "@/lib/api/marketplace";
import { OfferCard } from "@/components/marketplace/OfferCard";
import {
  MarketplaceFilters,
  type MarketplaceFiltersState,
  CATEGORIES,
} from "@/components/marketplace/MarketplaceFilters";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Navbar } from "@/components/landing/Navbar";
import { cn } from "@/lib/cn";

function OfferCardSkeleton(): React.JSX.Element {
  return (
    <div className="p-7 rounded-[28px] bg-white shadow-[6px_6px_14px_#d1d5db,-6px_-6px_14px_#ffffff] animate-pulse flex flex-col h-full">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-7 bg-gray-200 rounded-xl w-28 mb-5" />
      <div className="space-y-2.5 mb-6">
        <div className="h-3.5 bg-gray-200 rounded w-full" />
        <div className="h-3.5 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="mt-auto pt-5 border-t border-border-light flex items-center justify-between">
        <div className="h-7 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded-xl w-32" />
      </div>
    </div>
  );
}

export default function BrowseOffersPage(): React.JSX.Element {
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<MarketplaceFiltersState>({
    category: "",
    minBudget: 0,
    maxBudget: 10000,
  });
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch offers when filters or search changes
  useEffect(() => {
    async function fetchOffers() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPublicOffers({
          category: filters.category || undefined,
          minBudget: filters.minBudget > 0 ? filters.minBudget : undefined,
          maxBudget: filters.maxBudget < 10000 ? filters.maxBudget : undefined,
          search: searchText || undefined,
          limit: 18,
        });
        setOffers(response.data);
        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor);
      } catch (err) {
        console.error("Failed to fetch offers:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch offers");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffers();
  }, [filters, searchText]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchText(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchText("");
  };

  const loadMore = async () => {
    if (!hasMore || !nextCursor) return;

    try {
      const response = await getPublicOffers({
        category: filters.category || undefined,
        minBudget: filters.minBudget > 0 ? filters.minBudget : undefined,
        maxBudget: filters.maxBudget < 10000 ? filters.maxBudget : undefined,
        search: searchText || undefined,
        limit: 18,
        cursor: nextCursor,
      });
      setOffers((prev) => [...prev, ...response.data]);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (err) {
      console.error("Failed to load more offers:", err);
    }
  };

  const hasActiveFilters =
    Boolean(filters.category) ||
    filters.minBudget > 0 ||
    filters.maxBudget < 10000 ||
    Boolean(searchText);

  const resetAllFilters = () => {
    clearSearch();
    setFilters({ category: "", minBudget: 0, maxBudget: 10000 });
  };

  const selectedCategoryLabel =
    CATEGORIES.find((c) => c.value === filters.category)?.label || filters.category;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pb-20">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-b from-white to-background/60 border-b border-border-light/60 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1380px] mx-auto">
            {/* Top Switcher & Tag */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  OFFER HUB MARKETPLACE
                </span>
              </div>

              {/* Segmented Switcher between Services and Offers */}
              <div className="inline-flex p-1.5 rounded-2xl bg-white shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] self-start sm:self-auto">
                <Link
                  href="/marketplace/services"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-all"
                >
                  <Icon path={ICON_PATHS.briefcase} size="sm" />
                  Services
                </Link>
                <Link
                  href="/marketplace/offers"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] transition-all"
                >
                  <Icon path={ICON_PATHS.document} size="sm" />
                  Offers
                </Link>
              </div>
            </div>

            {/* Main Title */}
            <div className="max-w-3xl mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight mb-3">
                Explore Client Project Offers
              </h1>
              <p className="text-base text-text-secondary leading-relaxed">
                Discover high-value project opportunities and submit proposals directly to verified clients with escrow security.
              </p>
            </div>

            {/* Trust Signals Strip */}
            <div className="flex flex-wrap items-center gap-6 mb-7 text-xs text-text-secondary font-medium">
              <div className="flex items-center gap-2">
                <Icon path={ICON_PATHS.shield} size="sm" className="text-primary" />
                <span>Smart Contract Escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon path={ICON_PATHS.checkCircle} size="sm" className="text-primary" />
                <span>Verified Clients</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon path={ICON_PATHS.currency} size="sm" className="text-primary" />
                <span>Protected Budgets</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon path={ICON_PATHS.chat} size="sm" className="text-primary" />
                <span>Direct Proposal Submissions</span>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mb-6">
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-3xl bg-white",
                  "shadow-[6px_6px_14px_#d1d5db,-6px_-6px_14px_#ffffff]",
                  "border border-white/80"
                )}
              >
                <div
                  className={cn(
                    "flex-1 flex items-center gap-3 px-5 py-3 rounded-2xl",
                    "bg-background",
                    "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                  )}
                >
                  <Icon path={ICON_PATHS.search} size="sm" className="text-text-secondary/60 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search offers by project title, requirements, or keywords..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-gray-200 transition-colors"
                      title="Clear search"
                    >
                      <Icon path={ICON_PATHS.close} size="sm" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className={cn(
                    "px-7 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm",
                    "bg-primary text-white transition-all duration-200 cursor-pointer flex-shrink-0",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:bg-primary-hover hover:shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff]",
                    "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
                  )}
                >
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {CATEGORIES.map((cat) => {
                const isActive = filters.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFilters({ ...filters, category: cat.value })}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                        : "bg-white text-text-secondary shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] hover:text-text-primary hover:bg-white"
                    )}
                  >
                    <Icon path={cat.iconPath} size="sm" className={isActive ? "text-white" : "text-text-secondary/70"} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Section with balanced 1380px container */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
              className={cn(
                "w-full flex items-center justify-between p-3.5 rounded-2xl bg-white font-semibold text-sm text-text-primary cursor-pointer",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon path={ICON_PATHS.filter} size="sm" className="text-primary" />
                <span>Filters & Budget</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <Icon
                path={ICON_PATHS.chevronDown}
                size="sm"
                className={cn("transition-transform duration-200", isMobileFiltersOpen && "rotate-180")}
              />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-7 items-start">
            {/* Desktop Filters Sidebar */}
            <div className={cn("w-full lg:w-64 xl:w-72 flex-shrink-0", isMobileFiltersOpen ? "block" : "hidden lg:block")}>
              <div className="lg:sticky lg:top-24">
                <MarketplaceFilters filters={filters} onChange={setFilters} priceLabel="Budget" />
              </div>
            </div>

            {/* Offers Grid & Active Filters */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Active Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-text-primary">
                    {isLoading ? "Searching..." : `${offers.length} ${offers.length === 1 ? "offer" : "offers"} found`}
                  </span>

                  {filters.category && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] text-primary">
                      {selectedCategoryLabel}
                      <button
                        onClick={() => setFilters({ ...filters, category: "" })}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                        title="Remove filter"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {(filters.minBudget > 0 || filters.maxBudget < 10000) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] text-primary">
                      ${filters.minBudget} - ${filters.maxBudget}
                      <button
                        onClick={() => setFilters({ ...filters, minBudget: 0, maxBudget: 10000 })}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                        title="Remove budget filter"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {searchText && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] text-primary">
                      &quot;{searchText}&quot;
                      <button
                        onClick={clearSearch}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                        title="Remove search"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Grid or Empty/Loading State */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <OfferCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <EmptyState icon={ICON_PATHS.alertCircle} message={error} />
              ) : offers.length === 0 ? (
                <EmptyState
                  icon={ICON_PATHS.document}
                  title="No offers found"
                  message="Try adjusting your filters or search terms to find available projects"
                  variant="card"
                  actionLabel="Reset filters"
                  onAction={resetAllFilters}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        highlightQuery={searchText}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={loadMore}
                        className={cn(
                          "px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer",
                          "bg-white text-primary",
                          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                          "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-105",
                          "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                        )}
                      >
                        Load More Offers
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
