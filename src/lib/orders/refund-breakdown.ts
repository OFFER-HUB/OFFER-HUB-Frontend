import type { Milestone } from "@/types/order.types";

export interface RefundBreakdown {
  /** Full order amount, as a number. */
  total: number;
  /** Sum of completed milestones — what the freelancer has already earned. */
  earned: number;
  /** Sum of non-completed milestones — what a refund would actually return. */
  refundable: number;
  completedCount: number;
  totalCount: number;
}

/**
 * Same rule as the backend's `calculateRefundableAmount`
 * (resolution/utils/refund-calculation.util.ts): the refundable part of an
 * order is the sum of its non-COMPLETED milestones. A milestone-free order
 * has nothing to prorate — refundable = the full amount.
 *
 * This is display-only. The buyer's direct refund request is still
 * all-or-nothing on the backend (100% or `REFUND_REQUIRES_DISPUTE` once any
 * milestone is completed — see useOrderRoles.refundRequiresDispute), so in
 * practice `earned` is 0 whenever this modal can still be reached. It exists
 * so the buyer sees that up front instead of the modal simply asserting
 * "$220.00 back" with no breakdown of what that is made of.
 */
export function computeRefundBreakdown(amount: string, milestones: Milestone[] | undefined): RefundBreakdown {
  const total = Number.parseFloat(amount);
  const safeTotal = Number.isFinite(total) ? total : 0;

  if (!milestones || milestones.length === 0) {
    return { total: safeTotal, earned: 0, refundable: safeTotal, completedCount: 0, totalCount: 0 };
  }

  const toNumber = (value: string) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const earned = milestones
    .filter((m) => m.status === "COMPLETED")
    .reduce((sum, m) => sum + toNumber(m.amount), 0);
  const completedCount = milestones.filter((m) => m.status === "COMPLETED").length;

  // Clamp so milestone amounts that drift from the order total can never
  // report a negative or over-100% refundable amount.
  const refundable = Math.max(0, Math.min(safeTotal, safeTotal - earned));

  return { total: safeTotal, earned: Math.min(earned, safeTotal), refundable, completedCount, totalCount: milestones.length };
}

/** Whether a refund breakdown step is worth showing at all — only when the order has milestones. */
export function hasMilestoneBreakdown(milestones: Milestone[] | undefined): boolean {
  return Boolean(milestones && milestones.length > 0);
}
