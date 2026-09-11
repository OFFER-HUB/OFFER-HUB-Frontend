import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuyerActionPanel } from "@/components/orders/BuyerActionPanel";

const noop = () => {};

const BASE_PROPS = {
  isWorkCompleted: false,
  isProcessing: false,
  onConfirmOrder: noop,
  onCancelOrder: noop,
  onStartSecurePayment: noop,
  onSignFundEscrow: noop,
  onRequestRelease: noop,
  onRequestDispute: noop,
  onRequestRefund: noop,
};

// ── ORDER_CREATED ─────────────────────────────────────────────────────────────

describe("BuyerActionPanel — ORDER_CREATED (custodial)", () => {
  it("shows 'Confirm Order' and not 'Lock Funds in Escrow'", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="ORDER_CREATED" />);
    expect(screen.getByRole("button", { name: /confirm order/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /lock funds/i })).toBeNull();
  });

  it("calls onConfirmOrder when 'Confirm Order' is clicked", async () => {
    const onConfirmOrder = vi.fn();
    render(<BuyerActionPanel {...BASE_PROPS} status="ORDER_CREATED" onConfirmOrder={onConfirmOrder} />);
    await userEvent.click(screen.getByRole("button", { name: /confirm order/i }));
    expect(onConfirmOrder).toHaveBeenCalledOnce();
  });

  it("shows 'Cancel Order' button", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="ORDER_CREATED" />);
    expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument();
  });
});

describe("BuyerActionPanel — ORDER_CREATED (external wallet / non-custodial)", () => {
  it("shows 'Lock Funds in Escrow' and not 'Confirm Order'", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="ORDER_CREATED" isExternalWallet />);
    expect(screen.getByRole("button", { name: /lock funds in escrow/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /confirm order/i })).toBeNull();
  });

  it("calls onStartSecurePayment (not onConfirmOrder) when clicked", async () => {
    const onStartSecurePayment = vi.fn();
    const onConfirmOrder = vi.fn();
    render(
      <BuyerActionPanel
        {...BASE_PROPS}
        status="ORDER_CREATED"
        isExternalWallet
        onStartSecurePayment={onStartSecurePayment}
        onConfirmOrder={onConfirmOrder}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /lock funds in escrow/i }));
    expect(onStartSecurePayment).toHaveBeenCalledOnce();
    expect(onConfirmOrder).not.toHaveBeenCalled();
  });

  it("still shows 'Cancel Order' button", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="ORDER_CREATED" isExternalWallet />);
    expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument();
  });
});

// ── FUNDS_RESERVED ────────────────────────────────────────────────────────────

describe("BuyerActionPanel — FUNDS_RESERVED", () => {
  it("shows 'Start Secure Payment'", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="FUNDS_RESERVED" />);
    expect(screen.getByRole("button", { name: /start secure payment/i })).toBeInTheDocument();
  });
});

// ── ESCROW_CREATING ───────────────────────────────────────────────────────────

describe("BuyerActionPanel — ESCROW_CREATING", () => {
  it("shows a processing message and no action button", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="ESCROW_CREATING" />);
    expect(screen.getByText(/creating escrow contract/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign/i })).toBeNull();
  });
});

// ── ESCROW_FUNDING ────────────────────────────────────────────────────────────

describe("BuyerActionPanel — ESCROW_FUNDING (custodial)", () => {
  it("shows a processing spinner and no action button", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="ESCROW_FUNDING" />);
    expect(screen.getByText(/funding escrow/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign fund/i })).toBeNull();
  });
});

describe("BuyerActionPanel — ESCROW_FUNDING (external wallet / non-custodial)", () => {
  it("shows 'Sign Fund Transaction' button", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="ESCROW_FUNDING" isExternalWallet />);
    expect(screen.getByRole("button", { name: /sign fund transaction/i })).toBeInTheDocument();
  });

  it("calls onSignFundEscrow when clicked", async () => {
    const onSignFundEscrow = vi.fn();
    render(
      <BuyerActionPanel {...BASE_PROPS} status="ESCROW_FUNDING" isExternalWallet onSignFundEscrow={onSignFundEscrow} />
    );
    await userEvent.click(screen.getByRole("button", { name: /sign fund transaction/i }));
    expect(onSignFundEscrow).toHaveBeenCalledOnce();
  });

  it("disables the button while isProcessing is true", () => {
    render(
      <BuyerActionPanel
        {...BASE_PROPS}
        status="ESCROW_FUNDING"
        isExternalWallet
        isProcessing
      />
    );
    expect(screen.getByRole("button", { name: /sign fund transaction|processing/i })).toBeDisabled();
  });
});

// ── IN_PROGRESS ───────────────────────────────────────────────────────────────

describe("BuyerActionPanel — IN_PROGRESS (nothing delivered yet)", () => {
  it("offers Release / Request Refund / Open Dispute as equal quick actions", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="IN_PROGRESS" />);
    expect(screen.getByRole("button", { name: /release funds/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request refund/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open dispute/i })).toBeInTheDocument();
    expect(screen.getByText(/payment secured in escrow/i)).toBeInTheDocument();
  });

  it("calls onRequestRefund directly — pre-delivery refund stays low-friction", async () => {
    const onRequestRefund = vi.fn();
    render(<BuyerActionPanel {...BASE_PROPS} status="IN_PROGRESS" onRequestRefund={onRequestRefund} />);
    await userEvent.click(screen.getByRole("button", { name: /request refund/i }));
    expect(onRequestRefund).toHaveBeenCalledTimes(1);
  });

  it("drops the one-click refund once a milestone is completed (backend would answer REFUND_REQUIRES_DISPUTE)", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="IN_PROGRESS" refundRequiresDispute />);
    expect(screen.queryByRole("button", { name: /request refund/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /release funds/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open dispute/i })).toBeInTheDocument();
    expect(screen.getByText(/milestone has already been completed/i)).toBeInTheDocument();
  });
});

describe("BuyerActionPanel — DELIVERED", () => {
  it("keeps Release Funds as the direct action and removes Request Refund", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="DELIVERED" amount="150" />);
    expect(screen.getByRole("button", { name: /release funds · \$150\.00 usd/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /request refund/i })).not.toBeInTheDocument();
    expect(screen.getByText(/deliverables ready for review/i)).toBeInTheDocument();
  });

  it("still lets the buyer escalate through Open Dispute", async () => {
    const onRequestDispute = vi.fn();
    render(<BuyerActionPanel {...BASE_PROPS} status="DELIVERED" onRequestDispute={onRequestDispute} />);
    await userEvent.click(screen.getByRole("button", { name: /open dispute/i }));
    expect(onRequestDispute).toHaveBeenCalledTimes(1);
  });

  it("explains that refunds on delivered work go through a dispute", () => {
    render(<BuyerActionPanel {...BASE_PROPS} status="DELIVERED" />);
    expect(screen.getByText(/refunds on delivered work are decided through a dispute/i)).toBeInTheDocument();
  });

  it("calls onRequestRelease when Release Funds is clicked", async () => {
    const onRequestRelease = vi.fn();
    render(<BuyerActionPanel {...BASE_PROPS} status="DELIVERED" onRequestRelease={onRequestRelease} />);
    await userEvent.click(screen.getByRole("button", { name: /release funds/i }));
    expect(onRequestRelease).toHaveBeenCalledTimes(1);
  });

  it("treats a legacy IN_PROGRESS order flagged completedBySeller the same as DELIVERED", () => {
    // Orders delivered before DELIVERED existed as a status only carry the metadata flag.
    render(<BuyerActionPanel {...BASE_PROPS} status="IN_PROGRESS" isWorkCompleted />);
    expect(screen.queryByRole("button", { name: /request refund/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /release funds/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open dispute/i })).toBeInTheDocument();
  });
});
