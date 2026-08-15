"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  getClientStats,
  getClientActivities,
  type ClientStats,
  type ClientActivity,
} from "@/lib/api/client";
import { getMyOffers, type Offer } from "@/lib/api/offers";
import { getWalletBalance, type WalletBalanceSummary } from "@/lib/api/wallet";

/** Tab focus and visibility changes are ignored this soon after the previous load. */
const REFETCH_THROTTLE_MS = 2000;

export interface UseClientDashboardDataResult {
  stats: ClientStats | null;
  activities: ClientActivity[];
  offers: Offer[];
  /** Null while loading and whenever the wallet endpoint fails — it is optional data. */
  walletBalance: WalletBalanceSummary | null;
  /** True while any of the four requests is in flight. */
  isLoading: boolean;
  /** True only for a user-triggered `refetch`, so the refresh control can spin. */
  isRefreshing: boolean;
  /**
   * False on the first render. The auth store rehydrates from localStorage after
   * mount, so callers must show a skeleton until this flips instead of rendering
   * a signed-out dashboard.
   */
  isMounted: boolean;
  refetch: () => Promise<void>;
}

/**
 * Every request behind the client dashboard: stats, activities, posted offers
 * and wallet balance, refreshed when the tab regains focus.
 */
export function useClientDashboardData(): UseClientDashboardDataResult {
  const [isMounted, setIsMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const [stats, setStats] = useState<ClientStats | null>(null);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = useAuthStore((s) => s.token);

  const fetchData = useCallback(
    async (force = false) => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchRef.current < REFETCH_THROTTLE_MS) return;
      lastFetchRef.current = now;

      setIsLoading(true);

      try {
        const [statsData, activitiesData, offersData, balanceData] = await Promise.all([
          getClientStats(token),
          getClientActivities(token),
          getMyOffers(token),
          getWalletBalance(token).catch(() => null),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setOffers(offersData);
        setWalletBalance(balanceData);
      } catch (err) {
        console.error("Failed to fetch client dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(true);
    setIsRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    void fetchData(true);
  }, [isMounted, fetchData]);

  useEffect(() => {
    if (!isMounted) return;
    const onVisible = () => document.visibilityState === "visible" && fetchData();
    const onFocus = () => fetchData();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [isMounted, fetchData]);

  return {
    stats,
    activities,
    offers,
    walletBalance,
    isLoading,
    isRefreshing,
    isMounted,
    refetch,
  };
}
