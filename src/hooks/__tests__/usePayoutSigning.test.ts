import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePayoutSigning } from "../usePayoutSigning";

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

const mockPreparePayoutTransfer = vi.fn();
const mockSubmitPayoutTransfer = vi.fn();

vi.mock("@/lib/api/payout", () => ({
  preparePayoutTransfer: (...args: unknown[]) => mockPreparePayoutTransfer(...args),
  submitPayoutTransfer: (...args: unknown[]) => mockSubmitPayoutTransfer(...args),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDER_ID = "ord_abc123";
const UNSIGNED_XDR = "UNSIGNED_XDR_BLOB";
const SIGNED_XDR = "SIGNED_XDR_BLOB";
const QUOTE_ID = "qu_test123";

function preparedResult(overrides: Record<string, unknown> = {}) {
  return {
    orderId: ORDER_ID,
    payoutId: "pay_1",
    quoteId: QUOTE_ID,
    unsignedXdr: UNSIGNED_XDR,
    expiresAt: Date.now() + 90_000,
    senderWalletAddress: mockAddress,
    usdcAmount: "100.00",
    fiatAmount: "1850.00",
    fiatCurrency: "MXN",
    corridor: "MX/SPEI_BITSO",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAddress = "GSELLERADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  mockPreparePayoutTransfer.mockResolvedValue(preparedResult());
  mockSignTransaction.mockResolvedValue({ signedTxXdr: SIGNED_XDR, signerAddress: mockAddress });
  mockSubmitPayoutTransfer.mockResolvedValue(undefined);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("usePayoutSigning — happy path", () => {
  it("walks building -> awaiting_signature -> submitting -> confirmed", async () => {
    const { result } = renderHook(() => usePayoutSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID);
    });

    expect(result.current.state).toBe("confirmed");
    expect(result.current.error).toBeNull();
  });

  it("exposes the prepared quote so the UI can show the fiat amount and expiry", async () => {
    const { result } = renderHook(() => usePayoutSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID);
    });

    expect(result.current.prepared).toMatchObject({
      quoteId: QUOTE_ID,
      fiatAmount: "1850.00",
      fiatCurrency: "MXN",
    });
  });

  it("signs the exact unsigned XDR the prepare call returned", async () => {
    const { result } = renderHook(() => usePayoutSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID);
    });

    expect(mockSignTransaction).toHaveBeenCalledWith(
      UNSIGNED_XDR,
      expect.objectContaining({ address: mockAddress })
    );
  });

  it("submits with the quote id echoed back, plus a fresh idempotency key", async () => {
    const { result } = renderHook(() => usePayoutSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID);
    });

    expect(mockSubmitPayoutTransfer).toHaveBeenCalledWith(
      "jwt-token",
      ORDER_ID,
      QUOTE_ID,
      SIGNED_XDR,
      expect.any(String)
    );
  });
});

describe("usePayoutSigning — guards", () => {
  it("errors when the quote already expired by the time signing was requested", async () => {
    mockPreparePayoutTransfer.mockResolvedValue(preparedResult({ expiresAt: Date.now() - 1000 }));
    const { result } = renderHook(() => usePayoutSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID);
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatchObject({ code: "XDR_EXPIRED" });
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("errors when no wallet is connected", async () => {
    mockAddress = null;
    const { result } = renderHook(() => usePayoutSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID);
    });

    expect(result.current.error).toMatchObject({ code: "NO_WALLET_CONNECTED" });
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("surfaces a wallet-rejected signature as USER_REJECTED, not a generic failure", async () => {
    mockSignTransaction.mockRejectedValue(new Error("User declined access"));
    const { result } = renderHook(() => usePayoutSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID);
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error?.code).toBe("USER_REJECTED");
    expect(mockSubmitPayoutTransfer).not.toHaveBeenCalled();
  });

  it("does not resubmit while a sign call is already in flight", async () => {
    let resolvePrepare: (value: ReturnType<typeof preparedResult>) => void;
    mockPreparePayoutTransfer.mockReturnValue(
      new Promise((resolve) => {
        resolvePrepare = resolve;
      })
    );
    const { result } = renderHook(() => usePayoutSigning());

    let firstCall!: Promise<void>;
    act(() => {
      firstCall = result.current.sign(ORDER_ID);
      void result.current.sign(ORDER_ID);
    });

    expect(mockPreparePayoutTransfer).toHaveBeenCalledTimes(1);

    resolvePrepare!(preparedResult());
    await act(async () => {
      await firstCall;
    });
  });

  it("reset returns to idle and clears the prepared quote and error", async () => {
    const { result } = renderHook(() => usePayoutSigning());
    await act(async () => {
      await result.current.sign(ORDER_ID);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.prepared).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
