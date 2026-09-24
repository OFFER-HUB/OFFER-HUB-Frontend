"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEmptyProfileViewsAnalytics } from "@/data/profile-views.data";
import { getProfileViewsAnalytics } from "@/lib/api/analytics";
import type { ProfileViewsAnalytics } from "@/types/profile-views.types";

const FALLBACK_ERROR_MESSAGE = "Failed to load profile views analytics";

export interface UseProfileViewsAnalyticsResult {
  /** Profile-view analytics, or the empty record while signed out and after a failure. */
  analytics: ProfileViewsAnalytics;
  /** True while a request is in flight. */
  isLoading: boolean;
  /** Failure message from the last request, or null. */
  error: string | null;
  /** Re-run the request, e.g. from a retry button. */
  refetch: () => Promise<void>;
}

/**
 * Profile-view analytics for the freelancer identified by `token`.
 *
 * Loads whenever the token changes. Only the latest request may update state —
 * a new load or an unmount aborts the previous one, so a slow response can
 * neither overwrite newer data nor update an unmounted component.
 */
export function useProfileViewsAnalytics(token: string | null): UseProfileViewsAnalyticsResult {
  const [analytics, setAnalytics] = useState<ProfileViewsAnalytics>(
    getEmptyProfileViewsAnalytics()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const load = useCallback(async (): Promise<void> => {
    requestRef.current?.abort();

    if (!token) {
      requestRef.current = null;
      setAnalytics(getEmptyProfileViewsAnalytics());
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getProfileViewsAnalytics(token);
      if (controller.signal.aborted) return;
      setAnalytics(data);
    } catch (err) {
      if (controller.signal.aborted) return;
      setAnalytics(getEmptyProfileViewsAnalytics());
      setError(err instanceof Error ? err.message : FALLBACK_ERROR_MESSAGE);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    void load();

    return () => requestRef.current?.abort();
  }, [load]);

  return { analytics, isLoading, error, refetch: load };
}
