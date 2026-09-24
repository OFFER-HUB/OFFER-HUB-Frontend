import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEscrowSigning } from "../useEscrowSigning";

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

vi.mock("@/hooks/use-wallet-kit", () => ({
  useWalletKit: () => ({
    isReady: true,
    address: "GBUYERADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    network: "testnet",
    networkPassphrase: "Test SDF Network ; September 2015",
  }),
}));

const mockPrepareEscrowCreate = vi.fn();
const mockPrepareEscrowFund = vi.fn();
const mockPrepareReleaseStep = vi.fn();
const mockPrepareRefundStep = vi.fn();
const mockPrepareDisputeStep = vi.fn();
const mockSubmitEscrowXdr = vi.fn();

vi.mock("@/lib/api/escrow", () => ({
  prepareEscrowCreate: (...args: unknown[]) => mockPrepareEscrowCreate(...args),
  prepareEscrowFund: (...args: unknown[]) => mockPrepareEscrowFund(...args),
  prepareReleaseStep: (...args: unknown[]) => mockPrepareReleaseStep(...args),
  prepareRefundStep: (...args: unknown[]) => mockPrepareRefundStep(...args),
  prepareDisputeStep: (...args: unknown[]) => mockPrepareDisputeStep(...args),
  submitEscrowXdr: (...args: unknown[]) => mockSubmitEscrowXdr(...args),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDER_ID = "ord_abc123";
const UNSIGNED_XDR = "UNSIGNED_XDR_BLOB";
const SIGNED_XDR = "SIGNED_XDR_BLOB";
const TX_HASH = "tx_hash_123";

function futureExpiry() {
  return Date.now() + 4 * 60 * 1000;
}

function pastExpiry() {
  return Date.now() - 1000;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrepareEscrowCreate.mockResolvedValue({
    unsignedXdr: UNSIGNED_XDR,
    operation: "create",
    expiresAt: futureExpiry(),
    orderId: ORDER_ID,
  });
  mockSignTransaction.mockResolvedValue({ signedTxXdr: SIGNED_XDR, signerAddress: "GBUYER" });
  mockSubmitEscrowXdr.mockResolvedValue({ transactionHash: TX_HASH, order: { id: ORDER_ID } });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useEscrowSigning — happy path", () => {
  it("walks building -> awaiting_signature -> submitting -> confirmed", async () => {
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("confirmed");
    expect(result.current.transactionHash).toBe(TX_HASH);
    expect(result.current.error).toBeNull();
  });

  it("fetches the XDR via the create-specific prepare function", async () => {
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(mockPrepareEscrowCreate).toHaveBeenCalledWith("jwt-token", ORDER_ID);
  });

  it("routes each operation to its own prepare function", async () => {
    mockPrepareReleaseStep.mockResolvedValue({
      orderId: ORDER_ID,
      operation: "release",
      step: "complete_milestone",
      signer: "seller",
      unsignedXdr: UNSIGNED_XDR,
      expiresAt: futureExpiry(),
    });
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "release");
    });

    expect(mockPrepareReleaseStep).toHaveBeenCalledWith("jwt-token", ORDER_ID);
    expect(mockPrepareEscrowCreate).not.toHaveBeenCalled();
  });

  it("signs with the connected wallet's address and network passphrase", async () => {
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(mockSignTransaction).toHaveBeenCalledWith(UNSIGNED_XDR, {
      networkPassphrase: "Test SDF Network ; September 2015",
      address: "GBUYERADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    });
  });

  it("submits the signed XDR with a fresh Idempotency-Key each call", async () => {
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });
    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(mockSubmitEscrowXdr).toHaveBeenCalledTimes(2);
    const [, , , , firstKey] = mockSubmitEscrowXdr.mock.calls[0];
    const [, , , , secondKey] = mockSubmitEscrowXdr.mock.calls[1];
    expect(firstKey).not.toBe(secondKey);
  });
});

describe("useEscrowSigning — a finished step-wise sequence", () => {
  it("treats unsignedXdr: null as confirmed, not an error, and never calls the wallet", async () => {
    mockPrepareReleaseStep.mockResolvedValue({
      orderId: ORDER_ID,
      operation: "release",
      step: null,
      signer: null,
      unsignedXdr: null,
      expiresAt: null,
    });
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "release");
    });

    expect(result.current.state).toBe("confirmed");
    expect(result.current.transactionHash).toBeNull();
    expect(mockSignTransaction).not.toHaveBeenCalled();
    expect(mockSubmitEscrowXdr).not.toHaveBeenCalled();
  });
});

describe("useEscrowSigning — XDR expiry", () => {
  it("errors with XDR_EXPIRED without calling the wallet when expiresAt is in the past", async () => {
    mockPrepareEscrowCreate.mockResolvedValue({
      unsignedXdr: UNSIGNED_XDR,
      operation: "create",
      expiresAt: pastExpiry(),
      orderId: ORDER_ID,
    });
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatchObject({ code: "XDR_EXPIRED" });
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("retrying after expiry fetches a fresh XDR and can succeed", async () => {
    mockPrepareEscrowCreate.mockResolvedValueOnce({
      unsignedXdr: UNSIGNED_XDR,
      operation: "create",
      expiresAt: pastExpiry(),
      orderId: ORDER_ID,
    });
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });
    expect(result.current.state).toBe("error");

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("confirmed");
    expect(mockPrepareEscrowCreate).toHaveBeenCalledTimes(2);
  });
});

describe("useEscrowSigning — wallet rejection", () => {
  it("errors with USER_REJECTED when the wallet extension reports a cancellation", async () => {
    mockSignTransaction.mockRejectedValue(new Error("User declined access"));
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatchObject({ code: "USER_REJECTED" });
    expect(mockSubmitEscrowXdr).not.toHaveBeenCalled();
  });

  it("does not treat a non-cancellation signing failure as USER_REJECTED", async () => {
    mockSignTransaction.mockRejectedValue(new Error("Extension is locked"));
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.error).toMatchObject({ code: "API_ERROR", message: "Extension is locked" });
  });
});

describe("useEscrowSigning — API error", () => {
  it("surfaces a prepare failure as the error state with the backend message", async () => {
    mockPrepareEscrowCreate.mockRejectedValue(
      Object.assign(new Error("Cannot prepare create escrow order in state ORDER_CREATED"), {
        code: "INVALID_STATE",
        status: 400,
      })
    );
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatchObject({
      code: "API_ERROR",
      message: "Cannot prepare create escrow order in state ORDER_CREATED",
    });
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("surfaces a submit failure as the error state without retrying on its own", async () => {
    mockSubmitEscrowXdr.mockRejectedValue(new Error("signedXdr is not a valid Stellar transaction envelope"));
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.transactionHash).toBeNull();
  });
});

describe("useEscrowSigning — double-submit guard", () => {
  it("ignores a concurrent second call while one is in flight", async () => {
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await Promise.all([result.current.sign(ORDER_ID, "create"), result.current.sign(ORDER_ID, "create")]);
    });

    expect(mockPrepareEscrowCreate).toHaveBeenCalledOnce();
  });
});

describe("useEscrowSigning — reset", () => {
  it("clears state, error, and transactionHash back to idle", async () => {
    mockSignTransaction.mockRejectedValue(new Error("User declined access"));
    const { result } = renderHook(() => useEscrowSigning());

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });
    expect(result.current.state).toBe("error");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.error).toBeNull();
    expect(result.current.transactionHash).toBeNull();
  });
});
