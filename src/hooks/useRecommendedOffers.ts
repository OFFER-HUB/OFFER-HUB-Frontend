"use client";

import { useEffect, useState } from "react";
import { getPublicOffers, type MarketplaceOffer } from "@/lib/api/marketplace";

const RECOMMENDED_OFFERS_LIMIT = 4;

export interface UseRecommendedOffersResult {
  /** Up to four open marketplace offers. Empty while loading and when the request fails. */
  offers: MarketplaceOffer[];
  /** True until the first request settles. */
  isLoading: boolean;
}

/**
 * Open marketplace offers shown on the freelancer dashboard.
 *
 * The widget is optional content, so a failed request resolves to an empty list
 * rather than an error.
 */
export function useRecommendedOffers(): UseRecommendedOffersResult {
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    getPublicOffers({ limit: RECOMMENDED_OFFERS_LIMIT })
      .then((res) => {
        if (controller.signal.aborted) return;
        setOffers(res.data.slice(0, RECOMMENDED_OFFERS_LIMIT));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setOffers([]);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { offers, isLoading };
}
