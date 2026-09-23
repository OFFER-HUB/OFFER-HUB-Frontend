"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { listDisputes } from "@/lib/api/disputes";
import { type DisputeStatusFilter } from "@/lib/disputes/dispute-status";
import type { Dispute } from "@/types/dispute.types";

const PAGE_SIZE = 10;

export interface UseDisputeListOptions {
  mode: "client" | "freelancer";
}

export interface UseDisputeListResult {
  disputes: Dispute[];
  isLoading: boolean;
  error: string | null;
  filter: DisputeStatusFilter;
  hasMore: boolean;
  isLoadingMore: boolean;
  showSuccessMessage: boolean;
  dismissSuccessMessage: () => void;
  handleFilterChange: (status: DisputeStatusFilter) => void;
  handleLoadMore: () => Promise<void>;
  refetch: () => void;
}

/** Shared dispute-list state, filtering and pagination for the client and freelancer list pages. */
export function useDisputeList({ mode }: UseDisputeListOptions): UseDisputeListResult {
  const searchParams = useSearchParams();
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id);

  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<DisputeStatusFilter>("all");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (searchParams.get("created") === "true") {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    setMode(mode);
  }, [setMode, mode]);

  useEffect(() => {
    if (!mounted) return;

    async function fetchDisputes(): Promise<void> {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setDisputes([]);
      try {
        const result = await listDisputes(
          token,
          {
            status: filter === "all" ? undefined : filter,
            page: 1,
            limit: PAGE_SIZE,
          },
          userId
        );
        setDisputes(result.data);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load disputes");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchDisputes();
  }, [mounted, token, filter, refreshKey, userId]);

  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (isLoadingMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const result = await listDisputes(
        token,
        {
          status: filter === "all" ? undefined : filter,
          page: nextPage,
          limit: PAGE_SIZE,
        },
        userId
      );
      setDisputes((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more disputes");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, page, token, filter, userId]);

  const handleFilterChange = useCallback((next: DisputeStatusFilter): void => {
    if (next !== filter) {
      setFilter(next);
    }
  }, [filter]);

  const dismissSuccessMessage = useCallback(() => setShowSuccessMessage(false), []);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    disputes,
    isLoading,
    error,
    filter,
    hasMore,
    isLoadingMore,
    showSuccessMessage,
    dismissSuccessMessage,
    handleFilterChange,
    handleLoadMore,
    refetch,
  };
}