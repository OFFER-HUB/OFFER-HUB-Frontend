import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SellerStatusPanel } from "@/components/orders/SellerStatusPanel";

const BASE_PROPS = {
  isProcessing: false,
  onMarkCompleted: vi.fn(),
  onRequestDispute: vi.fn(),
};

describe("SellerStatusPanel", () => {
  it("IN_PROGRESS: offers 'Mark as Completed'", () => {
    render(<SellerStatusPanel {...BASE_PROPS} status="IN_PROGRESS" isWorkCompleted={false} />);
    expect(screen.getByRole("button", { name: /mark as completed/i })).toBeInTheDocument();
    expect(screen.getByText(/ready to start/i)).toBeInTheDocument();
  });

  it("DELIVERED: shows the waiting-for-review state instead of an empty panel", () => {
    // DELIVERED is a real status since API #274; before this the panel matched
    // no branch and the seller saw nothing after delivering.
    render(<SellerStatusPanel {...BASE_PROPS} status="DELIVERED" isWorkCompleted />);
    expect(screen.getByText(/waiting for client review/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mark as completed/i })).not.toBeInTheDocument();
  });

  it("RELEASE_REQUESTED: tells the freelancer their payment is being finalized", () => {
    render(<SellerStatusPanel {...BASE_PROPS} status="RELEASE_REQUESTED" isWorkCompleted />);
    expect(screen.getByText(/release in progress/i)).toBeInTheDocument();
  });

  it("REFUND_REQUESTED: tells the freelancer a refund is in flight", () => {
    render(<SellerStatusPanel {...BASE_PROPS} status="REFUND_REQUESTED" isWorkCompleted />);
    expect(screen.getByText(/refund in progress/i)).toBeInTheDocument();
  });

  it("DISPUTED: tells the freelancer the order is under review", () => {
    render(<SellerStatusPanel {...BASE_PROPS} status="DISPUTED" isWorkCompleted />);
    expect(screen.getByText(/order in dispute/i)).toBeInTheDocument();
  });

  it("CLOSED after a release: shows completion, not an empty panel", () => {
    render(
      <SellerStatusPanel
        {...BASE_PROPS}
        status="CLOSED"
        escrowStatus="RELEASED"
        isWorkCompleted
      />
    );
    expect(screen.getByText(/order completed/i)).toBeInTheDocument();
  });

  it("CLOSED after a refund: explains no payout applies, instead of leaving the freelancer guessing", () => {
    // This was the reported bug: the panel matched no branch here, and the
    // payout tracker below it never appears for a refund either, so the
    // freelancer saw a blank "Order Status" card with no explanation.
    render(
      <SellerStatusPanel
        {...BASE_PROPS}
        status="CLOSED"
        escrowStatus="REFUNDED"
        isWorkCompleted
      />
    );
    expect(screen.getByText(/order refunded/i)).toBeInTheDocument();
    expect(screen.getByText(/no payout applies/i)).toBeInTheDocument();
  });
});
