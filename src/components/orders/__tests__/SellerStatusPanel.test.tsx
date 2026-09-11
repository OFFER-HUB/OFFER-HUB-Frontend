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
});
