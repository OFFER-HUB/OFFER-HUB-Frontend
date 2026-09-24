import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfileViewsAnalytics } from "@/hooks/useProfileViewsAnalytics";
import { getEmptyProfileViewsAnalytics } from "@/data/profile-views.data";
import type { ProfileViewsAnalytics } from "@/types/profile-views.types";

vi.mock("@/lib/api/analytics", () => ({
  getProfileViewsAnalytics: vi.fn(),
}));

import { getProfileViewsAnalytics } from "@/lib/api/analytics";

const mockGetProfileViewsAnalytics = vi.mocked(getProfileViewsAnalytics);

function analytics(overrides: Partial<ProfileViewsAnalytics> = {}): ProfileViewsAnalytics {
  return {
    ...getEmptyProfileViewsAnalytics(),
    week: { current: 12, previous: 8 },
    trendPercentage: 50,
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useProfileViewsAnalytics", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("returns the empty record without requesting while signed out", async () => {
    const { result } = renderHook(() => useProfileViewsAnalytics(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.analytics).toEqual(getEmptyProfileViewsAnalytics());
    expect(result.current.error).toBeNull();
    expect(mockGetProfileViewsAnalytics).not.toHaveBeenCalled();
  });

  it("loads analytics for the token", async () => {
    mockGetProfileViewsAnalytics.mockResolvedValue(analytics());

    const { result } = renderHook(() => useProfileViewsAnalytics("tok"));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetProfileViewsAnalytics).toHaveBeenCalledWith("tok");
    expect(result.current.analytics).toEqual(analytics());
    expect(result.current.error).toBeNull();
  });

  it("surfaces the failure message and falls back to the empty record", async () => {
    mockGetProfileViewsAnalytics.mockRejectedValue(new Error("Service unavailable"));

    const { result } = renderHook(() => useProfileViewsAnalytics("tok"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Service unavailable");
    expect(result.current.analytics).toEqual(getEmptyProfileViewsAnalytics());
  });

  it("uses a generic message when the failure is not an Error", async () => {
    mockGetProfileViewsAnalytics.mockRejectedValue("boom");

    const { result } = renderHook(() => useProfileViewsAnalytics("tok"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Failed to load profile views analytics");
  });

  it("refetch retries after a failure and clears the error", async () => {
    mockGetProfileViewsAnalytics.mockRejectedValueOnce(new Error("Service unavailable"));
    mockGetProfileViewsAnalytics.mockResolvedValueOnce(analytics());

    const { result } = renderHook(() => useProfileViewsAnalytics("tok"));
    await waitFor(() => expect(result.current.error).toBe("Service unavailable"));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetProfileViewsAnalytics).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
    expect(result.current.analytics).toEqual(analytics());
  });

  it("ignores a slow response for a previous token", async () => {
    const first = deferred<ProfileViewsAnalytics>();
    const second = deferred<ProfileViewsAnalytics>();
    mockGetProfileViewsAnalytics
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const { result, rerender } = renderHook(({ token }) => useProfileViewsAnalytics(token), {
      initialProps: { token: "tok_old" },
    });
    rerender({ token: "tok_new" });

    await act(async () => {
      second.resolve(analytics({ trendPercentage: 20 }));
    });
    await act(async () => {
      first.resolve(analytics({ trendPercentage: -99 }));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.analytics.trendPercentage).toBe(20);
  });

  it("does not update state after unmount", async () => {
    const pending = deferred<ProfileViewsAnalytics>();
    mockGetProfileViewsAnalytics.mockReturnValue(pending.promise);
    const consoleError = vi.spyOn(console, "error");

    const { result, unmount } = renderHook(() => useProfileViewsAnalytics("tok"));
    unmount();

    await act(async () => {
      pending.resolve(analytics());
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.analytics).toEqual(getEmptyProfileViewsAnalytics());
    expect(consoleError).not.toHaveBeenCalled();
  });
});
