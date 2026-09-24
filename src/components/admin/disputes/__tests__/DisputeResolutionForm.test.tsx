import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DisputeResolutionForm } from "@/components/admin/disputes/DisputeResolutionForm";
import type { AdminDispute } from "@/types/admin.types";

const DISPUTE: AdminDispute = {
  id: "dsp_1", orderId: "ord_1", openedBy: "BUYER", reason: "QUALITY_ISSUE", evidence: [],
  status: "UNDER_REVIEW", resolutionDecision: null, decisionNote: null,
  createdAt: "2026-09-11T20:00:00.000Z", updatedAt: "2026-09-11T20:00:00.000Z",
  order: {
    id: "ord_1", title: "Two-milestone order", description: null, amount: "150.00", currency: "USD", status: "DISPUTED",
    buyerId: "usr_b", sellerId: "usr_s", buyer: { id: "usr_b", email: "b@x.co" }, seller: { id: "usr_s", email: "s@x.co" },
    service: null, escrow: null,
    milestones: [
      { id: "m1", title: "Design", amount: "50.00", status: "COMPLETED" },
      { id: "m2", title: "Build", amount: "100.00", status: "OPEN" },
    ],
    createdAt: "2026-09-11T19:00:00.000Z",
  },
};

function setup(dispute = DISPUTE) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<DisputeResolutionForm dispute={dispute} onSubmit={onSubmit} onCancel={vi.fn()} />);
  return onSubmit;
}

describe("DisputeResolutionForm", () => {
  it("pre-fills the SPLIT amounts from the milestones: completed → seller, open → buyer", () => {
    setup();
    expect(screen.getByLabelText(/release to seller \(usd\)/i)).toHaveValue("50.00");
    expect(screen.getByLabelText(/refund to buyer \(usd\)/i)).toHaveValue("100.00");
    expect(screen.getByText(/1 of 2 completed/)).toBeInTheDocument();
  });

  it("requires a decision note before it can submit", async () => {
    const onSubmit = setup();
    expect(screen.getByRole("button", { name: /resolve dispute/i })).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/decision note/i), "Half the work was delivered.");
    expect(screen.getByRole("button", { name: /resolve dispute/i })).toBeEnabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a SPLIT with both amounts and the note", async () => {
    const onSubmit = setup();
    await userEvent.type(screen.getByLabelText(/decision note/i), "Half the work was delivered.");
    await userEvent.click(screen.getByRole("button", { name: /resolve dispute/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        decision: "SPLIT", releaseAmount: "50.00", refundAmount: "100.00", note: "Half the work was delivered.",
      })
    );
  });

  it("blocks a SPLIT whose amounts do not add up to the order amount", async () => {
    const onSubmit = setup();
    await userEvent.clear(screen.getByLabelText(/refund to buyer \(usd\)/i));
    await userEvent.type(screen.getByLabelText(/refund to buyer \(usd\)/i), "90.00");
    await userEvent.type(screen.getByLabelText(/decision note/i), "note");
    expect(screen.getByText(/must add up to the order amount, \$150\.00/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resolve dispute/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("normalizes a plain integer like '250' to '250.00' on blur, instead of rejecting it as not adding up", async () => {
    const onSubmit = setup({ ...DISPUTE, order: { ...DISPUTE.order, amount: "500.00", milestones: [] } });
    const releaseInput = screen.getByLabelText(/release to seller \(usd\)/i);
    const refundInput = screen.getByLabelText(/refund to buyer \(usd\)/i);

    await userEvent.clear(releaseInput);
    await userEvent.type(releaseInput, "250");
    await userEvent.clear(refundInput);
    await userEvent.type(refundInput, "250");
    await userEvent.tab();

    expect(releaseInput).toHaveValue("250.00");
    expect(refundInput).toHaveValue("250.00");
    expect(screen.getByText(/adds up to \$500\.00/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/decision note/i), "Split evenly.");
    expect(screen.getByRole("button", { name: /resolve dispute/i })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: /resolve dispute/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        decision: "SPLIT", releaseAmount: "250.00", refundAmount: "250.00", note: "Split evenly.",
      })
    );
  });

  it("sends only decision + note for a full release / refund", async () => {
    const onSubmit = setup();
    await userEvent.click(screen.getByLabelText(/refund buyer/i));
    await userEvent.type(screen.getByLabelText(/decision note/i), "Nothing delivered.");
    await userEvent.click(screen.getByRole("button", { name: /resolve dispute/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ decision: "FULL_REFUND", note: "Nothing delivered." }));
  });

  it("suggests a full refund for a milestone-free order", () => {
    setup({ ...DISPUTE, order: { ...DISPUTE.order, milestones: [] } });
    expect(screen.getByLabelText(/refund to buyer \(usd\)/i)).toHaveValue("150.00");
    expect(screen.getByLabelText(/release to seller \(usd\)/i)).toHaveValue("0.00");
  });

  it("updates text inputs and percentage display in real time when dragging the slider", () => {
    setup();
    const slider = screen.getByLabelText(/split allocation between client and freelancer/i);
    fireEvent.change(slider, { target: { value: "80" } });

    expect(screen.getByLabelText(/release to seller \(usd\)/i)).toHaveValue("120.00");
    expect(screen.getByLabelText(/refund to buyer \(usd\)/i)).toHaveValue("30.00");
    expect(screen.getByText(/client: \$30\.00 \(20%\) · freelancer: \$120\.00 \(80%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/adds up to \$150\.00/i)).toBeInTheDocument();
  });

  it("updates slider position when writing in text inputs (two-way binding)", async () => {
    setup();
    const slider = screen.getByLabelText(/split allocation between client and freelancer/i);
    const releaseInput = screen.getByLabelText(/release to seller \(usd\)/i);
    const refundInput = screen.getByLabelText(/refund to buyer \(usd\)/i);

    // Type 75.00 into release (50% of 150)
    await userEvent.clear(releaseInput);
    await userEvent.type(releaseInput, "75.00");
    expect(slider).toHaveValue("50");

    // Type 15.00 into refund (leaves 135 for seller = 90% of 150)
    await userEvent.clear(refundInput);
    await userEvent.type(refundInput, "15.00");
    expect(slider).toHaveValue("90");
  });

  it("handles the extreme 0% case (100% to client / 0% to freelancer)", async () => {
    const onSubmit = setup();
    const slider = screen.getByLabelText(/split allocation between client and freelancer/i);
    fireEvent.change(slider, { target: { value: "0" } });

    expect(screen.getByLabelText(/release to seller \(usd\)/i)).toHaveValue("0.00");
    expect(screen.getByLabelText(/refund to buyer \(usd\)/i)).toHaveValue("150.00");
    expect(screen.getByText(/client: \$150\.00 \(100%\) · freelancer: \$0\.00 \(0%\)/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/decision note/i), "Full refund via split.");
    await userEvent.click(screen.getByRole("button", { name: /resolve dispute/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        decision: "SPLIT", releaseAmount: "0.00", refundAmount: "150.00", note: "Full refund via split.",
      })
    );
  });

  it("handles the extreme 100% case (0% to client / 100% to freelancer)", async () => {
    const onSubmit = setup();
    const slider = screen.getByLabelText(/split allocation between client and freelancer/i);
    fireEvent.change(slider, { target: { value: "100" } });

    expect(screen.getByLabelText(/release to seller \(usd\)/i)).toHaveValue("150.00");
    expect(screen.getByLabelText(/refund to buyer \(usd\)/i)).toHaveValue("0.00");
    expect(screen.getByText(/client: \$0\.00 \(0%\) · freelancer: \$150\.00 \(100%\)/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/decision note/i), "Full release via split.");
    await userEvent.click(screen.getByRole("button", { name: /resolve dispute/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        decision: "SPLIT", releaseAmount: "150.00", refundAmount: "0.00", note: "Full release via split.",
      })
    );
  });
});
