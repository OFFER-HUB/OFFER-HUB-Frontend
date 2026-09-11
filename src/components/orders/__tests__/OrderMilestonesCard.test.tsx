import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderMilestonesCard } from "@/components/orders/OrderMilestonesCard";
import type { Milestone } from "@/types/order.types";

const MOCK_PARTIALLY_RELEASED_MILESTONES: Milestone[] = [
  {
    id: "m-1",
    orderId: "ord-123",
    title: "Phase 1: Architecture & DB Schema",
    description: "System design specifications and PostgreSQL migrations.",
    amount: "100.00",
    status: "COMPLETED",
    paymentStatus: "RELEASED",
    completedAt: "2026-09-10T12:00:00Z",
  },
  {
    id: "m-2",
    orderId: "ord-123",
    title: "Phase 2: Core API Endpoints",
    description: "Authentication, orders API, and webhook integration.",
    amount: "150.00",
    status: "COMPLETED",
    paymentStatus: "AWAITING_APPROVAL",
    completedAt: "2026-09-11T15:00:00Z",
  },
  {
    id: "m-3",
    orderId: "ord-123",
    title: "Phase 3: Frontend Dashboard Integration",
    description: "Next.js UI components and on-chain Soroban wallet hooks.",
    amount: "200.00",
    status: "OPEN",
    paymentStatus: "PENDING",
  },
  {
    id: "m-4",
    orderId: "ord-123",
    title: "Phase 4: Optional Add-on (Refunded)",
    description: "Cancelled feature scope refunded back to client.",
    amount: "50.00",
    status: "OPEN",
    paymentStatus: "REFUNDED",
  },
];

describe("OrderMilestonesCard", () => {
  it("renders empty milestone state when milestones are undefined or empty", () => {
    const { rerender } = render(
      <OrderMilestonesCard orderId="ord-1" orderStatus="IN_PROGRESS" />
    );
    expect(
      screen.getByText(/this order has a single lump-sum payout/i)
    ).toBeInTheDocument();

    rerender(
      <OrderMilestonesCard orderId="ord-1" orderStatus="IN_PROGRESS" milestones={[]} />
    );
    expect(
      screen.getByText(/this order has a single lump-sum payout/i)
    ).toBeInTheDocument();
  });

  it("renders multi-milestone order with granular payment statuses in partially-released state", () => {
    render(
      <OrderMilestonesCard
        orderId="ord-123"
        orderStatus="IN_PROGRESS"
        milestones={MOCK_PARTIALLY_RELEASED_MILESTONES}
      />
    );

    // Milestones header count
    expect(screen.getByText("4 Milestones")).toBeInTheDocument();

    // Titles
    expect(screen.getByText("Phase 1: Architecture & DB Schema")).toBeInTheDocument();
    expect(screen.getByText("Phase 2: Core API Endpoints")).toBeInTheDocument();
    expect(screen.getByText("Phase 3: Frontend Dashboard Integration")).toBeInTheDocument();
    expect(screen.getByText("Phase 4: Optional Add-on (Refunded)")).toBeInTheDocument();

    // Granular Status Badges
    expect(screen.getByText("Released")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Approval")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Refunded")).toBeInTheDocument();

    // Financial progress calculations (100 released out of 500 total = 20%)
    expect(screen.getAllByText(/\$100\.00 USD/i)).toHaveLength(2);
    expect(screen.getByText(/1 of 4 paid/i)).toBeInTheDocument();
    expect(screen.getByText(/1 awaiting review/i)).toBeInTheDocument();
  });

  it("renders seller-specific incremental release guidance", () => {
    render(
      <OrderMilestonesCard
        orderId="ord-123"
        orderStatus="IN_PROGRESS"
        milestones={MOCK_PARTIALLY_RELEASED_MILESTONES}
        isSeller
      />
    );

    expect(screen.getByText(/Incremental Earnings Release/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Funds for each milestone are released individually into your balance upon client approval/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Payment released to your wallet\./i)
    ).toBeInTheDocument();
  });

  it("renders buyer-specific escrow protection guidance", () => {
    render(
      <OrderMilestonesCard
        orderId="ord-123"
        orderStatus="IN_PROGRESS"
        milestones={MOCK_PARTIALLY_RELEASED_MILESTONES}
        isBuyer
      />
    );

    expect(screen.getByText(/Protected Milestone Release/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Escrow funds for each milestone remain securely held until you review and approve/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Funds released to freelancer\./i)
    ).toBeInTheDocument();
  });

  it("infers payment status accurately when explicit paymentStatus is not provided", () => {
    const legacyMilestones: Milestone[] = [
      {
        id: "leg-1",
        orderId: "ord-leg",
        title: "Legacy Finished Milestone",
        description: "Completed milestone with no explicit payment status field.",
        amount: "80.00",
        status: "COMPLETED",
      },
      {
        id: "leg-2",
        orderId: "ord-leg",
        title: "Legacy Open Milestone",
        description: "Open milestone with no explicit payment status field.",
        amount: "120.00",
        status: "OPEN",
      },
    ];

    render(
      <OrderMilestonesCard
        orderId="ord-leg"
        orderStatus="IN_PROGRESS"
        milestones={legacyMilestones}
      />
    );

    // leg-1 is COMPLETED and order is IN_PROGRESS -> Awaiting Approval
    expect(screen.getByText("Awaiting Approval")).toBeInTheDocument();
    // leg-2 is OPEN -> Pending
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("supports snake_case payment_status from backend responses", () => {
    const snakeCaseMilestones: Milestone[] = [
      {
        id: "sc-1",
        orderId: "ord-sc",
        title: "Snake Case Milestone",
        description: "Backend returns payment_status",
        amount: "60.00",
        status: "COMPLETED",
        payment_status: "RELEASED",
      },
    ];

    render(
      <OrderMilestonesCard
        orderId="ord-sc"
        orderStatus="IN_PROGRESS"
        milestones={snakeCaseMilestones}
      />
    );

    expect(screen.getByText("Released")).toBeInTheDocument();
  });
});
