"use client";

import { useCallback, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  cancelOrder,
  createEscrow,
  fundEscrow,
  markOrderCompleted,
  openDispute,
  releaseFunds,
  reserveFunds,
  type OpenDisputePayload,
} from "@/lib/api/orders";
import { submitOrderReview, submitReviewResponse } from "@/lib/api/reviews";
import {
  ORDER_ACTION_MESSAGES,
  ORDER_CONFIRM_PROMPTS,
  ORDER_REVIEW_GUARDS,
  REVIEWEE_NAME_FALLBACK,
  type OrderActionMessages,
} from "@/constants/order-messages";
import type { Order } from "@/types/order.types";
import type { OrderReview } from "@/types/review.types";

export type DisputeReason = OpenDisputePayload["reason"];

export interface UseOrderActionsParams {
  orderId: string;
  /** Current order, needed by the review actions for their payload. */
  order: Order | null;
  /** Current review, needed to answer it. */
  review: OrderReview | null;
  /** Decides which side a dispute is opened from. */
  isBuyer: boolean;
  /** Called with the updated order returned by every mutation. */
  onOrderChange: (order: Order) => void;
  /** Called with the review created or updated by the review actions. */
  onReviewChange: (review: OrderReview) => void;
  /** Re-reads the order after an action that does not return it. */
  refetchOrder: () => Promise<void>;
  /** Called once funds are released, so the confirmation modal can close. */
  onFundsReleased?: () => void;
  /** Called once a review is submitted, so its modal can stay up to confirm it. */
  onReviewSubmitted?: () => void;
}

export interface UseOrderActionsResult {
  /** True while any banner-reporting action is in flight. Disables the action buttons. */
  isProcessing: boolean;
  error: string | null;
  success: string | null;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  dismissError: () => void;
  dismissSuccess: () => void;
  /** Buyer confirms the order, reserving funds from their balance. */
  handleReserveFunds: () => Promise<void>;
  /** Buyer starts the escrow contract. */
  handleCreateEscrow: () => Promise<void>;
  /**
   * Funds an already-created escrow.
   *
   * Not wired to a control today — funding is driven server-side once the
   * contract exists — but kept so the flow stays reachable from one place if
   * the manual step comes back.
   */
  handleFundEscrow: () => Promise<void>;
  /** Buyer cancels the order, after a native confirmation prompt. */
  handleCancel: () => Promise<void>;
  /** Buyer releases escrowed funds to the freelancer. */
  handleReleaseFunds: () => Promise<void>;
  /** Seller marks the work delivered, handing review back to the buyer. */
  handleMarkCompleted: () => Promise<void>;
  /** Opens a dispute from whichever side the current user is on. Rethrows so the modal can show the failure inline. */
  handleOpenDispute: (reason: DisputeReason, description: string) => Promise<void>;
  /** Buyer submits the order review. Rejects on failure — the modal renders the message. */
  handleSubmitReview: (rating: number, comment: string) => Promise<void>;
  /** Seller answers the review left on them. Rejects on failure. */
  handleSubmitReviewResponse: (content: string) => Promise<void>;
}

function toMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message.length > 0 ? cause.message : fallback;
}

/**
 * Every action the order detail page can trigger, plus the processing and
 * notification state they share.
 *
 * Two tiers of error handling, matching how the UI reports them:
 * - Actions driven by a button on the page report through the `error` banner.
 * - Actions driven by a modal (dispute, review, review response) reject so the
 *   modal can render the message next to the form the user is still looking at.
 *   The dispute action does both, since it also owns a banner-level success.
 */
export function useOrderActions({
  orderId,
  order,
  review,
  isBuyer,
  onOrderChange,
  onReviewChange,
  refetchOrder,
  onFundsReleased,
  onReviewSubmitted,
}: UseOrderActionsParams): UseOrderActionsResult {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showError = useCallback((message: string) => setError(message), []);
  const showSuccess = useCallback((message: string) => setSuccess(message), []);
  const dismissError = useCallback(() => setError(null), []);
  const dismissSuccess = useCallback(() => setSuccess(null), []);

  /**
   * Shared shape of the six status transitions: flag as processing, clear the
   * previous error, swap in the order the API returns, report the outcome.
   */
  const runOrderMutation = useCallback(
    async (
      mutate: (authToken: string) => Promise<Order>,
      messages: OrderActionMessages,
      onCompleted?: () => void
    ): Promise<void> => {
      if (!token) return;

      setIsProcessing(true);
      setError(null);

      try {
        const updated = await mutate(token);
        onOrderChange(updated);
        setSuccess(messages.success);
        onCompleted?.();
      } catch (cause) {
        setError(toMessage(cause, messages.failure));
      } finally {
        setIsProcessing(false);
      }
    },
    [onOrderChange, token]
  );

  const handleReserveFunds = useCallback(
    () =>
      runOrderMutation(
        (authToken) => reserveFunds(authToken, orderId),
        ORDER_ACTION_MESSAGES.reserveFunds
      ),
    [orderId, runOrderMutation]
  );

  const handleCreateEscrow = useCallback(
    () =>
      runOrderMutation(
        (authToken) => createEscrow(authToken, orderId),
        ORDER_ACTION_MESSAGES.createEscrow
      ),
    [orderId, runOrderMutation]
  );

  const handleFundEscrow = useCallback(
    () =>
      runOrderMutation(
        (authToken) => fundEscrow(authToken, orderId),
        ORDER_ACTION_MESSAGES.fundEscrow
      ),
    [orderId, runOrderMutation]
  );

  const handleCancel = useCallback(async (): Promise<void> => {
    if (!window.confirm(ORDER_CONFIRM_PROMPTS.cancelOrder)) return;

    await runOrderMutation(
      (authToken) => cancelOrder(authToken, orderId),
      ORDER_ACTION_MESSAGES.cancelOrder
    );
  }, [orderId, runOrderMutation]);

  const handleReleaseFunds = useCallback(
    () =>
      runOrderMutation(
        (authToken) => releaseFunds(authToken, orderId),
        ORDER_ACTION_MESSAGES.releaseFunds,
        onFundsReleased
      ),
    [onFundsReleased, orderId, runOrderMutation]
  );

  const handleMarkCompleted = useCallback(
    () =>
      runOrderMutation(
        (authToken) => markOrderCompleted(authToken, orderId),
        ORDER_ACTION_MESSAGES.markCompleted
      ),
    [orderId, runOrderMutation]
  );

  const handleOpenDispute = useCallback(
    async (reason: DisputeReason, description: string): Promise<void> => {
      if (!token) return;

      setIsProcessing(true);
      setError(null);

      try {
        const payload: OpenDisputePayload = {
          orderId,
          openedBy: isBuyer ? "BUYER" : "SELLER",
          reason,
          description,
        };

        await openDispute(token, payload);
        setSuccess(ORDER_ACTION_MESSAGES.openDispute.success);

        // The dispute endpoint answers with the dispute, not the order, so the
        // new status has to be read back.
        await refetchOrder();
      } catch (cause) {
        setError(toMessage(cause, ORDER_ACTION_MESSAGES.openDispute.failure));
        // Rethrown so OpenDisputeModal keeps the form open with the message.
        throw cause;
      } finally {
        setIsProcessing(false);
      }
    },
    [isBuyer, orderId, refetchOrder, token]
  );

  const handleSubmitReview = useCallback(
    async (rating: number, comment: string): Promise<void> => {
      if (!token || !order || !user) {
        throw new Error(ORDER_REVIEW_GUARDS.signedOut);
      }

      const reviewee = order.seller;

      if (!reviewee?.id) {
        throw new Error(ORDER_REVIEW_GUARDS.unknownReviewee);
      }

      const createdReview = await submitOrderReview(token, {
        orderId: order.id,
        rating,
        comment,
        revieweeId: reviewee.id,
        revieweeName:
          reviewee.name || reviewee.username || reviewee.email || REVIEWEE_NAME_FALLBACK,
        reviewerId: user.id,
        reviewerName: user.username || user.email,
        orderTitle: order.title,
        serviceTitle: order.service?.title,
      });

      onReviewChange(createdReview);
      onReviewSubmitted?.();
      setSuccess(ORDER_ACTION_MESSAGES.submitReview.success);
    },
    [onReviewChange, onReviewSubmitted, order, token, user]
  );

  const handleSubmitReviewResponse = useCallback(
    async (content: string): Promise<void> => {
      if (!token || !review || !order) {
        throw new Error(ORDER_REVIEW_GUARDS.responseUnavailable);
      }

      const response = await submitReviewResponse(token, review.id, order.id, content);

      onReviewChange({ ...review, response });
      setSuccess(ORDER_ACTION_MESSAGES.submitReviewResponse.success);
    },
    [onReviewChange, order, review, token]
  );

  return {
    isProcessing,
    error,
    success,
    showError,
    showSuccess,
    dismissError,
    dismissSuccess,
    handleReserveFunds,
    handleCreateEscrow,
    handleFundEscrow,
    handleCancel,
    handleReleaseFunds,
    handleMarkCompleted,
    handleOpenDispute,
    handleSubmitReview,
    handleSubmitReviewResponse,
  };
}
