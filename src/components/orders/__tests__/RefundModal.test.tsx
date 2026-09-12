import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RefundModal } from "../RefundModal";

const LONG_ENOUGH_REASON = "The freelancer stopped responding after payment.";

function setup(overrides: Partial<React.ComponentProps<typeof RefundModal>> = {}) {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  const utils = render(
    <RefundModal
      isOpen
      amount="150.00"
      isProcessing={false}
      error={null}
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...overrides}
    />
  );
  return { ...utils, onCancel, onConfirm };
}

describe("RefundModal — visibility", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <RefundModal
        isOpen={false}
        amount="10.00"
        isProcessing={false}
        error={null}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByText(/request refund/i)).not.toBeInTheDocument();
  });

  it("shows the requested amount", () => {
    setup({ amount: "150.00" });
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });
});

describe("RefundModal — validation", () => {
  it("blocks submission with a short reason and shows a validation message", async () => {
    const { onConfirm } = setup();

    await userEvent.type(screen.getByLabelText(/reason for refund/i), "too short");
    await userEvent.click(screen.getByRole("button", { name: /request refund/i }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/at least 10 characters/i);
  });

  it("submits the trimmed reason once it's long enough", async () => {
    const { onConfirm } = setup();

    await userEvent.type(screen.getByLabelText(/reason for refund/i), `  ${LONG_ENOUGH_REASON}  `);
    await userEvent.click(screen.getByRole("button", { name: /request refund/i }));

    expect(onConfirm).toHaveBeenCalledWith(LONG_ENOUGH_REASON);
  });
});

describe("RefundModal — milestone breakdown (#446)", () => {
  const MILESTONES = [
    { id: "m1", orderId: "ord_1", title: "Design", description: "", amount: "50.00", status: "COMPLETED" as const },
    { id: "m2", orderId: "ord_1", title: "Build", description: "", amount: "100.00", status: "OPEN" as const },
  ];

  it("shows the breakdown step first for a milestone order, before any reason field", () => {
    setup({ amount: "150.00", milestones: MILESTONES });

    expect(screen.getByText("Order total")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("−$50.00")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText(/1 of 2 already completed/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/reason for refund/i)).not.toBeInTheDocument();
  });

  it("Continue moves to the reason form, which now asks for the refundable (not full) amount", async () => {
    setup({ amount: "150.00", milestones: MILESTONES });

    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByLabelText(/reason for refund/i)).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.queryByText("$150.00")).not.toBeInTheDocument();
  });

  it("can be cancelled from the breakdown step without submitting anything", async () => {
    const { onCancel, onConfirm } = setup({ amount: "150.00", milestones: MILESTONES });

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("skips the breakdown entirely for a milestone-free order (existing one-click flow)", () => {
    setup({ amount: "150.00", milestones: [] });

    expect(screen.queryByText("Order total")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/reason for refund/i)).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });

  it("skips the breakdown when milestones is not passed at all", () => {
    setup({ amount: "150.00" });

    expect(screen.queryByText("Order total")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/reason for refund/i)).toBeInTheDocument();
  });
});

describe("RefundModal — error and processing", () => {
  it("shows a caller-supplied error", () => {
    setup({ error: "Cannot prepare refund: order is not IN_PROGRESS" });
    expect(screen.getByRole("alert")).toHaveTextContent("Cannot prepare refund: order is not IN_PROGRESS");
  });

  it("disables the form and both buttons while processing", () => {
    setup({ isProcessing: true });

    expect(screen.getByLabelText(/reason for refund/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const { onCancel } = setup();
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
