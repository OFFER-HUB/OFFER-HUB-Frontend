import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DisputesTable } from "@/components/admin/disputes/DisputesTable";
import type { AdminDispute } from "@/types/admin.types";

const base: AdminDispute = {
  id: "dsp_1", orderId: "ord_1", openedBy: "BUYER", reason: "QUALITY_ISSUE", evidence: [],
  status: "OPEN", resolutionDecision: null, decisionNote: null,
  createdAt: "2026-09-11T20:00:00.000Z", updatedAt: "2026-09-11T20:00:00.000Z",
  order: {
    id: "ord_1", title: "Logo redesign", description: null, amount: "220.00", currency: "USD", status: "DISPUTED",
    buyerId: "usr_b", sellerId: "usr_s", buyer: { id: "usr_b", email: "buyer@offerhub.local" }, seller: { id: "usr_s", email: null },
    service: null, escrow: null, milestones: [], createdAt: "2026-09-11T19:00:00.000Z",
  },
};
const ROWS: AdminDispute[] = [
  base,
  { ...base, id: "dsp_2", status: "UNDER_REVIEW", reason: "NOT_DELIVERED", order: { ...base.order, id: "ord_2", title: "Landing copy" } },
  { ...base, id: "dsp_3", status: "RESOLVED", openedBy: "SELLER", reason: "OTHER", resolutionDecision: "FULL_RELEASE", order: { ...base.order, id: "ord_3", title: "API integration" } },
];

describe("DisputesTable", () => {
  it("renders the three real (uppercase) statuses without a priority field", () => {
    render(<DisputesTable disputes={ROWS} isLoading={false} onViewDetail={vi.fn()} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Under Review")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.queryByText(/critical|priority/i)).not.toBeInTheDocument();
  });

  it("shows order title, both parties and the escrow amount from the nested order", () => {
    render(<DisputesTable disputes={[base]} isLoading={false} onViewDetail={vi.fn()} />);
    expect(screen.getByText("Logo redesign")).toBeInTheDocument();
    expect(screen.getByText("buyer@offerhub.local")).toBeInTheDocument();
    expect(screen.getByText("usr_s")).toBeInTheDocument(); // seller with no email falls back to id
    expect(screen.getByText("$220.00 USD")).toBeInTheDocument();
    expect(screen.getByText("Quality issue")).toBeInTheDocument();
  });

  it("opens the detail for a row", async () => {
    const onViewDetail = vi.fn();
    render(<DisputesTable disputes={[base]} isLoading={false} onViewDetail={onViewDetail} />);
    await userEvent.click(screen.getByRole("button", { name: "View dispute for Logo redesign" }));
    expect(onViewDetail).toHaveBeenCalledWith(base);
  });

  it("has an empty state", () => {
    render(<DisputesTable disputes={[]} isLoading={false} onViewDetail={vi.fn()} />);
    expect(screen.getByText("No disputes found")).toBeInTheDocument();
  });
});
