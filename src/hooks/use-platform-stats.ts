"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPlatformStats } from "@/lib/api/stats";
import type { PlatformStatsResponse } from "@/types/stats.types";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface UsePlatformStatsReturn {
  data: PlatformStatsResponse | null;
  error: string | null;
  fetchedAt: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  refresh: () => Promise<void>;
}

export function usePlatformStats(
  walletsLimit: number,
  escrowsLimit: number
): UsePlatformStatsReturn {
  const [data, setData] = useState<PlatformStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasLoadedData = useRef(false);
  const requestId = useRef(0);
  const requestedLimits = useRef({ walletsLimit, escrowsLimit });

  const refresh = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    const isInitialLoad = !hasLoadedData.current;
    const isLoadingMoreRequest =
      !isInitialLoad &&
      (walletsLimit > requestedLimits.current.walletsLimit ||
        escrowsLimit > requestedLimits.current.escrowsLimit);
    requestedLimits.current = { walletsLimit, escrowsLimit };

    setError(null);
    setIsLoading(isInitialLoad);
    setIsRefreshing(!isInitialLoad);
    setIsLoadingMore(isLoadingMoreRequest);

    try {
      const result = await getPlatformStats(walletsLimit, escrowsLimit);
      if (currentRequestId !== requestId.current) {
        return;
      }

      hasLoadedData.current = true;
      setData(result);
      setFetchedAt(new Date().toISOString());
    } catch (err) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      const message =
        err instanceof Error ? err.message : "Failed to load platform statistics.";
      setError(message);
      console.error("Failed to load platform statistics:", err);
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    }
  }, [walletsLimit, escrowsLimit]);

  useEffect(() => {
    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      requestId.current += 1;
    };
  }, [refresh]);

  return { data, error, fetchedAt, isLoading, isRefreshing, isLoadingMore, refresh };
}
