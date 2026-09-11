"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getAdminAnalytics } from "@/lib/api/admin-analytics";
import type { AdminAnalyticsData, DateRange } from "@/types/admin-analytics.types";

const DEFAULT_RANGE_DAYS = 30;

function toDateInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function defaultAnalyticsRange(now: Date = new Date()): DateRange {
  return {
    start: toDateInput(new Date(now.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000)),
    end: toDateInput(now),
  };
}

export interface UseAdminAnalyticsResult {
  data: AdminAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refetch: () => Promise<void>;
}

/** Loads `GET /admin/analytics` for the selected range; refetches when it changes. */
export function useAdminAnalytics(enabled: boolean): UseAdminAnalyticsResult {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultAnalyticsRange());

  const refetch = useCallback(async () => {
    if (!enabled || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      setData(await getAdminAnalytics(token, dateRange));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, token, dateRange]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, dateRange, setDateRange, refetch };
}
