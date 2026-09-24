"use client";

import { useEffect, useState } from "react";
import { getPublicServices, type MarketplaceService } from "@/lib/api/marketplace";

const RECOMMENDED_FREELANCERS_LIMIT = 4;

export interface UseRecommendedFreelancersResult {
  /** Up to four marketplace services. Empty while loading and when the request fails. */
  services: MarketplaceService[];
  /** True until the first request settles. */
  isLoading: boolean;
}

/**
 * Marketplace services shown as recommended freelancers on the client dashboard.
 *
 * The widget is optional content, so a failed request resolves to an empty list
 * rather than an error.
 */
export function useRecommendedFreelancers(): UseRecommendedFreelancersResult {
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    getPublicServices({ limit: RECOMMENDED_FREELANCERS_LIMIT })
      .then((res) => {
        if (controller.signal.aborted) return;
        setServices(res.data.slice(0, RECOMMENDED_FREELANCERS_LIMIT));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setServices([]);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { services, isLoading };
}
