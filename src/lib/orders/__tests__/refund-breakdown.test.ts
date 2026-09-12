import { describe, it, expect } from "vitest";
import { computeRefundBreakdown, hasMilestoneBreakdown } from "@/lib/orders/refund-breakdown";
import type { Milestone } from "@/types/order.types";

const m = (id: string, amount: string, status: Milestone["status"]): Milestone => ({
  id, orderId: "ord_1", title: id, description: "", amount, status,
});

describe("computeRefundBreakdown", () => {
  it("is fully refundable with nothing earned on a milestone-free order", () => {
    expect(computeRefundBreakdown("220.00", undefined)).toEqual({
      total: 220, earned: 0, refundable: 220, completedCount: 0, totalCount: 0,
    });
    expect(computeRefundBreakdown("220.00", [])).toEqual({
      total: 220, earned: 0, refundable: 220, completedCount: 0, totalCount: 0,
    });
  });

  it("subtracts completed milestones from the refundable amount", () => {
    const result = computeRefundBreakdown("150.00", [m("design", "50.00", "COMPLETED"), m("build", "100.00", "OPEN")]);
    expect(result).toEqual({ total: 150, earned: 50, refundable: 100, completedCount: 1, totalCount: 2 });
  });

  it("is fully refundable when no milestone is completed yet, even though milestones exist", () => {
    const result = computeRefundBreakdown("150.00", [m("design", "50.00", "OPEN"), m("build", "100.00", "OPEN")]);
    expect(result).toEqual({ total: 150, earned: 0, refundable: 150, completedCount: 0, totalCount: 2 });
  });

  it("clamps earned/refundable so they never exceed the order total", () => {
    const result = computeRefundBreakdown("100.00", [m("a", "80.00", "COMPLETED"), m("b", "60.00", "COMPLETED")]);
    expect(result.earned).toBe(100);
    expect(result.refundable).toBe(0);
  });

  it("treats a malformed amount as zero rather than NaN", () => {
    expect(computeRefundBreakdown("n/a", []).total).toBe(0);
  });
});

describe("hasMilestoneBreakdown", () => {
  it("is false for no milestones, true otherwise", () => {
    expect(hasMilestoneBreakdown(undefined)).toBe(false);
    expect(hasMilestoneBreakdown([])).toBe(false);
    expect(hasMilestoneBreakdown([m("a", "1.00", "OPEN")])).toBe(true);
  });
});
