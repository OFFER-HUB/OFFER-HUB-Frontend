import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOrderRoles } from "@/hooks/useOrderRoles";
import { useAuthStore } from "@/stores/auth-store";
import type { Order } from "@/types/order.types";

const ORDER: Order = {
  id: "ord_1",
  buyerId: "usr_buyer",
  sellerId: "usr_seller",
  amount: "150.00",
  status: "IN_PROGRESS",
} as Order;

function roles(order: Order) {
  return renderHook(() => useOrderRoles({ order, review: null, isReviewLoading: false })).result.current;
}

beforeEach(() => {
  useAuthStore.setState({
    user: { id: "usr_buyer", email: "b@x.co", username: "b" },
    token: "t",
    isAuthenticated: true,
    hasHydrated: true,
  });
});

describe("useOrderRoles — delivery and refund gating", () => {
  it("nothing delivered, no milestones: refund is a direct action", () => {
    const r = roles(ORDER);
    expect(r.isWorkCompleted).toBe(false);
    expect(r.refundRequiresDispute).toBe(false);
  });

  it("DELIVERED status marks the work completed and routes refunds through a dispute", () => {
    const r = roles({ ...ORDER, status: "DELIVERED" });
    expect(r.isWorkCompleted).toBe(true);
    expect(r.refundRequiresDispute).toBe(true);
  });

  it("a completed milestone routes refunds through a dispute even while IN_PROGRESS", () => {
    const r = roles({
      ...ORDER,
      milestones: [
        { id: "m1", orderId: "ord_1", title: "Design", description: "", amount: "50.00", status: "COMPLETED" },
        { id: "m2", orderId: "ord_1", title: "Build", description: "", amount: "100.00", status: "OPEN" },
      ],
    });
    expect(r.isWorkCompleted).toBe(false);
    expect(r.refundRequiresDispute).toBe(true);
  });

  it("open milestones alone do not gate the refund", () => {
    const r = roles({
      ...ORDER,
      milestones: [{ id: "m1", orderId: "ord_1", title: "Design", description: "", amount: "50.00", status: "OPEN" }],
    });
    expect(r.refundRequiresDispute).toBe(false);
  });

  it("still honours the legacy completedBySeller metadata flag for older orders", () => {
    const r = roles({ ...ORDER, metadata: { completedBySeller: true } });
    expect(r.isWorkCompleted).toBe(true);
  });
});
