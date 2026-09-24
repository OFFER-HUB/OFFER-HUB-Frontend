import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EscrowDetailsCard } from "@/components/orders/EscrowDetailsCard";
import { STELLAR_EXPLORER_URL } from "@/config/wallet";
import { ORDER_CLIPBOARD_MESSAGES } from "@/constants/order-messages";
import type { OrderEscrow } from "@/types/order.types";

const MOCK_ESCROW: OrderEscrow = {
  id: "escrow_123",
  status: "FUNDED",
  trustlessContractId: "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZLKERYNZLKERY1234",
};

describe("EscrowDetailsCard", () => {
  const onNotifySuccess = vi.fn();
  const onNotifyError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  it("renders the title, smart contract address, and status badge", () => {
    render(
      <EscrowDetailsCard
        escrow={MOCK_ESCROW}
        orderStatus="IN_PROGRESS"
        onNotifySuccess={onNotifySuccess}
        onNotifyError={onNotifyError}
      />
    );

    expect(screen.getByRole("heading", { name: "Secure Payment Contract" })).toBeInTheDocument();
    expect(screen.getByText("FUNDED")).toBeInTheDocument();
    expect(screen.getByText(MOCK_ESCROW.trustlessContractId!)).toBeInTheDocument();
  });

  it("displays COMPLETED status when order status is CLOSED", () => {
    render(
      <EscrowDetailsCard
        escrow={{ ...MOCK_ESCROW, status: "RELEASED" }}
        orderStatus="CLOSED"
        onNotifySuccess={onNotifySuccess}
        onNotifyError={onNotifyError}
      />
    );

    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("copies the contract address to the clipboard and shows feedback", async () => {
    render(
      <EscrowDetailsCard
        escrow={MOCK_ESCROW}
        orderStatus="IN_PROGRESS"
        onNotifySuccess={onNotifySuccess}
        onNotifyError={onNotifyError}
      />
    );

    const copyButton = screen.getByRole("button", { name: /copy smart contract address/i });
    expect(copyButton).toBeInTheDocument();

    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(MOCK_ESCROW.trustlessContractId);
    expect(onNotifySuccess).toHaveBeenCalledWith(ORDER_CLIPBOARD_MESSAGES.copied);
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });

  it("renders a link to the Stellar explorer with the contract ID", () => {
    render(
      <EscrowDetailsCard
        escrow={MOCK_ESCROW}
        orderStatus="IN_PROGRESS"
        onNotifySuccess={onNotifySuccess}
        onNotifyError={onNotifyError}
      />
    );

    const explorerLink = screen.getByRole("link", { name: /explorer/i });
    expect(explorerLink).toHaveAttribute(
      "href",
      `${STELLAR_EXPLORER_URL}/contract/${MOCK_ESCROW.trustlessContractId}`
    );
    expect(explorerLink).toHaveAttribute("target", "_blank");
    expect(explorerLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a fallback message when trustlessContractId is not present", () => {
    render(
      <EscrowDetailsCard
        escrow={{ id: "escrow_pending", status: "PENDING" }}
        orderStatus="ORDER_CREATED"
        onNotifySuccess={onNotifySuccess}
        onNotifyError={onNotifyError}
      />
    );

    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(
      screen.getByText(/contract id will be generated upon escrow initialization/i)
    ).toBeInTheDocument();
  });
});
