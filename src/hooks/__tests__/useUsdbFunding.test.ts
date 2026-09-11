import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUsdbFunding } from "../useUsdbFunding";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockSignTransaction = vi.fn();

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {
    signTransaction: (...args: unknown[]) => mockSignTransaction(...args),
  },
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) => selector({ token: "jwt-token" }),
}));

let mockAddress: string | null = "GSELLERADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
vi.mock("@/hooks/use-wallet-kit", () => ({
  useWalletKit: () => ({
    isReady: true,
    address: mockAddress,
    network: "testnet",
    networkPassphrase: "Test SDF Network ; September 2015",
  }),
}));

const mockPrepareUsdbTrustline = vi.fn();
const mockSubmitUsdbTrustline = vi.fn();

vi.mock("@/lib/api/usdb-funding", () => ({
  prepareUsdbTrustline: (...args: unknown[]) => mockPrepareUsdbTrustline(...args),
  submitUsdbTrustline: (...args: unknown[]) => mockSubmitUsdbTrustline(...args),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const UNSIGNED_XDR = "UNSIGNED_XDR_BLOB";
const SIGNED_XDR = "SIGNED_XDR_BLOB";

beforeEach(() => {
  vi.clearAllMocks();
  mockAddress = "GSELLERADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  mockPrepareUsdbTrustline.mockResolvedValue({ unsignedXdr: UNSIGNED_XDR });
  mockSignTransaction.mockResolvedValue({ signedTxXdr: SIGNED_XDR, signerAddress: mockAddress });
  mockSubmitUsdbTrustline.mockResolvedValue(undefined);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useUsdbFunding — happy path", () => {
  it("walks building -> awaiting_signature -> submitting -> confirmed", async () => {
    const { result } = renderHook(() => useUsdbFunding());

    await act(async () => {
      await result.current.sign();
    });

    expect(result.current.state).toBe("confirmed");
    expect(result.current.error).toBeNull();
  });

  it("signs the exact unsigned XDR the prepare call returned", async () => {
    const { result } = renderHook(() => useUsdbFunding());

    await act(async () => {
      await result.current.sign();
    });

    expect(mockSignTransaction).toHaveBeenCalledWith(
      UNSIGNED_XDR,
      expect.objectContaining({ address: mockAddress })
    );
  });

  it("submits the signed XDR", async () => {
    const { result } = renderHook(() => useUsdbFunding());

    await act(async () => {
      await result.current.sign();
    });

    expect(mockSubmitUsdbTrustline).toHaveBeenCalledWith("jwt-token", SIGNED_XDR);
  });
});

describe("useUsdbFunding — guards", () => {
  it("errors when no wallet is connected", async () => {
    mockAddress = null;
    const { result } = renderHook(() => useUsdbFunding());

    await act(async () => {
      await result.current.sign();
    });

    expect(result.current.error).toMatchObject({ code: "NO_WALLET_CONNECTED" });
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("surfaces a wallet-rejected signature as USER_REJECTED", async () => {
    mockSignTransaction.mockRejectedValue(new Error("User declined access"));
    const { result } = renderHook(() => useUsdbFunding());

    await act(async () => {
      await result.current.sign();
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error?.code).toBe("USER_REJECTED");
    expect(mockSubmitUsdbTrustline).not.toHaveBeenCalled();
  });

  it("surfaces a prepare failure (e.g. custodial wallet, or non-testnet) as an error", async () => {
    mockPrepareUsdbTrustline.mockRejectedValue(
      Object.assign(new Error("This wallet is custodial — no signature is needed"), { status: 409 })
    );
    const { result } = renderHook(() => useUsdbFunding());

    await act(async () => {
      await result.current.sign();
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error?.message).toContain("custodial");
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("reset returns to idle and clears the error", async () => {
    mockAddress = null;
    const { result } = renderHook(() => useUsdbFunding());
    await act(async () => {
      await result.current.sign();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.error).toBeNull();
  });
});
