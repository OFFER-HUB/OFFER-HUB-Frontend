import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEscrowSigningAction, SigningCancelledError } from "../useEscrowSigningAction";

// ── Mocks ─────────────────────────────────────────────────────────────────────

let mockUser: { wallet?: { type: string } } | null = { wallet: { type: "EXTERNAL" } };
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { user: typeof mockUser }) => unknown) => selector({ user: mockUser }),
}));

let mockLiveWalletAddress: string | null = "GBUYERADDRESS";
vi.mock("@/hooks/use-wallet-kit", () => ({
  useWalletKit: () => ({ address: mockLiveWalletAddress }),
}));

const mockSign = vi.fn();
const mockReset = vi.fn();
let mockSigningState: "idle" | "building" | "awaiting_signature" | "submitting" | "confirmed" | "error" = "idle";
let mockSigningError: { code: string; message: string } | null = null;

vi.mock("@/hooks/useEscrowSigning", () => ({
  useEscrowSigning: () => ({
    state: mockSigningState,
    sign: mockSign,
    reset: mockReset,
    transactionHash: null,
    error: mockSigningError,
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDER_ID = "ord_abc123";

function setSigningState(state: typeof mockSigningState, error: typeof mockSigningError = null) {
  mockSigningState = state;
  mockSigningError = error;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUser = { wallet: { type: "EXTERNAL" } };
  mockLiveWalletAddress = "GBUYERADDRESS";
  setSigningState("idle");
});

describe("useEscrowSigningAction — INVISIBLE wallet (legacy path)", () => {
  it("calls legacyAction and never touches useEscrowSigning", async () => {
    mockUser = { wallet: { type: "INVISIBLE" } };
    const legacyAction = vi.fn().mockResolvedValue(undefined);
    const onConfirmed = vi.fn();

    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction, onConfirmed })
    );

    await act(async () => {
      await result.current.run();
    });

    expect(legacyAction).toHaveBeenCalledOnce();
    expect(mockSign).not.toHaveBeenCalled();
    expect(onConfirmed).not.toHaveBeenCalled();
  });

  it("also uses the legacy path when there is no wallet at all", async () => {
    mockUser = null;
    const legacyAction = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction, onConfirmed: vi.fn() })
    );

    await act(async () => {
      await result.current.run();
    });

    expect(legacyAction).toHaveBeenCalledOnce();
  });
});

describe("useEscrowSigningAction — EXTERNAL wallet, connected", () => {
  it("calls sign() with the fixed operation and never the legacy action", async () => {
    const legacyAction = vi.fn();
    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "refund",
      callerRole: "buyer", legacyAction, onConfirmed: vi.fn() })
    );

    await act(async () => {
      void result.current.run();
    });

    expect(mockSign).toHaveBeenCalledWith(ORDER_ID, "refund", "buyer");
    expect(legacyAction).not.toHaveBeenCalled();
  });

  it("reports isSigningModalOpen for every in-flight and terminal state, only false when idle", () => {
    const { result, rerender } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed: vi.fn() })
    );
    expect(result.current.isSigningModalOpen).toBe(false);

    setSigningState("building");
    rerender();
    expect(result.current.isSigningModalOpen).toBe(true);

    setSigningState("awaiting_signature");
    rerender();
    expect(result.current.isSigningModalOpen).toBe(true);

    setSigningState("submitting");
    rerender();
    expect(result.current.isSigningModalOpen).toBe(true);

    // confirmed/error stay open too — EscrowSigningModal owns its own
    // confirmed/error screens (transaction hash + Done, error copy +
    // Retry/Cancel), and closing here the instant either is reached used to
    // make those screens unreachable in practice (see dismissSigningModal).
    setSigningState("confirmed");
    rerender();
    expect(result.current.isSigningModalOpen).toBe(true);

    setSigningState("error", { code: "USER_REJECTED", message: "rejected" });
    rerender();
    expect(result.current.isSigningModalOpen).toBe(true);
  });

  it("calls onConfirmed and resolves run() when the state transitions to confirmed, without resetting on its own", async () => {
    const onConfirmed = vi.fn();
    const { result, rerender } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed })
    );

    let runPromise!: Promise<void>;
    act(() => {
      runPromise = result.current.run();
    });

    setSigningState("confirmed");
    rerender();

    await expect(runPromise).resolves.toBeUndefined();
    expect(onConfirmed).toHaveBeenCalledOnce();
    // The modal (via isSigningModalOpen) stays open on its own confirmed
    // screen until the user dismisses it — reset must wait for that.
    expect(mockReset).not.toHaveBeenCalled();
    expect(result.current.isSigningModalOpen).toBe(true);
  });

  it("dismissSigningModal() is what actually resets signing back to idle", () => {
    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed: vi.fn() })
    );

    act(() => {
      result.current.dismissSigningModal();
    });

    expect(mockReset).toHaveBeenCalledOnce();
  });

  it("passes signingError and transactionHash straight through from useEscrowSigning", () => {
    setSigningState("error", { code: "XDR_EXPIRED", message: "expired" });
    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed: vi.fn() })
    );

    expect(result.current.signingError).toEqual({ code: "XDR_EXPIRED", message: "expired" });
    expect(result.current.transactionHash).toBeNull();
  });

  it("sets inlineError and rejects run() when the state transitions to error", async () => {
    const { result, rerender } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed: vi.fn() })
    );

    let runPromise!: Promise<void>;
    act(() => {
      runPromise = result.current.run();
    });

    setSigningState("error", { code: "USER_REJECTED", message: "You declined the signature request in your wallet." });
    rerender();

    await expect(runPromise).rejects.toThrow("You declined the signature request in your wallet.");
    expect(result.current.inlineError).toBe("You declined the signature request in your wallet.");
  });

  it("clearInlineError resets inlineError to null", () => {
    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed: vi.fn() })
    );

    act(() => {
      result.current.clearInlineError();
    });

    expect(result.current.inlineError).toBeNull();
  });
});

describe("useEscrowSigningAction — EXTERNAL wallet, not connected", () => {
  it("opens the wallet-connect guard instead of calling sign()", async () => {
    mockLiveWalletAddress = null;
    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed: vi.fn() })
    );

    act(() => {
      void result.current.run();
    });

    await waitFor(() => expect(result.current.isWalletConnectOpen).toBe(true));
    expect(mockSign).not.toHaveBeenCalled();
  });

  it("resumes signing once onWalletConnected fires, without re-checking the (stale) address", async () => {
    mockLiveWalletAddress = null;
    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "dispute",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed: vi.fn() })
    );

    act(() => {
      void result.current.run();
    });
    await waitFor(() => expect(result.current.isWalletConnectOpen).toBe(true));

    act(() => {
      result.current.onWalletConnected();
    });

    expect(result.current.isWalletConnectOpen).toBe(false);
    expect(mockSign).toHaveBeenCalledWith(ORDER_ID, "dispute", "buyer");
  });

  it("closeWalletConnect rejects the pending run() with SigningCancelledError", async () => {
    mockLiveWalletAddress = null;
    const { result } = renderHook(() =>
      useEscrowSigningAction({ orderId: ORDER_ID, operation: "release",
      callerRole: "buyer", legacyAction: vi.fn(), onConfirmed: vi.fn() })
    );

    let runPromise!: Promise<void>;
    act(() => {
      runPromise = result.current.run();
    });
    await waitFor(() => expect(result.current.isWalletConnectOpen).toBe(true));

    act(() => {
      result.current.closeWalletConnect();
    });

    await expect(runPromise).rejects.toBeInstanceOf(SigningCancelledError);
    expect(result.current.isWalletConnectOpen).toBe(false);
    expect(mockSign).not.toHaveBeenCalled();
  });
});
