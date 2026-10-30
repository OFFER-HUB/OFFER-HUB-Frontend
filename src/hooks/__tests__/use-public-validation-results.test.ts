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
  publishedAt: "2026-10-25T10:00:00.000Z",
  runs: [
    {
      id: "run-1",
      name: "Escrow release validation",
      status: "passed",
      completedAt: "2026-10-24T10:00:00.000Z",
      stellarExpertUrl: "https://stellar.expert/explorer/testnet/tx/abc",
      blindPayReceiptUrl: "https://app.blindpay.com/receipt/abc",
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
