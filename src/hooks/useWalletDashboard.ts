"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWalletDashboard } from "@/lib/api/wallet";
import type { WalletDashboardData } from "@/types/wallet.types";

interface UseWalletDashboardReturn {
  data: WalletDashboardData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWalletDashboard(token: string | null): UseWalletDashboardReturn {
  const [data, setData] = useState<WalletDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    const currentRequestId = ++requestId.current;
    if (!token) {
      setData(null);
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    setError(null);
    try {
      const result = await getWalletDashboard(token);
      if (currentRequestId === requestId.current) {
        setData(result);
      }
    } catch (loadError) {
      if (currentRequestId === requestId.current) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load wallet.";
        setData(null);
        setError(message);
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    void load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const refresh = useCallback(async (): Promise<void> => {
    if (!token) return;
    setIsRefreshing(true);
    await load();
  }, [load, token]);

  return { data, isLoading, isRefreshing, error, refresh };
}
