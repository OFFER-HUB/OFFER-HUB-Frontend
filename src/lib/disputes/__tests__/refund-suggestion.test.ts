import { describe, it, expect } from "vitest";
import { amountsSumTo, suggestRefundSplit } from "@/lib/disputes/refund-suggestion";
import type { AdminDisputeMilestone } from "@/types/admin.types";

const m = (id: string, amount: string, status: AdminDisputeMilestone["status"]): AdminDisputeMilestone => ({
  id, title: id, amount, status,
});

describe("suggestRefundSplit", () => {
  it("refunds everything on a milestone-free order (same as the backend's calculateRefundableAmount)", () => {
    expect(suggestRefundSplit({ amount: "220.00", milestones: [] })).toEqual({
      refundAmount: "220.00", releaseAmount: "0.00", completedMilestones: 0, totalMilestones: 0,
    });
  });

  it("releases completed milestones to the seller and refunds the open ones", () => {
    const result = suggestRefundSplit({
      amount: "150.00",
      milestones: [m("design", "50.00", "COMPLETED"), m("build", "100.00", "OPEN")],
    });
    expect(result).toEqual({ refundAmount: "100.00", releaseAmount: "50.00", completedMilestones: 1, totalMilestones: 2 });
  });

  it("never suggests more refund than the order amount when milestones drift", () => {
    const result = suggestRefundSplit({
      amount: "100.00",
      milestones: [m("a", "80.00", "OPEN"), m("b", "60.00", "OPEN")],
    });
    expect(result.refundAmount).toBe("100.00");
    expect(result.releaseAmount).toBe("0.00");
  });

  it("works in cents so 0.1 + 0.2 style amounts still add up", () => {
    const result = suggestRefundSplit({
      amount: "0.30",
      milestones: [m("a", "0.10", "COMPLETED"), m("b", "0.20", "OPEN")],
    });
    expect(result).toMatchObject({ refundAmount: "0.20", releaseAmount: "0.10" });
    expect(amountsSumTo(result.releaseAmount, result.refundAmount, "0.30")).toBe(true);
  });
});

describe("amountsSumTo", () => {
  it("is exact to the cent", () => {
    expect(amountsSumTo("50.00", "100.00", "150.00")).toBe(true);
    expect(amountsSumTo("50.01", "100.00", "150.00")).toBe(false);
    expect(amountsSumTo("abc", "100.00", "150.00")).toBe(false);
  });
});
