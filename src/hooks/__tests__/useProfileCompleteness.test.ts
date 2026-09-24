import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfileCompleteness } from "@/hooks/useProfileCompleteness";
import { useAuthStore } from "@/stores/auth-store";
import type { ProfileCompletenessData } from "@/lib/api/profile";

vi.mock("@/lib/api/profile", () => ({
  getProfileCompleteness: vi.fn(),
}));

import { getProfileCompleteness } from "@/lib/api/profile";

const mockGetProfileCompleteness = vi.mocked(getProfileCompleteness);

const COMPLETENESS: ProfileCompletenessData = {
  percentage: 60,
  missingFields: [{ field: "bio", label: "Bio", href: "/app/profile" }],
  isComplete: false,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useProfileCompleteness", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "tok" });
  });

  afterEach(() => {
    useAuthStore.setState({ token: null });
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("stops loading without requesting while signed out", async () => {
    useAuthStore.setState({ token: null });

    const { result } = renderHook(() => useProfileCompleteness());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(mockGetProfileCompleteness).not.toHaveBeenCalled();
  });

  it("loads completeness for the signed-in user's token", async () => {
    mockGetProfileCompleteness.mockResolvedValue(COMPLETENESS);

    const { result } = renderHook(() => useProfileCompleteness());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetProfileCompleteness).toHaveBeenCalledWith("tok");
    expect(result.current.data).toEqual(COMPLETENESS);
  });

  it("stays empty without an error when the request fails", async () => {
    mockGetProfileCompleteness.mockRejectedValue(new Error("Service unavailable"));

    const { result } = renderHook(() => useProfileCompleteness());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
  });

  it("does not update state after unmount", async () => {
    const pending = deferred<ProfileCompletenessData>();
    mockGetProfileCompleteness.mockReturnValue(pending.promise);
    const consoleError = vi.spyOn(console, "error");

    const { result, unmount } = renderHook(() => useProfileCompleteness());
    unmount();

    await act(async () => {
      pending.resolve(COMPLETENESS);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
