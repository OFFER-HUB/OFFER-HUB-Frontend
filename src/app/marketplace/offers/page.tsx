"use client";

import { useState, useEffect } from "react";
import { getPublicOffers, type MarketplaceOffer } from "@/lib/api/marketplace";
import { OfferCard } from "@/components/marketplace/OfferCard";
import { MarketplaceFilters, type MarketplaceFiltersState } from "@/components/marketplace/MarketplaceFilters";
import { LoadingSpinner, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Navbar } from "@/components/landing/Navbar";
import { cn } from "@/lib/cn";

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
          limit: 20,
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
    setSearchText(searchInput);
  };

  const loadMore = async () => {
    if (!hasMore || !nextCursor) return;

    try {
      const response = await getPublicOffers({
        category: filters.category || undefined,
        minBudget: filters.minBudget > 0 ? filters.minBudget : undefined,
        maxBudget: filters.maxBudget < 10000 ? filters.maxBudget : undefined,
        search: searchText || undefined,
        limit: 20,
        cursor: nextCursor,
      });
      setOffers((prev) => [...prev, ...response.data]);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (err) {
      console.error("Failed to load more offers:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Browse Offers</h1>
          <p className="text-text-secondary">
            Discover opportunities from clients looking for talented freelancers
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div
            className={cn(
              "flex items-center gap-4 p-3 rounded-3xl bg-white",
              "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
            )}
          >
            <div
              className={cn(
                "flex-1 flex items-center gap-2 px-4 py-2 rounded-xl",
                "bg-background",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
            >
              <svg
                className="h-5 w-5 text-text-secondary/50 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search offers by title or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={cn(
                  "flex-1 py-0.5 text-sm text-text-primary placeholder-text-secondary/50",
                  "bg-transparent focus:outline-none"
                )}
              />
            </div>
            <button
              type="submit"
              className={cn(
                "p-2.5 rounded-xl flex-shrink-0",
                "bg-primary text-white",
                "hover:bg-primary-hover transition-all duration-200",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
              )}
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <MarketplaceFilters filters={filters} onChange={setFilters} priceLabel="Budget" />
          </div>

          {/* Offers Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner className="text-primary" />
              </div>
            ) : error ? (
              <EmptyState icon={ICON_PATHS.alertCircle} message={error} />
            ) : offers.length === 0 ? (
              <EmptyState
                icon={ICON_PATHS.briefcase}
                message="No offers found. Try adjusting your filters or search terms"
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      className={cn(
                        "px-8 py-3 rounded-xl",
                        "bg-white text-primary font-medium",
                        "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                        "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                        "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1)]",
                        "transition-all duration-200"
                      )}
                    >
                      Load More
                    </button>
                  </div>
                )}

                {/* Results Count */}
                <div className="mt-6 text-center text-sm text-text-secondary">
                  Showing {offers.length} offer{offers.length !== 1 ? "s" : ""}
                  {hasMore && " (more available)"}
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
