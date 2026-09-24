"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  getDashboardStats,
  getFreelancerStats,
  getFreelancerActivities,
  type FreelancerActivity,
} from "@/lib/api/freelancer";
import { getWalletBalance, type WalletBalanceSummary } from "@/lib/api/wallet";
import type { DashboardStats } from "@/types/freelancer-dashboard.types";

/** Tab focus and visibility changes are ignored this soon after the previous load. */
const REFETCH_THROTTLE_MS = 2000;

export interface UseFreelancerDashboardDataResult {
  stats: DashboardStats | null;
  activities: FreelancerActivity[];
  /** Null while loading and whenever the wallet endpoint fails — it is optional data. */
  walletBalance: WalletBalanceSummary | null;
  /** True while any of the requests is in flight. */
  isLoading: boolean;
  /** True only for a user-triggered `refetch`, so the refresh control can spin. */
  isRefreshing: boolean;
  /**
   * False on the first render. The auth store rehydrates from localStorage after
   * mount, so callers must show a placeholder until this flips instead of
   * rendering a signed-out dashboard.
   */
  isMounted: boolean;
  refetch: () => Promise<void>;
}

/**
 * Every request behind the freelancer dashboard: stats, activities and wallet
 * balance, refreshed when the tab regains focus.
 *
 * Stats come from the richer dashboard endpoint, falling back to the legacy
 * stats endpoint — which carries no trend data — when it is unavailable.
 */
export function useFreelancerDashboardData(): UseFreelancerDashboardDataResult {
  const [isMounted, setIsMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<FreelancerActivity[]>([]);
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
        const statsPromise = getDashboardStats(token).catch(async () => {
          const legacy = await getFreelancerStats(token);
          return {
            activeApplications: legacy.pendingProposals,
            activeOrders: 0,
            totalEarnings: legacy.totalEarnings,
            rating: null,
            ratingCount: 0,
            activeApplicationsTrend: null,
            activeOrdersTrend: null,
            earningsTrend: null,
            ratingTrend: null,
          } satisfies DashboardStats;
        });

        const [statsData, activitiesData, balanceData] = await Promise.all([
          statsPromise,
          getFreelancerActivities(token),
          getWalletBalance(token).catch(() => null),
        ]);

        setStats(statsData);
        setActivities(activitiesData);
        setWalletBalance(balanceData);
      } catch (err) {
        console.error("Failed to fetch freelancer dashboard data:", err);
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
    walletBalance,
    isLoading,
    isRefreshing,
    isMounted,
    refetch,
  };
}
