"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getFreelancerEarningsAnalytics } from "@/lib/api/earnings";
import { downloadEarningsCsv } from "@/components/analytics/earningsCsv";
import {
  type PresetId,
  type FreelancerEarningsAnalytics,
} from "@/types/earnings.types";
import { getRangeForPreset } from "@/lib/earnings-utils";

export interface UseEarningsAnalyticsResult {
  hasHydrated: boolean;
  token: string | null;
  startDate: string;
  endDate: string;
  activePreset: PresetId;
  data: FreelancerEarningsAnalytics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  applyPreset: (preset: Exclude<PresetId, "custom">) => void;
  onCustomStart: (value: string) => void;
  onCustomEnd: (value: string) => void;
  refresh: () => void;
  exportCsv: () => void;
}

export function useEarningsAnalytics(): UseEarningsAnalyticsResult {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const initialRange = useMemo(() => getRangeForPreset("12m"), []);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [activePreset, setActivePreset] = useState<PresetId>("12m");

  const [data, setData] = useState<FreelancerEarningsAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      const res = await getFreelancerEarningsAnalytics(token, { startDate, endDate });
      setData(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch earnings analytics";
      setData(null);
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, startDate, endDate]);

  useEffect(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  const applyPreset = useCallback((p: Exclude<PresetId, "custom">) => {
    const r = getRangeForPreset(p);
    setStartDate(r.start);
    setEndDate(r.end);
    setActivePreset(p);
  }, []);

  const onCustomStart = useCallback((v: string) => {
    setStartDate(v);
    setActivePreset("custom");
  }, []);

  const onCustomEnd = useCallback((v: string) => {
    setEndDate(v);
    setActivePreset("custom");
  }, []);

  const refresh = useCallback(() => {
    if (!token) return;
    setIsRefreshing(true);
    void load();
  }, [token, load]);

  const exportCsv = useCallback(() => {
    if (!data) return;
    const fname = `offer-hub-earnings-${startDate}-to-${endDate}.csv`;
    downloadEarningsCsv(data, fname);
  }, [data, startDate, endDate]);

  return {
    hasHydrated,
    token,
    startDate,
    endDate,
    activePreset,
    data,
    isLoading,
    isRefreshing,
    error,
    applyPreset,
    onCustomStart,
    onCustomEnd,
    refresh,
    exportCsv,
  };
}
