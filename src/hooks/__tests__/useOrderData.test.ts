import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrderData } from "@/hooks/useOrderData";
import { useAuthStore } from "@/stores/auth-store";
import type { Order } from "@/types/order.types";

vi.mock("@/lib/api/orders", () => ({
  getOrderById: vi.fn(),
}));
vi.mock("@/lib/api/reviews", () => ({
  getOrderReview: vi.fn().mockResolvedValue(null),
}));

import { getOrderById } from "@/lib/api/orders";

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "ord_1",
    buyerId: "usr_buyer",
    sellerId: "usr_seller",
    source: "DIRECT",
    title: "Test order",
    description: "",
    amount: "100.00",
    status: "IN_PROGRESS",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
}

/** Flushes pending microtasks (the resolved-promise chains inside the hook's effects). */
async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useOrderData — background polling and manual refresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setVisibility("visible");
    useAuthStore.setState({ token: "tok", isAuthenticated: true, hasHydrated: true } as any);
    (getOrderById as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(order());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("polls again after the interval elapses, so the other party's changes show up without a page reload", async () => {
    const { result } = renderHook(() => useOrderData("ord_1"));
    await flush();

    expect(result.current.order).not.toBeNull();
    expect(getOrderById).toHaveBeenCalledTimes(1);

    (getOrderById as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      order({ status: "DELIVERED" }),
    );

    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    await flush();

    expect(getOrderById).toHaveBeenCalledTimes(2);
    expect(result.current.order?.status).toBe("DELIVERED");
  });

  it("does not poll while the tab is hidden", async () => {
    const { result } = renderHook(() => useOrderData("ord_1"));
    await flush();
    expect(result.current.order).not.toBeNull();
    expect(getOrderById).toHaveBeenCalledTimes(1);

    setVisibility("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    await flush();

    // The interval itself is torn down on hide — no calls should have landed.
    expect(getOrderById).toHaveBeenCalledTimes(1);
  });

  it("stops polling once the order is CLOSED — nothing left to refresh", async () => {
    (getOrderById as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(order({ status: "CLOSED" }));
    const { result } = renderHook(() => useOrderData("ord_1"));
    await flush();

    expect(result.current.order?.status).toBe("CLOSED");
    expect(getOrderById).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    await flush();

    expect(getOrderById).toHaveBeenCalledTimes(1);
  });

  it("refetch() flips isRefetching on and back off, for the manual refresh button's spinner", async () => {
    const { result } = renderHook(() => useOrderData("ord_1"));
    await flush();
    expect(result.current.order).not.toBeNull();

    expect(result.current.isRefetching).toBe(false);

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.refetch();
    });
    expect(result.current.isRefetching).toBe(true);

    await act(async () => {
      await pending;
    });
    expect(result.current.isRefetching).toBe(false);
  });
});
