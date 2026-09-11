"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getAdminDisputes } from "@/lib/api/admin-disputes";
import type { AdminDispute, AdminDisputesFilters } from "@/types/admin.types";

export const DEFAULT_ADMIN_DISPUTES_FILTERS: AdminDisputesFilters = { status: "ALL", openedBy: "ALL" };
const PAGE_SIZE = 10;

export interface UseAdminDisputesResult {
  disputes: AdminDispute[];
  isLoading: boolean;
  error: string | null;
  filters: AdminDisputesFilters;
  page: number;
  hasMore: boolean;
  setFilters: (filters: AdminDisputesFilters) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

/** One page of `GET /disputes` for the admin; filters and paging are server-side. */
export function useAdminDisputes(enabled: boolean): UseAdminDisputesResult {
  const token = useAuthStore((s) => s.token);
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AdminDisputesFilters>(DEFAULT_ADMIN_DISPUTES_FILTERS);
  const [page, setPage] = useState(1);

  const refetch = useCallback(async () => {
    if (!enabled || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAdminDisputes(token, { ...filters, page, limit: PAGE_SIZE });
      setDisputes(result.disputes);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load disputes");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, token, filters, page]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const setFilters = useCallback((next: AdminDisputesFilters) => {
    setFiltersState(next);
    setPage(1);
  }, []);

  return { disputes, isLoading, error, filters, page, hasMore, setFilters, setPage, refetch };
}
