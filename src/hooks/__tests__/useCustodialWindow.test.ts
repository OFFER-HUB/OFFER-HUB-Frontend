import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

let mockNetwork: "testnet" | "public" = "testnet";
vi.mock("@/config/wallet", () => ({
  get STELLAR_NETWORK() {
    return mockNetwork;
  },
}));

let mockState: { token: string | null; user: { wallet?: { type: string } } | null };
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: typeof mockState) => unknown) => selector(mockState),
}));

const mockGetWalletReadiness = vi.fn();
vi.mock("@/lib/api/wallet-readiness", () => ({
  getWalletReadiness: (...args: unknown[]) => mockGetWalletReadiness(...args),
}));

import { useCustodialWindow } from "../useCustodialWindow";

const WINDOW = { cutoverAt: "2026-11-24T15:00:00.000Z", expiresAt: "2027-02-22T15:00:00.000Z" };

beforeEach(() => {
  vi.clearAllMocks();
  mockNetwork = "testnet";
  mockState = { token: "jwt", user: { wallet: { type: "INVISIBLE" } } };
  mockGetWalletReadiness.mockResolvedValue({ custodialReadOnly: WINDOW });
});

describe("useCustodialWindow", () => {
  it("returns the window for an unclaimed custodial user on the testnet sandbox", async () => {
    const { result } = renderHook(() => useCustodialWindow());

    await waitFor(() => expect(result.current).toEqual(WINDOW));
    expect(mockGetWalletReadiness).toHaveBeenCalledWith("jwt");
  });

  it("returns null before the cutover, when the API reports no window", async () => {
    mockGetWalletReadiness.mockResolvedValue({ custodialReadOnly: null });
    const { result } = renderHook(() => useCustodialWindow());

    await waitFor(() => expect(mockGetWalletReadiness).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it("never asks the API on mainnet", () => {
    mockNetwork = "public";
    const { result } = renderHook(() => useCustodialWindow());

    expect(result.current).toBeNull();
    expect(mockGetWalletReadiness).not.toHaveBeenCalled();
  });

  it.each([
    ["an external wallet", { token: "jwt", user: { wallet: { type: "EXTERNAL" } } }],
    ["no wallet", { token: "jwt", user: { wallet: undefined } }],
    ["no user", { token: "jwt", user: null }],
    ["no token", { token: null, user: { wallet: { type: "INVISIBLE" } } }],
  ])("never asks the API for %s", (_name, state) => {
    mockState = state as typeof mockState;
    const { result } = renderHook(() => useCustodialWindow());

    expect(result.current).toBeNull();
    expect(mockGetWalletReadiness).not.toHaveBeenCalled();
  });

  it("stops showing the window once the user no longer qualifies (for example after claiming)", async () => {
    const { result, rerender } = renderHook(() => useCustodialWindow());
    await waitFor(() => expect(result.current).toEqual(WINDOW));

    mockState = { token: "jwt", user: { wallet: { type: "EXTERNAL" } } };
    rerender();

    expect(result.current).toBeNull();
  });

  it("shows nothing when the status cannot be read", async () => {
    mockGetWalletReadiness.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useCustodialWindow());

    await waitFor(() => expect(mockGetWalletReadiness).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });
});
