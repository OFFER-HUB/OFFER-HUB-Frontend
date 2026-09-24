import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRecommendedFreelancers } from "@/hooks/useRecommendedFreelancers";
import type { MarketplaceService, PaginatedResponse } from "@/lib/api/marketplace";

vi.mock("@/lib/api/marketplace", () => ({
  getPublicServices: vi.fn(),
}));

import { getPublicServices } from "@/lib/api/marketplace";

const mockGetPublicServices = vi.mocked(getPublicServices);

function service(id: string): MarketplaceService {
  return {
    id,
    userId: "usr_1",
    title: "Logo design",
    description: "",
    category: "design",
    price: "120.00",
    deliveryDays: 3,
    status: "ACTIVE",
    totalOrders: 4,
    averageRating: "4.5",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    user: {
      id: "usr_1",
      email: "ana@example.com",
      username: "ana",
      firstName: "Ana",
      lastName: "López",
      avatarUrl: null,
      country: null,
    },
  };
}

function page(services: MarketplaceService[]): PaginatedResponse<MarketplaceService> {
  return { data: services, hasMore: false };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useRecommendedFreelancers", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("requests four services and returns them", async () => {
    mockGetPublicServices.mockResolvedValue(page([service("s1"), service("s2")]));

    const { result } = renderHook(() => useRecommendedFreelancers());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetPublicServices).toHaveBeenCalledWith({ limit: 4 });
    expect(result.current.services.map((s) => s.id)).toEqual(["s1", "s2"]);
  });

  it("caps the list at four even if the API returns more", async () => {
    mockGetPublicServices.mockResolvedValue(
      page(["s1", "s2", "s3", "s4", "s5"].map((id) => service(id)))
    );

    const { result } = renderHook(() => useRecommendedFreelancers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.services.map((s) => s.id)).toEqual(["s1", "s2", "s3", "s4"]);
  });

  it("resolves to an empty list when the request fails", async () => {
    mockGetPublicServices.mockRejectedValue(new Error("Service unavailable"));

    const { result } = renderHook(() => useRecommendedFreelancers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.services).toEqual([]);
  });

  it("does not update state after unmount", async () => {
    const pending = deferred<PaginatedResponse<MarketplaceService>>();
    mockGetPublicServices.mockReturnValue(pending.promise);
    const consoleError = vi.spyOn(console, "error");

    const { result, unmount } = renderHook(() => useRecommendedFreelancers());
    unmount();

    await act(async () => {
      pending.resolve(page([service("s1")]));
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.services).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
