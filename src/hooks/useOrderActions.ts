"use client";

import { useCallback, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  cancelOrder,
  createEscrow,
  fundEscrow,
  markOrderCompleted,
  openDispute,
  releaseFunds,
  requestRefund,
  reserveFunds,
  type OpenDisputePayload,
} from "@/lib/api/orders";
import { submitOrderReview, submitReviewResponse } from "@/lib/api/reviews";
import {
  useEscrowSigningAction,
  SigningCancelledError,
  type UseEscrowSigningActionResult,
} from "@/hooks/useEscrowSigningAction";
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
  /** Called once a refund is requested, so the confirmation modal can close. */
  onRefundRequested?: () => void;
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
  /**
   * Buyer releases escrowed funds to the freelancer. For an EXTERNAL wallet,
   * walks the buyer through client-side signing (see `releaseSigning`)
   * instead of the server-signed call.
   */
  handleReleaseFunds: () => Promise<void>;
  /**
   * Seller marks the work delivered. For an EXTERNAL wallet, signs the
   * `complete_milestone` on-chain step first (see `completeSigning`), then
   * records the off-chain flag. For an INVISIBLE wallet, just records the
   * flag — the server holds seller keys and signs server-side when the buyer
   * later triggers the release flow.
   */
  handleMarkCompleted: () => Promise<void>;
  /**
   * Opens a dispute from whichever side the current user is on. For an
   * EXTERNAL wallet, first walks the buyer through client-side signing the
   * on-chain dispute step (see `disputeSigning`), then records the dispute
   * exactly as before. Rethrows so the modal can show the failure inline.
   */
  handleOpenDispute: (reason: DisputeReason, description: string) => Promise<void>;
  /**
   * Buyer requests a direct refund (distinct from opening a dispute for
   * admin review). For an EXTERNAL wallet, walks through client-side signing
   * (see `refundSigning`) instead of the server-signed call.
   */
  handleRequestRefund: (reason: string) => Promise<void>;
  /** Buyer submits the order review. Rejects on failure — the modal renders the message. */
  handleSubmitReview: (rating: number, comment: string) => Promise<void>;
  /** Seller answers the review left on them. Rejects on failure. */
  handleSubmitReviewResponse: (content: string) => Promise<void>;
  /** D2.1 signing state behind the seller's complete_milestone step — drives EscrowSigningModal/WalletConnectModal for it. */
  completeSigning: UseEscrowSigningActionResult;
  /** D2.1 signing state behind the release action — drives EscrowSigningModal/WalletConnectModal for it. */
  releaseSigning: UseEscrowSigningActionResult;
  /** D2.1 signing state behind the dispute action. */
  disputeSigning: UseEscrowSigningActionResult;
  /** D2.1 signing state behind the refund action. */
  refundSigning: UseEscrowSigningActionResult;
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
 * - Actions driven by a modal (dispute, refund, review, review response)
 *   reject so the modal can render the message next to the form the user is
 *   still looking at.
 *
 * Release, dispute, and refund each additionally own a `useEscrowSigningAction`
 * instance (D2.1): for an EXTERNAL wallet, the action walks through
 * client-side signing instead of calling the server-signed endpoint directly.
 * For an INVISIBLE wallet, `legacyAction` below *is* the exact call this hook
 * made before D2.1 — unchanged.
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
  onRefundRequested,
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

  // ---- D2.1: release ------------------------------------------------------

  const releaseSigning = useEscrowSigningAction({
    orderId,
    operation: "release",
    legacyAction: () =>
      runOrderMutation(
        (authToken) => releaseFunds(authToken, orderId),
        ORDER_ACTION_MESSAGES.releaseFunds,
        onFundsReleased
      ),
    onConfirmed: () => {
      setSuccess(ORDER_ACTION_MESSAGES.releaseFunds.success);
      onFundsReleased?.();
      void refetchOrder();
    },
  });

  const handleReleaseFunds = useCallback(async (): Promise<void> => {
    try {
      await releaseSigning.run();
    } catch {
      // Surfaced via releaseSigning.inlineError (client-signing failures) or,
      // for the legacy path, the shared error banner runOrderMutation already
      // set — nothing further to do here. A cancelled wallet-connect guard
      // needs no message at all.
    }
  }, [releaseSigning]);

  // ---- D2.1: dispute --------------------------------------------------------

  const disputeSigning = useEscrowSigningAction({
    orderId,
    operation: "dispute",
    // INVISIBLE wallets never needed an on-chain step here before D2.1 —
    // opening a dispute has always been a pure admin-review record.
    legacyAction: async () => {},
    // The admin dispute record is created by handleOpenDispute itself right
    // after this resolves, for both wallet types — nothing to do here.
    onConfirmed: () => {},
  });

  const handleOpenDispute = useCallback(
    async (reason: DisputeReason, description: string): Promise<void> => {
      if (!token) return;

      setIsProcessing(true);
      setError(null);

      try {
        // The on-chain dispute step always disputes on the buyer's behalf
        // (TrustlessWork's disputeResolver role requires it) regardless of
        // who calls this — so only run it when the buyer is the one opening
        // the dispute. A seller-initiated dispute skips straight to the
        // admin record, same as before D2.1.
        if (isBuyer) {
          // For an EXTERNAL wallet, flags the escrow as disputed on-chain
          // first — a precondition the platform's later resolution already
          // tolerates being pre-done (TrustlessWork reports "already in
          // dispute" and the server skips the step rather than failing).
          await disputeSigning.run();
        }

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
        const message =
          cause instanceof SigningCancelledError
            ? "Signing cancelled — dispute not opened."
            : toMessage(cause, ORDER_ACTION_MESSAGES.openDispute.failure);
        setError(message);
        // Rethrown so OpenDisputeModal keeps the form open with the message.
        throw new Error(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [disputeSigning, isBuyer, orderId, refetchOrder, token]
  );

  // ---- D2.1: refund -----------------------------------------------------

  // `legacyAction` below has no way to receive an argument (`run()` calls it
  // with none), so the reason the buyer typed has to be stashed here first.
  // The client-signing path has no reason field to send it to at all yet —
  // see the note on `handleRequestRefund`.
  const pendingRefundReason = useRef<string>("");

  const refundSigning = useEscrowSigningAction({
    orderId,
    operation: "refund",
    legacyAction: () =>
      runOrderMutation(
        (authToken) => requestRefund(authToken, orderId, pendingRefundReason.current),
        ORDER_ACTION_MESSAGES.requestRefund,
        onRefundRequested
      ),
    onConfirmed: () => {
      setSuccess(ORDER_ACTION_MESSAGES.requestRefund.success);
      onRefundRequested?.();
      void refetchOrder();
    },
  });

  const handleRequestRefund = useCallback(
    async (reason: string): Promise<void> => {
      pendingRefundReason.current = reason;
      try {
        await refundSigning.run();
      } catch {
        // Surfaced via refundSigning.inlineError, or the shared error banner
        // for the legacy path — same as handleReleaseFunds.
      }
    },
    [pendingRefundReason, refundSigning]
  );

  // ---- D2.1: complete_milestone (seller) ------------------------------------

  // For an EXTERNAL-wallet seller, `complete_milestone` must be signed
  // client-side before the buyer can sign `approve_milestone` + `release`.
  // For an INVISIBLE-wallet seller, the server holds both parties' keys and
  // signs all three steps when the buyer triggers the release flow, so the
  // off-chain metadata flag is all the seller needs to set here.
  const completeSigning = useEscrowSigningAction({
    orderId,
    operation: "release",
    legacyAction: () =>
      runOrderMutation(
        (authToken) => markOrderCompleted(authToken, orderId),
        ORDER_ACTION_MESSAGES.markCompleted
      ),
    onConfirmed: async () => {
      // On-chain step confirmed — persist the off-chain flag so the buyer's
      // UI knows the work is delivered and unlocks their "Release Funds" flow.
      if (token) {
        try {
          const updated = await markOrderCompleted(token, orderId);
          onOrderChange(updated);
        } catch {
          // Best-effort — the on-chain step succeeded; the metadata update
          // failing is not worth surfacing as an error to the seller.
        }
      }
      setSuccess(ORDER_ACTION_MESSAGES.markCompleted.success);
      void refetchOrder();
    },
  });

  const handleMarkCompleted = useCallback(async (): Promise<void> => {
    try {
      await completeSigning.run();
    } catch (cause) {
      if (!(cause instanceof SigningCancelledError)) {
        showError(toMessage(cause, ORDER_ACTION_MESSAGES.markCompleted.failure));
      }
    }
  }, [completeSigning, showError]);

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
    handleRequestRefund,
    handleSubmitReview,
    handleSubmitReviewResponse,
    completeSigning,
    releaseSigning,
    disputeSigning,
    refundSigning,
  };
}
