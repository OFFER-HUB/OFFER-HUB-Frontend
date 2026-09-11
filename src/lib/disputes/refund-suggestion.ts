import type { AdminDisputeMilestone } from "@/types/admin.types";

export interface RefundSplitSuggestion {
  /** What the buyer would get back: every milestone not yet completed. */
  refundAmount: string;
  /** What the seller keeps: the completed milestones. */
  releaseAmount: string;
  completedMilestones: number;
  totalMilestones: number;
}

function toCents(decimal: string): number {
  return Math.round(parseFloat(decimal) * 100);
}

function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Same rule as the backend's `calculateRefundableAmount` (resolution/utils/
 * refund-calculation.util.ts): the refundable part of an order is the sum of
 * its non-COMPLETED milestones; a milestone-free order is refundable in full.
 * The backend does not expose this on any endpoint, so the admin form
 * computes it from the milestones the detail already carries. It is a
 * starting number for the admin, never money movement.
 */
export function suggestRefundSplit(order: {
  amount: string;
  milestones?: AdminDisputeMilestone[] | null;
}): RefundSplitSuggestion {
  const totalCents = toCents(order.amount);
  const milestones = order.milestones ?? [];

  if (milestones.length === 0) {
    return { refundAmount: fromCents(totalCents), releaseAmount: "0.00", completedMilestones: 0, totalMilestones: 0 };
  }

  const refundCents = milestones
    .filter((m) => m.status !== "COMPLETED")
    .reduce((sum, m) => sum + toCents(m.amount), 0);
  // Clamp so a milestone total that drifts from the order amount can never
  // suggest a split the backend would reject as not summing to the order.
  const boundedRefund = Math.min(Math.max(refundCents, 0), totalCents);

  return {
    refundAmount: fromCents(boundedRefund),
    releaseAmount: fromCents(totalCents - boundedRefund),
    completedMilestones: milestones.filter((m) => m.status === "COMPLETED").length,
    totalMilestones: milestones.length,
  };
}

/** True when two decimal strings add up to a third, to the cent. */
export function amountsSumTo(a: string, b: string, total: string): boolean {
  const ca = toCents(a);
  const cb = toCents(b);
  if (!Number.isFinite(ca) || !Number.isFinite(cb)) return false;
  return ca + cb === toCents(total);
}
