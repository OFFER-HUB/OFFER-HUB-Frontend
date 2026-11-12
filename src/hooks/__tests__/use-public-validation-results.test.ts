import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePublicValidationResults } from "@/hooks/use-public-validation-results";
import { getPublicValidationResults } from "@/lib/api/stats";
import type { PublicValidationResults } from "@/types/stats.types";

vi.mock("@/lib/api/stats", () => ({
  getPublicValidationResults: vi.fn(),
}));

const mockGetResults = vi.mocked(getPublicValidationResults);
const results: PublicValidationResults = {
  total: 1,
  runs: [
    {
      id: "vr_0123456789abcdef",
      startedAt: "2026-11-16T14:00:00.000Z",
      finishedAt: "2026-11-16T14:06:00.000Z",
      network: "mainnet",
      status: "passed",
      corridor: "MX",
      steps: [],
      stellarExpertUrls: [],
      blindpayPayoutId: "po_1",
      blindpayStatus: "completed",
      trigger: "schedule",
      durationMs: 360000,
      orderId: null,
      contractId: null,
      stellarExpertContractUrl: null,
      receipt: null,
      publishedAt: "2026-11-16T14:06:01.000Z",
    },
  ],
};

describe("usePublicValidationResults", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("loads the public results and records the fetch time", async () => {
    mockGetResults.mockResolvedValue(results);

    const { result } = renderHook(() => usePublicValidationResults());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(results);
    expect(result.current.fetchedAt).not.toBeNull();
    expect(mockGetResults).toHaveBeenCalledOnce();
  });

  it("refreshes periodically and preserves the last successful results on failure", async () => {
    vi.useFakeTimers();
    mockGetResults
      .mockResolvedValueOnce(results)
      .mockRejectedValueOnce(new Error("Service unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => usePublicValidationResults());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    });

    expect(result.current.data).toEqual(results);
    expect(result.current.error).toBe("Service unavailable");
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
