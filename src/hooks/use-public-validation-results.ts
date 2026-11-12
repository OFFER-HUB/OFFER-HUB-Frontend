"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublicValidationResults } from "@/lib/api/stats";
import type { PublicValidationResults } from "@/types/stats.types";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface UsePublicValidationResultsReturn {
  data: PublicValidationResults | null;
  error: string | null;
  fetchedAt: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function usePublicValidationResults(): UsePublicValidationResultsReturn {
  const [data, setData] = useState<PublicValidationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const results = await getPublicValidationResults();
      setData(results);
      setFetchedAt(new Date().toISOString());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load public validation results.";
      setError(message);
      console.error("Failed to load public validation results:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refresh]);

  return { data, error, fetchedAt, isLoading, refresh };
}
