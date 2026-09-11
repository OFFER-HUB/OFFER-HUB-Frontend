import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SellerStatusPanel } from "@/components/orders/SellerStatusPanel";
import type { Milestone } from "@/types/order.types";

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

  it("renders incremental payout status and messaging when milestones are present", () => {
    const milestones: Milestone[] = [
      {
        id: "m-1",
        orderId: "ord-1",
        title: "Milestone 1",
        description: "Done",
        amount: "100.00",
        status: "COMPLETED",
        paymentStatus: "RELEASED",
      },
      {
        id: "m-2",
        orderId: "ord-1",
        title: "Milestone 2",
        description: "In progress",
        amount: "150.00",
        status: "OPEN",
        paymentStatus: "PENDING",
      },
    ];

    render(
      <SellerStatusPanel
        {...BASE_PROPS}
        status="IN_PROGRESS"
        isWorkCompleted={false}
        milestones={milestones}
      />
    );

    expect(screen.getByText(/Incremental Payout Active/i)).toBeInTheDocument();
    expect(screen.getByText(/\$100\.00 \/ \$250\.00 USD/i)).toBeInTheDocument();
    expect(
      screen.getByText(/1 of 2 milestones released/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Completing and getting each milestone approved releases funds incrementally — you don't have to wait for the whole order to be completed/i
      )
    ).toBeInTheDocument();
  });
});
