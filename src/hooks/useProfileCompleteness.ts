"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getProfileCompleteness, type ProfileCompletenessData } from "@/lib/api/profile";

export interface UseProfileCompletenessResult {
  /** Completeness of the signed-in user's profile, or null until loaded or when the request fails. */
  data: ProfileCompletenessData | null;
  /** True until the first request settles, or immediately false while signed out. */
  isLoading: boolean;
}

/**
 * Completeness of the signed-in user's profile, reloaded when the auth token
 * changes.
 *
 * The widget is optional content, so a failed request leaves `data` as it was
 * instead of surfacing an error.
 */
export function useProfileCompleteness(): UseProfileCompletenessResult {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<ProfileCompletenessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(
    async (signal: AbortSignal): Promise<void> => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const completeness = await getProfileCompleteness(token);
        if (signal.aborted) return;
        setData(completeness);
      } catch {
        // Hidden on failure — see the hook docs.
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);

    return () => controller.abort();
  }, [load]);

  return { data, isLoading };
}
