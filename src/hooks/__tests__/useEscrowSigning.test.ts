import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEscrowSigning } from "../useEscrowSigning";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {
    signTransaction: vi.fn(),
  },
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) =>
    selector({ token: "jwt-token" }),
}));

vi.mock("@/hooks/use-wallet-kit", () => ({
  useWalletKit: () => ({
    isReady: true,
    address: "GBUYERADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    network: "testnet",
    networkPassphrase: "Test SDF Network ; September 2015",
  }),
}));

const mockSign = vi.fn();
const mockReset = vi.fn();

vi.mock("@offer-hub/stellar-escrow-signing", () => ({
  useStellarEscrowSigning: vi.fn(() => ({
    state: "idle",
    sign: mockSign,
    reset: mockReset,
    transactionHash: null,
    error: null,
    currentStep: null,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useEscrowSigning — integration with @offer-hub/stellar-escrow-signing", () => {
  it("passes through the signing function from the package", () => {
    const { result } = renderHook(() => useEscrowSigning());

    act(() => {
      result.current.sign("ord_123", "create", "buyer");
    });

    expect(mockSign).toHaveBeenCalledWith("ord_123", "create", "buyer");
  });

  it("passes through the reset function from the package", () => {
    const { result } = renderHook(() => useEscrowSigning());

    act(() => {
      result.current.reset();
    });

    expect(mockReset).toHaveBeenCalled();
  });

  it("exposes all state from the package", () => {
    const { result } = renderHook(() => useEscrowSigning());

    expect(result.current.state).toBe("idle");
    expect(result.current.transactionHash).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.currentStep).toBeNull();
  });
});
