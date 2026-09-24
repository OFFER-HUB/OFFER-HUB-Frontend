"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getOrderById } from "@/lib/api/orders";
import { getOrderReview } from "@/lib/api/reviews";
import { ORDER_LOAD_ERRORS } from "@/constants/order-messages";
import type { Order, OrderStatus } from "@/types/order.types";
import type { OrderReview } from "@/types/review.types";

export interface UseOrderDataResult {
  order: Order | null;
  review: OrderReview | null;
  /** True until the order request settles. Never re-armed by {@link refetch}. */
  isLoading: boolean;
  /** True until the review request settles, tracked apart from the order. */
  isReviewLoading: boolean;
  /** Message from a failed order or review load, or null. */
  loadError: string | null;
  dismissLoadError: () => void;
  /** Replaces the cached order after a mutation returns the updated record. */
  setOrder: (order: Order) => void;
  /** Replaces the cached review after one is submitted or answered. */
  setReview: (review: OrderReview | null) => void;
  /**
   * Re-reads the order in the background — `isLoading` stays false so the page
   * never falls back to its loading state once it has rendered.
   *
   * Rejects on failure instead of swallowing: the caller that triggered the
   * refresh owns how the failure is surfaced.
   */
  refetch: () => Promise<void>;
  /** True only while a manually-triggered refetch is in flight — drives the refresh button's spinner. */
  isRefetching: boolean;
}

/** Nothing changes on an order once it reaches this status — stop polling. */
const TERMINAL_STATUS: OrderStatus = 'CLOSED';

/** How often the order is re-read in the background while the tab is visible. */
const POLL_INTERVAL_MS = 15_000;

function toMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message.length > 0 ? cause.message : fallback;
}

/**
 * The two reads behind the order detail page: the order itself and the review
 * attached to it.
 *
 * They are kept as separate requests with separate loading flags because the
 * review section renders its own placeholder while the rest of the page is
 * already interactive.
 */
export function useOrderData(orderId: string): UseOrderDataResult {
  const token = useAuthStore((state) => state.token);

  const [order, setOrder] = useState<Order | null>(null);
  const [review, setReview] = useState<OrderReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewLoading, setIsReviewLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // No token yet means the auth store has not rehydrated. Staying in the
    // loading state is deliberate — flipping it here would flash "Order Not
    // Found" at every signed-in user on reload.
    if (!token || !orderId) return;

    let isActive = true;

    async function loadOrder(authToken: string): Promise<void> {
      try {
        const data = await getOrderById(authToken, orderId);
        if (!isActive) return;
        setOrder(data);
      } catch (cause) {
        if (!isActive) return;
        setLoadError(toMessage(cause, ORDER_LOAD_ERRORS.order));
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadOrder(token);

    return () => {
      isActive = false;
    };
  }, [token, orderId]);

  useEffect(() => {
    if (!token || !orderId) {
      setIsReviewLoading(false);
      return;
    }

    let isActive = true;

    async function loadReview(authToken: string): Promise<void> {
      setIsReviewLoading(true);

      try {
        const existingReview = await getOrderReview(authToken, orderId);
        if (!isActive) return;
        setReview(existingReview);
      } catch (cause) {
        if (!isActive) return;
        console.error("Failed to fetch review:", cause);
        setLoadError(toMessage(cause, ORDER_LOAD_ERRORS.review));
      } finally {
        if (isActive) setIsReviewLoading(false);
      }
    }

    void loadReview(token);

    return () => {
      isActive = false;
    };
  }, [token, orderId]);

  const [isRefetching, setIsRefetching] = useState(false);

  const refetch = useCallback(async (): Promise<void> => {
    if (!token || !orderId) return;
    setIsRefetching(true);
    try {
      const data = await getOrderById(token, orderId);
      setOrder(data);
    } finally {
      setIsRefetching(false);
    }
  }, [token, orderId]);

  // Background polling: the other party's uploads, notes, and status changes
  // only ever landed once this page was reloaded — nothing refreshed the
  // order on its own. Paused while the tab is hidden (no point polling a
  // page nobody is looking at) and stopped once the order is CLOSED, since
  // nothing on it changes again after that.
  useEffect(() => {
    if (!token || !orderId || order?.status === TERMINAL_STATUS) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    function silentRefetch(): void {
      if (document.visibilityState !== "visible") return;
      getOrderById(token as string, orderId)
        .then((data) => setOrder(data))
        .catch(() => {
          // A background poll failing is not worth surfacing — the next
          // tick, or the manual refresh button, will try again.
        });
    }

    function start(): void {
      if (intervalId !== null) return;
      intervalId = setInterval(silentRefetch, POLL_INTERVAL_MS);
    }

    function stop(): void {
      if (intervalId === null) return;
      clearInterval(intervalId);
      intervalId = null;
    }

    function handleVisibilityChange(): void {
      if (document.visibilityState === "visible") {
        silentRefetch();
        start();
      } else {
        stop();
      }
    }

    start();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, orderId, order?.status]);

  const dismissLoadError = useCallback(() => setLoadError(null), []);

  return {
    order,
    review,
    isLoading,
    isReviewLoading,
    loadError,
    dismissLoadError,
    setOrder,
    setReview,
    refetch,
    isRefetching,
  };
}
