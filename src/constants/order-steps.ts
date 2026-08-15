import type { OrderStatus } from "@/types/order.types";

/**
 * User-facing wording for a point in the order lifecycle.
 *
 * `step` is the position on the internal 7-step scale — the progress track only
 * draws four of them, so intermediate states share a milestone rather than
 * adding a circle nobody can act on.
 */
export interface OrderStepInfo {
  /** Position on the internal 1..{@link TOTAL_ORDER_STEPS} scale. */
  step: number;
  /** Label shown in the order header pill. */
  label: string;
  /** Short name of the action the user can take from here, or null when none. */
  action: string | null;
  /** Call-to-action wording for that action, or null when there is nothing to do. */
  nextLabel: string | null;
}

export const TOTAL_ORDER_STEPS = 7;

/**
 * Step wording per order status.
 *
 * Deliberately partial: statuses that never reach the detail view in a
 * meaningful state (`ESCROW_FUNDED`, `DISPUTED`, the `*_REQUESTED` pair) fall
 * back to {@link resolveOrderStep}'s default instead of inventing copy.
 */
export const ORDER_STEP_LABELS: Partial<Record<OrderStatus, OrderStepInfo>> = {
  ORDER_CREATED: {
    step: 1,
    label: "Order Created",
    action: "Confirm Order",
    nextLabel: "Confirm & Reserve Funds",
  },
  FUNDS_RESERVED: {
    step: 2,
    label: "Payment Confirmed",
    action: "Start Payment",
    nextLabel: "Start Secure Payment",
  },
  ESCROW_CREATING: { step: 3, label: "Setting up...", action: "Processing", nextLabel: null },
  ESCROW_FUNDING: { step: 4, label: "Processing...", action: "Processing", nextLabel: null },
  IN_PROGRESS: { step: 5, label: "Work in Progress", action: null, nextLabel: null },
  RELEASED: { step: 6, label: "Payment Released", action: null, nextLabel: null },
  REFUNDED: { step: 6, label: "Refunded", action: null, nextLabel: null },
  CLOSED: { step: 7, label: "Completed", action: null, nextLabel: null },
};

/** A circle on the progress track, keyed by the internal step it stands for. */
export interface OrderProgressMilestone {
  step: number;
  label: string;
}

/**
 * The four milestones drawn by the progress stepper.
 *
 * The gaps are intentional — steps 3, 4 and 6 are transient backend states that
 * roll up into the milestone before them.
 */
export const ORDER_PROGRESS_MILESTONES: readonly OrderProgressMilestone[] = [
  { step: 1, label: "Created" },
  { step: 2, label: "Confirmed" },
  { step: 5, label: "In Progress" },
  { step: 7, label: "Complete" },
];

/**
 * Step wording for a status, falling back to the raw status for anything the
 * map does not cover — an unknown status must never blank out the header.
 */
export function resolveOrderStep(status: OrderStatus): OrderStepInfo {
  return ORDER_STEP_LABELS[status] ?? { step: 1, label: status, action: null, nextLabel: null };
}
