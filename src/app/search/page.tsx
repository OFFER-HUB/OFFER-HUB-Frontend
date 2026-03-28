"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Navbar } from "@/components/landing/Navbar";
import {
  SearchInput,
  SearchFilters,
  SearchResults,
  type SearchFiltersState,
  type ResultsViewMode,
} from "@/components/search";
import type { MarketplaceOffer, MarketplaceService } from "@/lib/api/marketplace";
import {
  type SearchTab,
  type SearchSort,
  aggregateFreelancersFromServices,
  fetchSearchOffers,
  fetchSearchServices,
  fetchFreelancerHitsFromServices,
  filterBySkills,
  filterByMinRatingServices,
  filterFreelancersBySkills,
  filterByMinRatingFreelancers,
  filterFreelancersByPriceRange,
  sortOffers,
  sortServices,
  sortFreelancerHits,
} from "@/lib/api/search";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

const PRICE_CAP = 10000;

function parseTab(raw: string | null): SearchTab {
  if (raw === "services" || raw === "freelancers") return raw;
  return "offers";
}

function parseSort(raw: string | null): SearchSort {
  if (raw === "price" || raw === "rating" || raw === "date" || raw === "relevance") return raw;
  return "relevance";
}

function parseView(raw: string | null): ResultsViewMode {
  return raw === "list" ? "list" : "grid";
}

function SearchPageContent(): React.JSX.Element {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = sp.get("q") ?? "";
  const tab = parseTab(sp.get("tab"));
  const sort = parseSort(sp.get("sort"));
  const viewMode = parseView(sp.get("view"));
  const category = sp.get("category") ?? "";
  const minPrice = Math.max(0, Number(sp.get("minPrice")) || 0);
  const maxPriceRaw = sp.get("maxPrice");
  const maxPrice =
    maxPriceRaw === null || maxPriceRaw === ""
      ? PRICE_CAP
      : Math.min(PRICE_CAP, Math.max(0, Number(maxPriceRaw) || PRICE_CAP));
  const minRating = Math.min(5, Math.max(0, Number(sp.get("minRating")) || 0));
  const skills = useMemo(
    () => new Set((sp.get("skills") ?? "").split(",").filter(Boolean)),
    [sp]
  );

  const [draftQ, setDraftQ] = useState(q);
  useEffect(() => {
    setDraftQ(q);
  }, [q]);

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [sp, router, pathname]
  );

  const filtersForSidebar: SearchFiltersState = {
    category,
    minPrice,
    maxPrice,
    minRating,
    skills,
  };

  const handleFiltersChange = (next: SearchFiltersState) => {
    setParams({
      category: next.category || null,
      minPrice: next.minPrice > 0 ? String(next.minPrice) : null,
      maxPrice: next.maxPrice < PRICE_CAP ? String(next.maxPrice) : null,
      minRating: next.minRating > 0 ? String(next.minRating) : null,
      skills: next.skills.size > 0 ? [...next.skills].join(",") : null,
    });
  };

  const handleClearAllFilters = () => {
    setParams({
      category: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      skills: null,
    });
  };

  const [offerState, setOfferState] = useState<{
    raw: MarketplaceOffer[];
    nextCursor?: string;
    hasMore: boolean;
  }>({ raw: [], hasMore: false });

  const [serviceState, setServiceState] = useState<{
    raw: MarketplaceService[];
    nextCursor?: string;
    hasMore: boolean;
  }>({ raw: [], hasMore: false });

  const [freelancerServiceState, setFreelancerServiceState] = useState<{
    raw: MarketplaceService[];
    nextCursor?: string;
    hasMore: boolean;
  }>({ raw: [], hasMore: false });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const apiBudgetMin = minPrice > 0 ? minPrice : undefined;
  const apiBudgetMax = maxPrice < PRICE_CAP ? maxPrice : undefined;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [o, s, f] = await Promise.all([
          fetchSearchOffers({
            search: q || undefined,
            category: category || undefined,
            minBudget: apiBudgetMin,
            maxBudget: apiBudgetMax,
            limit: 20,
          }),
          fetchSearchServices({
            search: q || undefined,
            category: category || undefined,
            minPrice: apiBudgetMin,
            maxPrice: apiBudgetMax,
            limit: 20,
          }),
          fetchFreelancerHitsFromServices({
            search: q || undefined,
            category: category || undefined,
            minPrice: apiBudgetMin,
            maxPrice: apiBudgetMax,
            limit: 40,
          }),
        ]);
        if (cancelled) return;
        setOfferState({
          raw: o.data,
          nextCursor: o.nextCursor,
          hasMore: o.hasMore,
        });
        setServiceState({
          raw: s.data,
          nextCursor: s.nextCursor,
          hasMore: s.hasMore,
        });
        setFreelancerServiceState({
          raw: f.rawServices,
          nextCursor: f.nextCursor,
          hasMore: f.hasMore,
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Search failed");
          setOfferState({ raw: [], hasMore: false });
          setServiceState({ raw: [], hasMore: false });
          setFreelancerServiceState({ raw: [], hasMore: false });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [q, category, apiBudgetMin, apiBudgetMax]);

  const filteredOffers = useMemo(() => {
    const rows = filterBySkills(offerState.raw, skills);
    return sortOffers(rows, sort, q);
  }, [offerState.raw, skills, sort, q]);

  const filteredServices = useMemo(() => {
    let rows = filterBySkills(serviceState.raw, skills);
    rows = filterByMinRatingServices(rows, minRating);
    return sortServices(rows, sort, q);
  }, [serviceState.raw, skills, minRating, sort, q]);

  const filteredFreelancers = useMemo(() => {
    let hits = aggregateFreelancersFromServices(freelancerServiceState.raw);
    hits = filterFreelancersBySkills(hits, skills);
    hits = filterByMinRatingFreelancers(hits, minRating);
    hits = filterFreelancersByPriceRange(hits, minPrice, maxPrice);
    return sortFreelancerHits(hits, sort, q);
  }, [freelancerServiceState.raw, skills, minRating, minPrice, maxPrice, sort, q]);

  const loadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      if (tab === "offers" && offerState.hasMore && offerState.nextCursor) {
        const res = await fetchSearchOffers({
          search: q || undefined,
          category: category || undefined,
          minBudget: apiBudgetMin,
          maxBudget: apiBudgetMax,
          limit: 20,
          cursor: offerState.nextCursor,
        });
        setOfferState((s) => ({
          raw: [...s.raw, ...res.data],
          nextCursor: res.nextCursor,
          hasMore: res.hasMore,
        }));
      } else if (tab === "services" && serviceState.hasMore && serviceState.nextCursor) {
        const res = await fetchSearchServices({
          search: q || undefined,
          category: category || undefined,
          minPrice: apiBudgetMin,
          maxPrice: apiBudgetMax,
          limit: 20,
          cursor: serviceState.nextCursor,
        });
        setServiceState((s) => ({
          raw: [...s.raw, ...res.data],
          nextCursor: res.nextCursor,
          hasMore: res.hasMore,
        }));
      } else if (
        tab === "freelancers" &&
        freelancerServiceState.hasMore &&
        freelancerServiceState.nextCursor
      ) {
        const res = await fetchSearchServices({
          search: q || undefined,
          category: category || undefined,
          minPrice: apiBudgetMin,
          maxPrice: apiBudgetMax,
          limit: 40,
          cursor: freelancerServiceState.nextCursor,
        });
        setFreelancerServiceState((s) => ({
          raw: [...s.raw, ...res.data],
          nextCursor: res.nextCursor,
          hasMore: res.hasMore,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const hasMoreCurrent =
    tab === "offers"
      ? offerState.hasMore
      : tab === "services"
        ? serviceState.hasMore
        : freelancerServiceState.hasMore;

  const tabStrip = (
    <div
      className={cn(
        "flex flex-wrap gap-2 p-1 rounded-2xl bg-background",
        "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
      )}
      role="tablist"
      aria-label="Search categories"
    >
      {(
        [
          ["offers", "Offers", filteredOffers.length] as const,
          ["services", "Services", filteredServices.length] as const,
          ["freelancers", "Freelancers", filteredFreelancers.length] as const,
        ] as const
      ).map(([id, label, count]) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() =>
              setParams({
                tab: id === "offers" ? null : id,
              })
            }
            className={cn(
              "flex-1 min-w-[7rem] px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              active
                ? "bg-primary text-white shadow-[2px_2px_6px_#d1d5db]"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 tabular-nums text-xs",
                active ? "text-white/90" : "text-text-secondary"
              )}
            >
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Search</h1>
            <p className="text-text-secondary max-w-2xl">
              Find offers, services, and freelancers in one place. Filters sync to the URL so you can
              share results.
            </p>
          </header>

          <SearchInput
            className="mb-6"
            value={draftQ}
            onChange={setDraftQ}
            onSearch={(query) => setParams({ q: query || null })}
          />

          <div className="mb-6">{tabStrip}</div>

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
                mobileFiltersOpen ? "fixed inset-0 z-50 flex flex-col bg-background/95 p-4 lg:relative lg:inset-auto lg:bg-transparent lg:p-0" : "hidden lg:block"
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
                tab={tab}
                filters={filtersForSidebar}
                onChange={handleFiltersChange}
                onClearAll={handleClearAllFilters}
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
              tab={tab}
              query={q}
              sort={sort}
              onSortChange={(s) =>
                setParams({
                  sort: s === "relevance" ? null : s,
                })
              }
              viewMode={viewMode}
              onViewModeChange={(m) =>
                setParams({
                  view: m === "grid" ? null : m,
                })
              }
              offers={filteredOffers}
              services={filteredServices}
              freelancers={filteredFreelancers}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              error={error}
              hasMore={hasMoreCurrent}
              onLoadMore={loadMore}
              counts={{
                offers: filteredOffers.length,
                services: filteredServices.length,
                freelancers: filteredFreelancers.length,
              }}
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
