"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { Order, OrderParticipant } from "@/types/order.types";
import type { OrderReview } from "@/types/review.types";

export interface UseOrderRolesParams {
  order: Order | null;
  review: OrderReview | null;
  isReviewLoading: boolean;
}

export interface UseOrderRolesResult {
  /** Signed-in user is the client who placed the order. */
  isBuyer: boolean;
  /** Signed-in user is the freelancer delivering it. */
  isSeller: boolean;
  /** Freelancer has flagged the work as delivered. */
  isWorkCompleted: boolean;
  /** Order reached a terminal, paid-out state. */
  isOrderComplete: boolean;
  /** The other side of the order, from the signed-in user's point of view. */
  counterparty: OrderParticipant | undefined;
  /** Buyer finished the order and has not reviewed it yet. */
  canLeaveReview: boolean;
  /** Seller was reviewed and has not answered yet. */
  canRespondToReview: boolean;
  /** Whether the review section has anything to show at all. */
  isReviewSectionVisible: boolean;
}

/**
 * Who the signed-in user is on this order, and what that lets them do.
 *
 * Every branch on the page reads from here rather than comparing ids inline, so
 * a permission rule has exactly one definition.
 */
export function useOrderRoles({
  order,
  review,
  isReviewLoading,
}: UseOrderRolesParams): UseOrderRolesResult {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    const isBuyer = Boolean(user?.id) && user?.id === order?.buyerId;
    const isSeller = Boolean(user?.id) && user?.id === order?.sellerId;
    const isWorkCompleted = order?.metadata?.completedBySeller === true;
    const isOrderComplete = order?.status === "RELEASED" || order?.status === "CLOSED";

    const canLeaveReview = isBuyer && isOrderComplete && !review;
    const canRespondToReview = Boolean(
      review && isSeller && user?.id === review.revieweeId && !review.response
    );

    return {
      isBuyer,
      isSeller,
      isWorkCompleted,
      isOrderComplete,
      counterparty: isBuyer ? order?.seller : order?.buyer,
      canLeaveReview,
      canRespondToReview,
      isReviewSectionVisible:
        isReviewLoading || Boolean(review) || canLeaveReview || (isSeller && isOrderComplete),
    };
  }, [isReviewLoading, order, review, user?.id]);
}
