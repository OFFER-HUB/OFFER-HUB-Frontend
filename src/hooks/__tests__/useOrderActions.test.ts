import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrderActions } from "../useOrderActions";
import { SigningCancelledError as RealSigningCancelledError } from "@/hooks/useEscrowSigningAction";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null; user: { id: string } | null }) => unknown) =>
    selector({ token: "jwt-token", user: { id: "usr_buyer" } }),
}));

const mockOpenDispute = vi.fn();

vi.mock("@/lib/api/orders", () => ({
  openDispute: (...args: unknown[]) => mockOpenDispute(...args),
  cancelOrder: vi.fn(),
  markOrderCompleted: vi.fn(),
  reserveFunds: vi.fn(),
}));

vi.mock("@/lib/api/reviews", () => ({
  submitOrderReview: vi.fn(),
  submitReviewResponse: vi.fn(),
}));

// One controllable `run()` mock per instance, plus the callerRole it was given.
// Keys are `"${operation}_${n}"` where n is the call order within an operation
// (e.g. "release_0" = releaseSigning, "release_1" = completeSigning).
// Tests that only care about a single instance of an operation can use
// the bare operation name — "release" resolves to "release_0".
const runByKey: Record<string, ReturnType<typeof vi.fn>> = {};
const callerRoleByKey: Record<string, string> = {};
const callCountByOperation: Record<string, number> = {};

vi.mock("@/hooks/useEscrowSigningAction", () => {
  class MockSigningCancelledError extends Error {
    constructor() {
      super("Signing cancelled");
      this.name = "SigningCancelledError";
    }
  }
  return {
    SigningCancelledError: MockSigningCancelledError,
    currentWalletName: () => null,
    useEscrowSigningAction: ({
      operation,
      callerRole,
    }: {
      operation: string;
      callerRole: string;
    }) => {
      const count = callCountByOperation[operation] ?? 0;
      callCountByOperation[operation] = count + 1;
      const key = `${operation}_${count}`;
      callerRoleByKey[key] = callerRole;
      const run = runByKey[key] ?? (runByKey[key] = vi.fn().mockResolvedValue(undefined));
      return {
        run,
        isSigningModalOpen: false,
        signingState: "idle" as const,
        signingError: null,
        transactionHash: null,
        inlineError: null,
        clearInlineError: vi.fn(),
        isWalletConnectOpen: false,
        closeWalletConnect: vi.fn(),
        onWalletConnected: vi.fn(),
        dismissSigningModal: vi.fn(),
      };
    },
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDER_ID = "ord_abc123";

function setup(overrides: Partial<Parameters<typeof useOrderActions>[0]> = {}) {
  const onOrderChange = vi.fn();
  const refetchOrder = vi.fn().mockResolvedValue(undefined);
  return renderHook(() =>
    useOrderActions({
      orderId: ORDER_ID,
      order: null,
      review: null,
      isBuyer: true,
      onOrderChange,
      onReviewChange: vi.fn(),
      refetchOrder,
      ...overrides,
    })
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(runByKey).forEach((k) => delete runByKey[k]);
  Object.keys(callerRoleByKey).forEach((k) => delete callerRoleByKey[k]);
  Object.keys(callCountByOperation).forEach((k) => delete callCountByOperation[k]);
  mockOpenDispute.mockResolvedValue({ id: "dsp_1" });
});

// Instance key order in useOrderActions (determined by hook call order):
//   "release_0" → releaseSigning (buyer release flow)
//   "dispute_0" → disputeSigning
//   "refund_0"  → refundSigning
//   "release_1" → completeSigning (seller complete_milestone flow)

describe("useOrderActions — handleReleaseFunds", () => {
  it("always goes through releaseSigning.run(), not releaseFunds directly", async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.handleReleaseFunds();
    });

    expect(runByKey["release_0"]).toHaveBeenCalledOnce();
  });

  it("swallows a rejected run() instead of throwing out of the handler", async () => {
    const { result } = setup();
    runByKey["release_0"].mockRejectedValue(new Error("boom"));

    await act(async () => {
      await expect(result.current.handleReleaseFunds()).resolves.toBeUndefined();
    });
  });
});

describe("useOrderActions — handleOpenDispute", () => {
  it("runs the on-chain dispute step before opening the admin record when the caller is the buyer", async () => {
    const { result } = setup({ isBuyer: true });

    await act(async () => {
      await result.current.handleOpenDispute("QUALITY_ISSUE", "Work was incomplete and low quality.");
    });

    expect(runByKey["dispute_0"]).toHaveBeenCalledOnce();
    expect(mockOpenDispute).toHaveBeenCalledWith(
      "jwt-token",
      expect.objectContaining({ orderId: ORDER_ID, openedBy: "BUYER", reason: "QUALITY_ISSUE" })
    );
  });

  it("has the seller sign the on-chain dispute too when the seller opens it (API #326)", async () => {
    const { result } = setup({ isBuyer: false });

    await act(async () => {
      await result.current.handleOpenDispute("OTHER", "Buyer is unresponsive.");
    });

    expect(callerRoleByKey["dispute_0"]).toBe("seller");
    expect(runByKey["dispute_0"]).toHaveBeenCalledOnce();
    expect(mockOpenDispute).toHaveBeenCalledWith(
      "jwt-token",
      expect.objectContaining({ openedBy: "SELLER" })
    );
  });

  it("rethrows with a friendly message and does not open the admin record when signing is cancelled", async () => {
    const { result } = setup({ isBuyer: true });
    runByKey["dispute_0"].mockRejectedValue(new RealSigningCancelledError());

    await expect(
      result.current.handleOpenDispute("OTHER", "Something happened here.")
    ).rejects.toThrow("Signing cancelled — dispute not opened.");

    expect(mockOpenDispute).not.toHaveBeenCalled();
  });

  it("rethrows the real failure message and does not open the admin record on a genuine signing error", async () => {
    const { result } = setup({ isBuyer: true });
    runByKey["dispute_0"].mockRejectedValue(new Error("network exploded"));

    await expect(
      result.current.handleOpenDispute("OTHER", "Something happened here.")
    ).rejects.toThrow("network exploded");

    expect(mockOpenDispute).not.toHaveBeenCalled();
  });
});

describe("useOrderActions — handleRequestRefund", () => {
  it("goes through refundSigning.run() without calling requestRefund directly for the client-signing path", async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.handleRequestRefund("The work was never delivered.");
    });

    expect(runByKey["refund_0"]).toHaveBeenCalledOnce();
  });

  it("swallows a rejected run() instead of throwing out of the handler", async () => {
    const { result } = setup();
    runByKey["refund_0"].mockRejectedValue(new Error("boom"));

    await act(async () => {
      await expect(result.current.handleRequestRefund("reason")).resolves.toBeUndefined();
    });
  });
});

describe("useOrderActions — handleMarkCompleted", () => {
  it("always goes through completeSigning.run(), not markOrderCompleted directly", async () => {
    const { result } = setup();
    const { markOrderCompleted } = await import("@/lib/api/orders");

    await act(async () => {
      await result.current.handleMarkCompleted();
    });

    // completeSigning is the second "release" instance
    expect(runByKey["release_1"]).toHaveBeenCalledOnce();
    expect(markOrderCompleted).not.toHaveBeenCalled();
  });

  it("surfaces a signing error in the error banner without throwing", async () => {
    const { result } = setup();
    runByKey["release_1"].mockRejectedValue(new Error("XDR build failed"));

    await act(async () => {
      await expect(result.current.handleMarkCompleted()).resolves.toBeUndefined();
    });

    expect(result.current.error).toBe("XDR build failed");
  });

  it("swallows a SigningCancelledError without setting the error banner", async () => {
    const { result } = setup();
    runByKey["release_1"].mockRejectedValue(new RealSigningCancelledError());

    await act(async () => {
      await expect(result.current.handleMarkCompleted()).resolves.toBeUndefined();
    });

    expect(result.current.error).toBeNull();
  });
});

// Instance key order with the new signing hooks (operation → key):
//   "create_0" → createSigning
//   "fund_0"   → fundSigning
//   "release_0"→ releaseSigning
//   "dispute_0"→ disputeSigning
//   "refund_0" → refundSigning
//   "release_1"→ completeSigning

describe("useOrderActions — handleCreateEscrow (D2.1)", () => {
  it("always goes through createSigning.run()", async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.handleCreateEscrow();
    });

    expect(runByKey["create_0"]).toHaveBeenCalledOnce();
  });

  it("swallows a rejected run() instead of throwing out of the handler", async () => {
    const { result } = setup();
    runByKey["create_0"].mockRejectedValue(new Error("network error"));

    await act(async () => {
      await expect(result.current.handleCreateEscrow()).resolves.toBeUndefined();
    });
  });

  it("exposes createSigning on the result with the standard UseEscrowSigningActionResult shape", () => {
    const { result } = setup();
    expect(result.current.createSigning).toBeDefined();
    expect(result.current.createSigning.run).toBeInstanceOf(Function);
    expect(result.current.createSigning.isSigningModalOpen).toBe(false);
  });
});

describe("useOrderActions — handleFundEscrow (D2.1)", () => {
  it("always goes through fundSigning.run()", async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.handleFundEscrow();
    });

    expect(runByKey["fund_0"]).toHaveBeenCalledOnce();
  });

  it("swallows a rejected run() instead of throwing out of the handler", async () => {
    const { result } = setup();
    runByKey["fund_0"].mockRejectedValue(new Error("Stellar timeout"));

    await act(async () => {
      await expect(result.current.handleFundEscrow()).resolves.toBeUndefined();
    });
  });

  it("exposes fundSigning on the result with the standard UseEscrowSigningActionResult shape", () => {
    const { result } = setup();
    expect(result.current.fundSigning).toBeDefined();
    expect(result.current.fundSigning.run).toBeInstanceOf(Function);
    expect(result.current.fundSigning.isSigningModalOpen).toBe(false);
  });
});
