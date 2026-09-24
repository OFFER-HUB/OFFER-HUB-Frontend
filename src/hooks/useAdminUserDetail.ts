"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getAdminUserDetail } from "@/lib/api/admin";
import type { AdminUserDetail } from "@/types/admin.types";

export interface UseAdminUserDetailResult {
  detail: AdminUserDetail | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads `GET /admin/users/:id` for the user the edit modal is showing. The
 * list rows carry no aggregates, so this is where orders / earnings / rating
 * come from. Passing `null` clears the state.
 */
export function useAdminUserDetail(userId: string | null): UseAdminUserDetailResult {
  const token = useAuthStore((s) => s.token);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId || !token) {
        setDetail(null);
        setError(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAdminUserDetail(token, userId);
        if (!cancelled) setDetail(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load user details");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  return { detail, isLoading, error };
}
