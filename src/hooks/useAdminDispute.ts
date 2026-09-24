"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { assignDispute, getAdminDispute, resolveDispute } from "@/lib/api/admin-disputes";
import type { AdminDispute, ResolveDisputePayload } from "@/types/admin.types";

export interface UseAdminDisputeResult {
  dispute: AdminDispute | null;
  isLoading: boolean;
  error: string | null;
  isActing: boolean;
  refetch: () => Promise<void>;
  /** OPEN → UNDER_REVIEW, assigned to the signed-in admin. */
  takeForReview: () => Promise<void>;
  /** UNDER_REVIEW → RESOLVED. */
  resolve: (payload: ResolveDisputePayload) => Promise<void>;
}

/** One dispute for the admin detail page, plus the two admin transitions. */
export function useAdminDispute(disputeId: string | null, enabled: boolean): UseAdminDisputeResult {
  const token = useAuthStore((s) => s.token);
  const adminId = useAuthStore((s) => s.user?.id ?? null);
  const [dispute, setDispute] = useState<AdminDispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled || !token || !disputeId) return;
    setIsLoading(true);
    setError(null);
    try {
      setDispute(await getAdminDispute(token, disputeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dispute");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, token, disputeId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  // assign / resolve answer with a thinner `order` (no buyer/seller/service)
  // than GET /disputes/:id, so after either transition the page re-reads the
  // full document instead of rendering the mutation response.
  const takeForReview = useCallback(async () => {
    if (!token || !disputeId || !adminId) return;
    setIsActing(true);
    try {
      await assignDispute(token, disputeId, adminId);
      setDispute(await getAdminDispute(token, disputeId));
    } finally {
      setIsActing(false);
    }
  }, [token, disputeId, adminId]);

  const resolve = useCallback(
    async (payload: ResolveDisputePayload) => {
      if (!token || !disputeId) return;
      setIsActing(true);
      try {
        await resolveDispute(token, disputeId, payload);
        setDispute(await getAdminDispute(token, disputeId));
      } finally {
        setIsActing(false);
      }
    },
    [token, disputeId]
  );

  return { dispute, isLoading, error, isActing, refetch, takeForReview, resolve };
}
