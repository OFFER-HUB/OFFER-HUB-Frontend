"use client";

import { LeaveReviewModal } from "@/components/rating";
import { DEFAULT_FREELANCER_LABEL } from "@/constants/order-messages";
import type { Order } from "@/types/order.types";

/** Who the buyer is rating, falling back through the seller's identifiers. */
function resolveRevieweeLabel(order: Order): string {
  return (
    order.seller?.name || order.seller?.username || order.seller?.email || DEFAULT_FREELANCER_LABEL
  );
}

interface OrderReviewPromptModalProps {
  isOpen: boolean;
  order: Order;
  onClose: () => void;
  onSkip: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

/**
 * Binds the generic review modal to an order, so the naming and context rules
 * live next to the order model instead of in the page.
 */
export function OrderReviewPromptModal({
  isOpen,
  order,
  onClose,
  onSkip,
  onSubmit,
}: OrderReviewPromptModalProps): React.JSX.Element {
  return (
    <LeaveReviewModal
      isOpen={isOpen}
      revieweeName={resolveRevieweeLabel(order)}
      orderTitle={order.title}
      serviceTitle={order.service?.title}
      onClose={onClose}
      onSkip={onSkip}
      onSubmit={onSubmit}
    />
  );
}
