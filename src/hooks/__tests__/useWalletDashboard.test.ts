import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWalletDashboard } from "@/hooks/useWalletDashboard";
import { getWalletDashboard } from "@/lib/api/wallet";
import type { WalletDashboardData } from "@/types/wallet.types";

vi.mock("@/lib/api/wallet", () => ({
  getWalletDashboard: vi.fn(),
}));

const mockGetWalletDashboard = vi.mocked(getWalletDashboard);

const dashboard: WalletDashboardData = {
  balance: { currency: "USD", available: "100.00", reserved: "20.00" },
  monthly: {
    currentMonthEarnings: "100.00",
    currentMonthSpending: "0.00",
    previousMonthEarnings: "50.00",
    previousMonthSpending: "0.00",
  },
  withdrawals: { pendingTotal: "0.00", pendingCount: 0 },
  chart: [],
  recentTransactions: [],
};

describe("useWalletDashboard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads the dashboard for the current token", async () => {
    mockGetWalletDashboard.mockResolvedValue(dashboard);

    const { result } = renderHook(() => useWalletDashboard("token"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetWalletDashboard).toHaveBeenCalledWith("token");
    expect(result.current.data).toEqual(dashboard);
    expect(result.current.error).toBeNull();
  });

  it("refreshes the dashboard on demand", async () => {
    mockGetWalletDashboard.mockResolvedValue(dashboard);
    const { result } = renderHook(() => useWalletDashboard("token"));
    await waitFor(() => expect(result.current.data).toEqual(dashboard));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetWalletDashboard).toHaveBeenCalledTimes(2);
    expect(result.current.isRefreshing).toBe(false);
  });

  it("shows a request error instead of fake dashboard data", async () => {
    mockGetWalletDashboard.mockRejectedValue(new Error("Service unavailable"));
    const { result } = renderHook(() => useWalletDashboard("token"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Service unavailable");
  });

  it("does not fetch without a token", async () => {
    const { result } = renderHook(() => useWalletDashboard(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(mockGetWalletDashboard).not.toHaveBeenCalled();
  });
});
