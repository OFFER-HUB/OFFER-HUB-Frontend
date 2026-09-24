import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRecommendedOffers } from "@/hooks/useRecommendedOffers";
import type { MarketplaceOffer, PaginatedResponse } from "@/lib/api/marketplace";

vi.mock("@/lib/api/marketplace", () => ({
  getPublicOffers: vi.fn(),
}));

import { getPublicOffers } from "@/lib/api/marketplace";

const mockGetPublicOffers = vi.mocked(getPublicOffers);

function offer(id: string): MarketplaceOffer {
  return {
    id,
    title: "Landing page redesign",
    description: "",
    category: "design",
    budget: "500.00",
    deadline: "2026-03-05T12:00:00.000Z",
    status: "OPEN",
    createdAt: "2026-01-01T00:00:00.000Z",
    userId: "usr_1",
    applicantsCount: 2,
    user: { id: "usr_1", email: "client@example.com" },
    attachments: [],
  };
}

function page(offers: MarketplaceOffer[]): PaginatedResponse<MarketplaceOffer> {
  return { data: offers, hasMore: false };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useRecommendedOffers", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("requests four offers and returns them", async () => {
    mockGetPublicOffers.mockResolvedValue(page([offer("o1"), offer("o2")]));

    const { result } = renderHook(() => useRecommendedOffers());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetPublicOffers).toHaveBeenCalledWith({ limit: 4 });
    expect(result.current.offers.map((o) => o.id)).toEqual(["o1", "o2"]);
  });

  it("caps the list at four even if the API returns more", async () => {
    mockGetPublicOffers.mockResolvedValue(
      page(["o1", "o2", "o3", "o4", "o5"].map((id) => offer(id)))
    );

    const { result } = renderHook(() => useRecommendedOffers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.offers.map((o) => o.id)).toEqual(["o1", "o2", "o3", "o4"]);
  });

  it("resolves to an empty list when the request fails", async () => {
    mockGetPublicOffers.mockRejectedValue(new Error("Service unavailable"));

    const { result } = renderHook(() => useRecommendedOffers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.offers).toEqual([]);
  });

  it("does not update state after unmount", async () => {
    const pending = deferred<PaginatedResponse<MarketplaceOffer>>();
    mockGetPublicOffers.mockReturnValue(pending.promise);
    const consoleError = vi.spyOn(console, "error");

    const { result, unmount } = renderHook(() => useRecommendedOffers());
    unmount();

    await act(async () => {
      pending.resolve(page([offer("o1")]));
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.offers).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
