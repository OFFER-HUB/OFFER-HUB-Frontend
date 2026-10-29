import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePlatformStats } from "@/hooks/use-platform-stats";
import { getPlatformStats } from "@/lib/api/stats";
import type { PlatformStatsResponse } from "@/types/stats.types";

vi.mock("@/lib/api/stats", () => ({
  getPlatformStats: vi.fn(),
}));

const mockGetPlatformStats = vi.mocked(getPlatformStats);

function platformStats(users = 103): PlatformStatsResponse {
  return {
    summary: { users, wallets: 12, escrows: 15, transactions: 4 },
    recentWallets: [],
    recentEscrows: [],
  };
}

describe("usePlatformStats", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("loads public metrics and refreshes them periodically", async () => {
    vi.useFakeTimers();
    mockGetPlatformStats.mockResolvedValue(platformStats());

    const { result } = renderHook(() => usePlatformStats(5, 5));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toEqual(platformStats());
    expect(result.current.fetchedAt).not.toBeNull();
    expect(mockGetPlatformStats).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    });

    expect(mockGetPlatformStats).toHaveBeenCalledTimes(2);
  });

  it("keeps the last successful metrics visible when a refresh fails", async () => {
    mockGetPlatformStats
      .mockResolvedValueOnce(platformStats())
      .mockRejectedValueOnce(new Error("Service unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => usePlatformStats(5, 5));
    await waitFor(() => expect(result.current.data).toEqual(platformStats()));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data).toEqual(platformStats());
    expect(result.current.error).toBe("Service unavailable");
    expect(result.current.fetchedAt).not.toBeNull();
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("reports an initial load failure without substituting fake data", async () => {
    mockGetPlatformStats.mockRejectedValue(new Error("Service unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => usePlatformStats(5, 5));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Service unavailable");
    expect(result.current.fetchedAt).toBeNull();
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
