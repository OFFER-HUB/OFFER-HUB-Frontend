import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EscrowSigningModal } from "../EscrowSigningModal";
import type { EscrowSigningError, EscrowSigningState } from "@/hooks/useEscrowSigning";

const onRetry = vi.fn();
const onClose = vi.fn();

const TX_HASH = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4";

function setup(overrides: {
  state?: EscrowSigningState;
  error?: EscrowSigningError | null;
  transactionHash?: string | null;
  walletName?: string | null;
  operation?: import("@/lib/api/escrow").EscrowOperation;
  step?: import("@/lib/api/escrow").EscrowStepName | null;
} = {}) {
  return render(
    <EscrowSigningModal
      isOpen
      state={overrides.state ?? "building"}
      error={overrides.error ?? null}
      transactionHash={overrides.transactionHash ?? null}
      walletName={overrides.walletName}
      operation={overrides.operation}
      step={overrides.step}
      onRetry={onRetry}
      onClose={onClose}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
});

describe("EscrowSigningModal — visibility", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <EscrowSigningModal
        isOpen={false}
        state="building"
        error={null}
        transactionHash={null}
        onRetry={onRetry}
        onClose={onClose}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes role=dialog and aria-modal", () => {
    setup();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});

describe("EscrowSigningModal — building", () => {
  it("shows the preparing message", () => {
    setup({ state: "building" });
    expect(screen.getByText("Preparing transaction…")).toBeInTheDocument();
  });

  it("can be closed", async () => {
    setup({ state: "building" });
    // Both the backdrop and the header X share the accessible name "Close";
    // the header button renders second in DOM order.
    const [, headerClose] = screen.getAllByLabelText("Close");
    await userEvent.click(headerClose);
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("EscrowSigningModal — awaiting_signature", () => {
  it("shows the wallet-check message", () => {
    setup({ state: "awaiting_signature" });
    expect(screen.getByText(/check your wallet extension to sign/i)).toBeInTheDocument();
  });

  it("includes the wallet name when known", () => {
    setup({ state: "awaiting_signature", walletName: "Freighter" });
    expect(screen.getByText(/\(Freighter\)/)).toBeInTheDocument();
  });

  it("displays smart contract authorization context and security reassurance", () => {
    setup({
      state: "awaiting_signature",
      operation: "release",
      step: "approve_milestone",
    });
    expect(screen.getByText(/Approve Delivery \(Milestone Review\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-custodial escrow: only this specific on-chain action is authorized/i)).toBeInTheDocument();
  });

  it("hides the header close button and cannot be dismissed via backdrop or Escape", async () => {
    setup({ state: "awaiting_signature" });

    // Only the (disabled) backdrop button remains — the header X is gone.
    const closeButtons = screen.getAllByLabelText("Close");
    expect(closeButtons).toHaveLength(1);
    expect(closeButtons[0]).toBeDisabled();

    await userEvent.click(closeButtons[0]);
    await userEvent.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("EscrowSigningModal — submitting", () => {
  it("shows the submitting message and blocks dismissal", async () => {
    setup({ state: "submitting" });
    expect(screen.getByText("Submitting to Stellar…")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("EscrowSigningModal — confirmed", () => {
  it("shows the truncated transaction hash and a Done button", async () => {
    setup({ state: "confirmed", transactionHash: TX_HASH });

    expect(screen.getByText(`${TX_HASH.slice(0, 8)}…${TX_HASH.slice(-8)}`)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /done/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders a link to view transaction on Stellar Expert", () => {
    setup({ state: "confirmed", transactionHash: TX_HASH });

    const explorerLink = screen.getByTitle("View transaction on Stellar Expert");
    expect(explorerLink).toHaveAttribute("href", expect.stringContaining(`/tx/${TX_HASH}`));
    expect(explorerLink).toHaveAttribute("target", "_blank");
    expect(explorerLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders 2-step progress visual when approving milestone for release", () => {
    setup({
      state: "confirmed",
      transactionHash: TX_HASH,
      operation: "release",
      step: "approve_milestone",
    });

    expect(screen.getByText(/2-Step Release Flow: Action Needed Next/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1: Done/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2: Next/i)).toBeInTheDocument();
  });

  it("copies the full hash to the clipboard", async () => {
    setup({ state: "confirmed", transactionHash: TX_HASH });

    await userEvent.click(screen.getByRole("button", { name: /copy transaction hash/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(TX_HASH);
  });

  it("can be dismissed normally (not a blocking state)", async () => {
    setup({ state: "confirmed", transactionHash: TX_HASH });
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("EscrowSigningModal — error states", () => {
  it("USER_REJECTED shows the cancellation copy with Retry and Cancel", async () => {
    setup({ state: "error", error: { code: "USER_REJECTED", message: "declined" } });

    expect(screen.getByText(/you cancelled the signing\. try again\?/i)).toBeInTheDocument();
    expect(screen.getByText(/No funds were moved and no smart contract state was altered/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("XDR_EXPIRED shows the expiry copy with only a Retry button", () => {
    setup({ state: "error", error: { code: "XDR_EXPIRED", message: "expired" } });

    expect(screen.getByText(/transaction expired\. please try again\./i)).toBeInTheDocument();
    expect(screen.getByText(/Soroban transactions expire after 4 minutes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });

  it("a generic API error shows its own message with Retry and Cancel", () => {
    setup({
      state: "error",
      error: { code: "API_ERROR", message: "Cannot prepare create escrow order in state ORDER_CREATED" },
    });

    expect(
      screen.getByText("Cannot prepare create escrow order in state ORDER_CREATED")
    ).toBeInTheDocument();
    expect(screen.getByText(/ensure your wallet has enough XLM/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("an error state is not blocking — Escape still closes it", async () => {
    setup({ state: "error", error: { code: "API_ERROR", message: "failed" } });
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("EscrowSigningModal — focus trap", () => {
  it("wraps Tab from the last focusable element back to the first", async () => {
    setup({ state: "error", error: { code: "API_ERROR", message: "failed" } });

    const retryButton = screen.getByRole("button", { name: /retry/i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    cancelButton.focus();
    expect(document.activeElement).toBe(cancelButton);

    await userEvent.tab();

    expect(document.activeElement).not.toBe(document.body);
    // Wrapped back inside the dialog rather than escaping to the page.
    expect(retryButton.closest('[role="dialog"]')?.contains(document.activeElement)).toBe(true);
  });
});
