import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStellarEscrowSigning } from "../use-stellar-escrow-signing";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockSignTransaction = vi.fn();

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {
    signTransaction: (...args: unknown[]) => mockSignTransaction(...args),
  },
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

const mockPrepareCreate = vi.fn();
const mockPrepareFund = vi.fn();
const mockPrepareRelease = vi.fn();
const mockPrepareRefund = vi.fn();
const mockPrepareDispute = vi.fn();
const mockSubmit = vi.fn();

function createConfig() {
  return {
    token: "jwt-token",
    wallet: {
      address: "GBUYERADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      networkPassphrase: "Test SDF Network ; September 2015",
    },
    prepareCreate: mockPrepareCreate,
    prepareFund: mockPrepareFund,
    prepareRelease: mockPrepareRelease,
    prepareRefund: mockPrepareRefund,
    prepareDispute: mockPrepareDispute,
    submit: mockSubmit,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrepareCreate.mockResolvedValue({
    unsignedXdr: UNSIGNED_XDR,
    operation: "create",
    expiresAt: futureExpiry(),
    orderId: ORDER_ID,
  });
  mockSignTransaction.mockResolvedValue({ signedTxXdr: SIGNED_XDR, signerAddress: "GBUYER" });
  mockSubmit.mockResolvedValue({ transactionHash: TX_HASH, order: { id: ORDER_ID } });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useStellarEscrowSigning — happy path", () => {
  it("walks building -> awaiting_signature -> submitting -> confirmed", async () => {
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("confirmed");
    expect(result.current.transactionHash).toBe(TX_HASH);
    expect(result.current.error).toBeNull();
  });

  it("fetches the XDR via the create-specific prepare function", async () => {
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(mockPrepareCreate).toHaveBeenCalledWith("jwt-token", ORDER_ID);
  });

  it("routes each operation to its own prepare function", async () => {
    mockPrepareRelease.mockResolvedValue({
      orderId: ORDER_ID,
      operation: "release",
      step: "complete_milestone",
      signer: "seller",
      unsignedXdr: UNSIGNED_XDR,
      expiresAt: futureExpiry(),
    });
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "release");
    });

    expect(mockPrepareRelease).toHaveBeenCalledWith("jwt-token", ORDER_ID);
    expect(mockPrepareCreate).not.toHaveBeenCalled();
  });

  it("signs with the connected wallet's address and network passphrase", async () => {
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(mockSignTransaction).toHaveBeenCalledWith(UNSIGNED_XDR, {
      networkPassphrase: "Test SDF Network ; September 2015",
      address: "GBUYERADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    });
  });

  it("submits the signed XDR with a fresh Idempotency-Key each call", async () => {
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });
    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(mockSubmit).toHaveBeenCalledTimes(2);
    const [, , , , firstKey] = mockSubmit.mock.calls[0];
    const [, , , , secondKey] = mockSubmit.mock.calls[1];
    expect(firstKey).not.toBe(secondKey);
  });
});

describe("useStellarEscrowSigning — a finished step-wise sequence", () => {
  it("treats unsignedXdr: null as confirmed, not an error, and never calls the wallet", async () => {
    mockPrepareRelease.mockResolvedValue({
      orderId: ORDER_ID,
      operation: "release",
      step: null,
      signer: null,
      unsignedXdr: null,
      expiresAt: null,
    });
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "release");
    });

    expect(result.current.state).toBe("confirmed");
    expect(result.current.transactionHash).toBeNull();
    expect(mockSignTransaction).not.toHaveBeenCalled();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

describe("useStellarEscrowSigning — XDR expiry", () => {
  it("errors with XDR_EXPIRED without calling the wallet when expiresAt is in the past", async () => {
    mockPrepareCreate.mockResolvedValue({
      unsignedXdr: UNSIGNED_XDR,
      operation: "create",
      expiresAt: pastExpiry(),
      orderId: ORDER_ID,
    });
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatchObject({ code: "XDR_EXPIRED" });
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("retrying after expiry fetches a fresh XDR and can succeed", async () => {
    mockPrepareCreate.mockResolvedValueOnce({
      unsignedXdr: UNSIGNED_XDR,
      operation: "create",
      expiresAt: pastExpiry(),
      orderId: ORDER_ID,
    });
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });
    expect(result.current.state).toBe("error");

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("confirmed");
    expect(mockPrepareCreate).toHaveBeenCalledTimes(2);
  });
});

describe("useStellarEscrowSigning — wallet rejection", () => {
  it("errors with USER_REJECTED when the wallet extension reports a cancellation", async () => {
    mockSignTransaction.mockRejectedValue(new Error("User declined access"));
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatchObject({ code: "USER_REJECTED" });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("does not treat a non-cancellation signing failure as USER_REJECTED", async () => {
    mockSignTransaction.mockRejectedValue(new Error("Extension is locked"));
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.error).toMatchObject({
      code: "API_ERROR",
      message: "Extension is locked",
    });
  });
});

describe("useStellarEscrowSigning — API error", () => {
  it("surfaces a prepare failure as the error state with the backend message", async () => {
    mockPrepareCreate.mockRejectedValue(
      Object.assign(new Error("Cannot prepare create escrow order in state ORDER_CREATED"), {
        code: "INVALID_STATE",
        status: 400,
      })
    );
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

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
    mockSubmit.mockRejectedValue(
      new Error("signedXdr is not a valid Stellar transaction envelope")
    );
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.transactionHash).toBeNull();
  });
});

describe("useStellarEscrowSigning — double-submit guard", () => {
  it("ignores a concurrent second call while one is in flight", async () => {
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await Promise.all([
        result.current.sign(ORDER_ID, "create"),
        result.current.sign(ORDER_ID, "create"),
      ]);
    });

    expect(mockPrepareCreate).toHaveBeenCalledOnce();
  });
});

describe("useStellarEscrowSigning — reset", () => {
  it("clears state, error, and transactionHash back to idle", async () => {
    mockSignTransaction.mockRejectedValue(new Error("User declined access"));
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

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

describe("useStellarEscrowSigning — wrong signer check", () => {
  it("errors with WRONG_SIGNER when callerRole does not match the required signer", async () => {
    mockPrepareRelease.mockResolvedValue({
      orderId: ORDER_ID,
      operation: "release",
      step: "complete_milestone",
      signer: "seller",
      unsignedXdr: UNSIGNED_XDR,
      expiresAt: futureExpiry(),
    });
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "release", "buyer");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatchObject({ code: "WRONG_SIGNER" });
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("allows signing when callerRole matches the required signer", async () => {
    mockPrepareRelease.mockResolvedValue({
      orderId: ORDER_ID,
      operation: "release",
      step: "complete_milestone",
      signer: "seller",
      unsignedXdr: UNSIGNED_XDR,
      expiresAt: futureExpiry(),
    });
    const { result } = renderHook(() => useStellarEscrowSigning(createConfig()));

    await act(async () => {
      await result.current.sign(ORDER_ID, "release", "seller");
    });

    expect(result.current.state).toBe("confirmed");
    expect(mockSignTransaction).toHaveBeenCalled();
  });
});

describe("useStellarEscrowSigning — no wallet connected", () => {
  it("errors with NO_WALLET_CONNECTED when wallet address is null", async () => {
    const config = createConfig();
    config.wallet.address = null;
    const { result } = renderHook(() => useStellarEscrowSigning(config));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatchObject({ code: "NO_WALLET_CONNECTED" });
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });
});

describe("useStellarEscrowSigning — no token", () => {
  it("does nothing when token is null", async () => {
    const config = createConfig();
    config.token = null;
    const { result } = renderHook(() => useStellarEscrowSigning(config));

    await act(async () => {
      await result.current.sign(ORDER_ID, "create");
    });

    expect(result.current.state).toBe("idle");
    expect(mockPrepareCreate).not.toHaveBeenCalled();
  });
});
