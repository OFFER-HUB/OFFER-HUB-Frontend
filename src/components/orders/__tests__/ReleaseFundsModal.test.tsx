import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReleaseFundsModal } from "@/components/orders/ReleaseFundsModal";

describe("ReleaseFundsModal — early release warning", () => {
  it("shows no warning when the work has already been delivered", () => {
    render(
      <ReleaseFundsModal
        isOpen
        amount="100.00"
        isProcessing={false}
        isEarlyRelease={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByText(/hasn't marked this order as delivered/i)).not.toBeInTheDocument();
  });

  it("shows a friendly warning when releasing before delivery, framed as a mutual decision", () => {
    render(
      <ReleaseFundsModal
        isOpen
        amount="100.00"
        isProcessing={false}
        isEarlyRelease
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText(/hasn't marked this order as delivered/i)).toBeInTheDocument();
    expect(screen.getByText(/something you both agreed on/i)).toBeInTheDocument();
  });

  it("still lets the buyer confirm from the warning state — it's a heads-up, not a block", async () => {
    const onConfirm = vi.fn();
    render(
      <ReleaseFundsModal
        isOpen
        amount="100.00"
        isProcessing={false}
        isEarlyRelease
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("defaults to no warning when isEarlyRelease is omitted", () => {
    render(
      <ReleaseFundsModal
        isOpen
        amount="100.00"
        isProcessing={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByText(/hasn't marked this order as delivered/i)).not.toBeInTheDocument();
  });
});
