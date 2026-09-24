import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MilestonePaymentStatusCard } from "@/components/orders/MilestonePaymentStatusCard";
import type { Milestone } from "@/types/order.types";

function milestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: "mil_1",
    orderId: "ord_1",
    title: "Design",
    description: "",
    amount: "100.00",
    status: "OPEN",
    ...overrides,
  };
}

describe("MilestonePaymentStatusCard", () => {
  it("renders nothing for a single-milestone or milestone-free order — nothing incremental to show", () => {
    const { container: none } = render(<MilestonePaymentStatusCard milestones={[]} />);
    expect(none.firstChild).toBeNull();

    const { container: one } = render(<MilestonePaymentStatusCard milestones={[milestone()]} />);
    expect(one.firstChild).toBeNull();
  });

  it("shows a released-of-total count in the header", () => {
    render(
      <MilestonePaymentStatusCard
        milestones={[
          milestone({ id: "m0", status: "RELEASED" }),
          milestone({ id: "m1", status: "OPEN" }),
          milestone({ id: "m2", status: "COMPLETED" }),
        ]}
      />
    );
    expect(screen.getByText("1 of 3 released")).toBeInTheDocument();
  });

  it("distinguishes OPEN, COMPLETED (awaiting release), and RELEASED (paid) per milestone", () => {
    render(
      <MilestonePaymentStatusCard
        milestones={[
          milestone({ id: "m0", title: "Design", status: "OPEN" }),
          milestone({ id: "m1", title: "Build", status: "COMPLETED" }),
          milestone({ id: "m2", title: "Deploy", status: "RELEASED" }),
        ]}
      />
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText(/completed — awaiting release/i)).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("shows each milestone's amount", () => {
    render(
      <MilestonePaymentStatusCard
        milestones={[
          milestone({ id: "m0", amount: "40.00", status: "RELEASED" }),
          milestone({ id: "m1", amount: "60.00", status: "OPEN" }),
        ]}
      />
    );
    expect(screen.getByText("$40.00 USD")).toBeInTheDocument();
    expect(screen.getByText("$60.00 USD")).toBeInTheDocument();
  });
});
