"use client";

import { useEffect, useMemo, useState } from "react";
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
  type FreelancerSearchHit,
} from "@/lib/api/search";

const PRICE_CAP = 10000;

interface RawPageState<T> {
  raw: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface SearchResultsState {
  filteredOffers: MarketplaceOffer[];
  filteredServices: MarketplaceService[];
  filteredFreelancers: FreelancerSearchHit[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMoreCurrent: boolean;
  loadMore: () => Promise<void>;
}

interface UseSearchResultsParams {
  q: string;
  tab: SearchTab;
  sort: SearchSort;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  skills: Set<string>;
}

export function useSearchResults({
  q,
  tab,
  sort,
  category,
  minPrice,
  maxPrice,
  minRating,
  skills,
}: UseSearchResultsParams): SearchResultsState {
  const [offerState, setOfferState] = useState<RawPageState<MarketplaceOffer>>({
    raw: [],
    hasMore: false,
  });
  const [serviceState, setServiceState] = useState<RawPageState<MarketplaceService>>({
    raw: [],
    hasMore: false,
  });
  const [freelancerServiceState, setFreelancerServiceState] = useState<
    RawPageState<MarketplaceService>
  >({ raw: [], hasMore: false });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setOfferState({ raw: o.data, nextCursor: o.nextCursor, hasMore: o.hasMore });
        setServiceState({ raw: s.data, nextCursor: s.nextCursor, hasMore: s.hasMore });
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

  const filteredOffers = useMemo(
    () => sortOffers(filterBySkills(offerState.raw, skills), sort, q),
    [offerState.raw, skills, sort, q]
  );

  const filteredServices = useMemo(() => {
    const rows = filterByMinRatingServices(filterBySkills(serviceState.raw, skills), minRating);
    return sortServices(rows, sort, q);
  }, [serviceState.raw, skills, minRating, sort, q]);

  const filteredFreelancers = useMemo(() => {
    let hits = aggregateFreelancersFromServices(freelancerServiceState.raw);
    hits = filterFreelancersBySkills(hits, skills);
    hits = filterByMinRatingFreelancers(hits, minRating);
    hits = filterFreelancersByPriceRange(hits, minPrice, maxPrice);
    return sortFreelancerHits(hits, sort, q);
  }, [freelancerServiceState.raw, skills, minRating, minPrice, maxPrice, sort, q]);

  const hasMoreCurrent =
    tab === "offers"
      ? offerState.hasMore
      : tab === "services"
        ? serviceState.hasMore
        : freelancerServiceState.hasMore;

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

  return {
    filteredOffers,
    filteredServices,
    filteredFreelancers,
    isLoading,
    isLoadingMore,
    error,
    hasMoreCurrent,
    loadMore,
  };
}
