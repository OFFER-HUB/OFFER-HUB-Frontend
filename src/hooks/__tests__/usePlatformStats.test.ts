import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { getPlatformStats } from "@/lib/api/stats";
import type { PlatformStatsResponse } from "@/types/stats.types";

vi.mock("@/lib/api/stats", () => ({
  getPlatformStats: vi.fn(),
}));

const mockGetPlatformStats = vi.mocked(getPlatformStats);

function statsResponse(wallets: number, escrows: number): PlatformStatsResponse {
  return {
    summary: { users: 103, wallets, escrows, transactions: 4 },
    recentWallets: [],
    recentEscrows: [],
  };
}

describe("usePlatformStats", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("loads initial metrics and requests larger wallet or escrow pages", async () => {
    mockGetPlatformStats
      .mockResolvedValueOnce(statsResponse(12, 15))
      .mockResolvedValueOnce(statsResponse(22, 15))
      .mockResolvedValueOnce(statsResponse(22, 25));

    const { result } = renderHook(() => usePlatformStats());
    await waitFor(() => expect(result.current.data?.summary.wallets).toBe(12));
    expect(mockGetPlatformStats).toHaveBeenLastCalledWith(5, 5);

    act(() => result.current.showMoreWallets());
    await waitFor(() => expect(result.current.data?.summary.wallets).toBe(22));
    expect(mockGetPlatformStats).toHaveBeenLastCalledWith(15, 5);

    act(() => result.current.showMoreEscrows());
    await waitFor(() => expect(result.current.data?.summary.escrows).toBe(25));
    expect(mockGetPlatformStats).toHaveBeenLastCalledWith(15, 15);
  });

  it("keeps loaded data and reports a refresh error", async () => {
    mockGetPlatformStats
      .mockResolvedValueOnce(statsResponse(12, 15))
      .mockRejectedValueOnce(new Error("Service unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => usePlatformStats());
    await waitFor(() => expect(result.current.data).not.toBeNull());

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.error).toBe("Service unavailable"));
    expect(result.current.data?.summary.wallets).toBe(12);
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("exposes initial request failures without substituting metrics", async () => {
    mockGetPlatformStats.mockRejectedValue(new Error("Service unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => usePlatformStats());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Service unavailable");
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
