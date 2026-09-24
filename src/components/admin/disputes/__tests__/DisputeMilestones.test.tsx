import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisputeMilestones } from "@/components/admin/disputes/DisputeMilestones";
import type { AdminDisputeMilestone } from "@/types/admin.types";

describe("DisputeMilestones", () => {
  it("shows a single-payment message when there are no milestones", () => {
    render(<DisputeMilestones milestones={[]} currency="USD" />);
    expect(screen.getByText(/single-payment order/i)).toBeInTheDocument();
  });

  it("labels an OPEN milestone as Open", () => {
    const milestones: AdminDisputeMilestone[] = [{ id: "m1", title: "Design", amount: "50.00", status: "OPEN" }];
    render(<DisputeMilestones milestones={milestones} currency="USD" />);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("labels a COMPLETED milestone as awaiting release, distinct from RELEASED", () => {
    const milestones: AdminDisputeMilestone[] = [
      { id: "m1", title: "Design", amount: "50.00", status: "COMPLETED" },
    ];
    render(<DisputeMilestones milestones={milestones} currency="USD" />);
    expect(screen.getByText(/completed — awaiting release/i)).toBeInTheDocument();
  });

  it("labels a RELEASED milestone as Paid — funds already left escrow (#281)", () => {
    const milestones: AdminDisputeMilestone[] = [
      { id: "m1", title: "Design", amount: "50.00", status: "RELEASED" },
    ];
    render(<DisputeMilestones milestones={milestones} currency="USD" />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("renders each milestone's amount with its currency", () => {
    const milestones: AdminDisputeMilestone[] = [
      { id: "m1", title: "Design", amount: "50.00", status: "RELEASED" },
    ];
    render(<DisputeMilestones milestones={milestones} currency="USD" />);
    expect(screen.getByText("$50.00 USD")).toBeInTheDocument();
  });
});
