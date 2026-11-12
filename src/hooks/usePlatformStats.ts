"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPlatformStats } from "@/lib/api/stats";
import type { PlatformStatsResponse } from "@/types/stats.types";

const INITIAL_LIMIT = 5;
const LOAD_MORE_COUNT = 10;

interface UsePlatformStatsReturn {
  data: PlatformStatsResponse | null;
  error: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  refresh: () => void;
  showMoreWallets: () => void;
  showMoreEscrows: () => void;
}

export function usePlatformStats(): UsePlatformStatsReturn {
  const [data, setData] = useState<PlatformStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [walletsLimit, setWalletsLimit] = useState(INITIAL_LIMIT);
  const [escrowsLimit, setEscrowsLimit] = useState(INITIAL_LIMIT);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestId = useRef(0);
  const hasLoadedData = useRef(false);

  const refresh = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    const isInitialLoad = !hasLoadedData.current;

    setError(null);
    setIsLoading(isInitialLoad);
    setIsLoadingMore(!isInitialLoad);

    async function loadStats(): Promise<void> {
      try {
        const stats = await getPlatformStats(walletsLimit, escrowsLimit);
        if (currentRequestId === requestId.current) {
          hasLoadedData.current = true;
          setData(stats);
        }
      } catch (loadError) {
        if (currentRequestId === requestId.current) {
          const message =
            loadError instanceof Error ? loadError.message : "Failed to load platform statistics.";
          setError(message);
          console.error("Failed to load platform statistics:", loadError);
        }
      } finally {
        if (currentRequestId === requestId.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    void loadStats();
    return () => {
      requestId.current += 1;
    };
  }, [escrowsLimit, refreshVersion, walletsLimit]);

  const showMoreWallets = useCallback(() => {
    setWalletsLimit((limit) => limit + LOAD_MORE_COUNT);
  }, []);

  const showMoreEscrows = useCallback(() => {
    setEscrowsLimit((limit) => limit + LOAD_MORE_COUNT);
  }, []);

  return {
    data,
    error,
    isLoading,
    isLoadingMore,
    refresh,
    showMoreWallets,
    showMoreEscrows,
  };
}
