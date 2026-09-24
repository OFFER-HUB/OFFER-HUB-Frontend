import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrderActions } from "../useOrderActions";
import { SigningCancelledError as RealSigningCancelledError } from "@/hooks/useEscrowSigningAction";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null; user: { id: string } | null }) => unknown) =>
    selector({ token: "jwt-token", user: { id: "usr_buyer" } }),
}));

const mockReleaseFunds = vi.fn();
const mockOpenDispute = vi.fn();
const mockRequestRefund = vi.fn();

vi.mock("@/lib/api/orders", () => ({
  releaseFunds: (...args: unknown[]) => mockReleaseFunds(...args),
  openDispute: (...args: unknown[]) => mockOpenDispute(...args),
  requestRefund: (...args: unknown[]) => mockRequestRefund(...args),
  cancelOrder: vi.fn(),
  createEscrow: vi.fn(),
  fundEscrow: vi.fn(),
  markOrderCompleted: vi.fn(),
  reserveFunds: vi.fn(),
}));

vi.mock("@/lib/api/reviews", () => ({
  submitOrderReview: vi.fn(),
  submitReviewResponse: vi.fn(),
}));

// One controllable `run()` mock and its real `legacyAction` per instance.
// Keys are `"${operation}_${n}"` where n is the call order within an operation
// (e.g. "release_0" = releaseSigning, "release_1" = completeSigning).
// Tests that only care about a single instance of an operation can use
// the bare operation name — "release" resolves to "release_0".
const runByKey: Record<string, ReturnType<typeof vi.fn>> = {};
const legacyActionByKey: Record<string, () => Promise<void>> = {};
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
      legacyAction,
    }: {
      operation: string;
      legacyAction: () => Promise<void>;
    }) => {
      const count = callCountByOperation[operation] ?? 0;
      callCountByOperation[operation] = count + 1;
      const key = `${operation}_${count}`;
      legacyActionByKey[key] = legacyAction;
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

/**
 * Makes an instance's `run()` behave like an INVISIBLE wallet: call the real legacy action.
 * Key format: `"${operation}_${n}"`, e.g. "release_0" for releaseSigning, "release_1" for completeSigning.
 */
function useLegacyPath(key: string) {
  runByKey[key].mockImplementation(() => legacyActionByKey[key]());
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(runByKey).forEach((k) => delete runByKey[k]);
  Object.keys(legacyActionByKey).forEach((k) => delete legacyActionByKey[k]);
  Object.keys(callCountByOperation).forEach((k) => delete callCountByOperation[k]);
  mockReleaseFunds.mockResolvedValue({ id: ORDER_ID, status: "CLOSED" });
  mockOpenDispute.mockResolvedValue({ id: "dsp_1" });
  mockRequestRefund.mockResolvedValue({ id: ORDER_ID, status: "CLOSED" });
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
    expect(mockReleaseFunds).not.toHaveBeenCalled();
  });

  it("still reaches the legacy releaseFunds call for an INVISIBLE wallet", async () => {
    const { result } = setup();
    useLegacyPath("release_0");

    await act(async () => {
      await result.current.handleReleaseFunds();
    });

    expect(mockReleaseFunds).toHaveBeenCalledWith("jwt-token", ORDER_ID);
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

  it("skips the on-chain dispute step entirely when the caller is the seller", async () => {
    const { result } = setup({ isBuyer: false });

    await act(async () => {
      await result.current.handleOpenDispute("OTHER", "Buyer is unresponsive.");
    });

    expect(runByKey["dispute_0"]).not.toHaveBeenCalled();
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
  it("threads the reason through to the legacy call for an INVISIBLE wallet", async () => {
    const { result } = setup();
    useLegacyPath("refund_0");

    await act(async () => {
      await result.current.handleRequestRefund("The work was never delivered.");
    });

    expect(runByKey["refund_0"]).toHaveBeenCalledOnce();
    expect(mockRequestRefund).toHaveBeenCalledWith("jwt-token", ORDER_ID, "The work was never delivered.");
  });

  it("goes through refundSigning.run() without calling requestRefund directly for the client-signing path", async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.handleRequestRefund("The work was never delivered.");
    });

    expect(runByKey["refund_0"]).toHaveBeenCalledOnce();
    expect(mockRequestRefund).not.toHaveBeenCalled();
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

  it("calls markOrderCompleted for an INVISIBLE-wallet seller (legacy path)", async () => {
    const { result } = setup();
    const { markOrderCompleted } = await import("@/lib/api/orders");
    (markOrderCompleted as ReturnType<typeof vi.fn>).mockResolvedValue({ id: ORDER_ID, status: "IN_PROGRESS" });
    useLegacyPath("release_1");

    await act(async () => {
      await result.current.handleMarkCompleted();
    });

    expect(markOrderCompleted).toHaveBeenCalledWith("jwt-token", ORDER_ID);
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
  it("always goes through createSigning.run(), not createEscrow directly", async () => {
    const { result } = setup();
    const { createEscrow } = await import("@/lib/api/orders");

    await act(async () => {
      await result.current.handleCreateEscrow();
    });

    expect(runByKey["create_0"]).toHaveBeenCalledOnce();
    expect(createEscrow).not.toHaveBeenCalled();
  });

  it("reaches the custodial createEscrow call for an INVISIBLE wallet (legacy path)", async () => {
    const { result } = setup();
    const { createEscrow } = await import("@/lib/api/orders");
    (createEscrow as ReturnType<typeof vi.fn>).mockResolvedValue({ id: ORDER_ID, status: "ESCROW_CREATING" });
    useLegacyPath("create_0");

    await act(async () => {
      await result.current.handleCreateEscrow();
    });

    expect(createEscrow).toHaveBeenCalledWith("jwt-token", ORDER_ID);
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
  it("always goes through fundSigning.run(), not fundEscrow directly", async () => {
    const { result } = setup();
    const { fundEscrow } = await import("@/lib/api/orders");

    await act(async () => {
      await result.current.handleFundEscrow();
    });

    expect(runByKey["fund_0"]).toHaveBeenCalledOnce();
    expect(fundEscrow).not.toHaveBeenCalled();
  });

  it("reaches the custodial fundEscrow call for an INVISIBLE wallet (legacy path)", async () => {
    const { result } = setup();
    const { fundEscrow } = await import("@/lib/api/orders");
    (fundEscrow as ReturnType<typeof vi.fn>).mockResolvedValue({ id: ORDER_ID, status: "ESCROW_FUNDED" });
    useLegacyPath("fund_0");

    await act(async () => {
      await result.current.handleFundEscrow();
    });

    expect(fundEscrow).toHaveBeenCalledWith("jwt-token", ORDER_ID);
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
