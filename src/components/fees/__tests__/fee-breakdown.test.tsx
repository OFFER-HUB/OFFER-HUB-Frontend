import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { FeeBreakdownLines } from "../FeeBreakdownLines";
import { FeeBreakdownNote } from "../FeeBreakdownNote";
import { OrderFinancialSummary } from "@/components/orders/OrderFinancialSummary";
import type { FeeBreakdown } from "@/types/fees.types";

const { getFeeQuote } = vi.hoisted(() => ({ getFeeQuote: vi.fn() }));
vi.mock("@/lib/api/fees", () => ({ getFeeQuote }));

/** The real split of a 12.00 USDC mainnet release. */
const TWELVE: FeeBreakdown = {
  currency: "USDC",
  gross: "12.00",
  platformFeePercent: 5,
  trustlessWorkFeePercent: 0.3,
  platformFee: "0.60",
  trustlessWorkFee: "0.036",
  totalFees: "0.636",
  netReceived: "11.364",
  payoutAmount: "11.36",
};

function rowValue(label: string): string | null | undefined {
  return screen.getByText(label).nextElementSibling?.textContent;
}

describe("FeeBreakdownLines", () => {
  it("tells the client what they pay and what reaches the freelancer", () => {
    render(<FeeBreakdownLines breakdown={TWELVE} audience="client" />);
    expect(rowValue("You pay")).toBe("$12.00");
    expect(rowValue("Platform fee (5%)")).toBe("$− 0.60");
    expect(rowValue("Escrow network fee (0.3%)")).toBe("$− 0.04");
    expect(rowValue("Freelancer receives")).toBe("$11.36");
  });

  it("tells the freelancer what they receive", () => {
    render(<FeeBreakdownLines breakdown={TWELVE} audience="freelancer" />);
    expect(rowValue("Order price")).toBe("$12.00");
    expect(rowValue("You receive")).toBe("$11.36");
  });
});

describe("FeeBreakdownNote", () => {
  beforeEach(() => getFeeQuote.mockReset());

  it("shows the breakdown the API returns for the typed amount, with the refund note", async () => {
    getFeeQuote.mockResolvedValue({ minOrderAmount: "10.56", payoutMinUsd: 10, payoutMaxUsd: 10000, breakdown: { ...TWELVE, payoutInRange: true } });
    render(<FeeBreakdownNote amount="12" audience="client" showRefundNote />);
    await waitFor(() => expect(screen.getByText("Freelancer receives")).toBeInTheDocument());
    expect(getFeeQuote).toHaveBeenCalledWith("12");
    expect(screen.getByText(/refund returns the amount minus fees/)).toBeInTheDocument();
  });

  it("renders nothing for an empty or invalid amount, and asks nothing", async () => {
    const { container } = render(<FeeBreakdownNote amount="abc" audience="client" />);
    await new Promise((r) => setTimeout(r, 350));
    expect(container).toBeEmptyDOMElement();
    expect(getFeeQuote).not.toHaveBeenCalled();
  });

  it("renders nothing when the API returns no breakdown", async () => {
    getFeeQuote.mockResolvedValue({ minOrderAmount: "10.56", payoutMinUsd: 10, payoutMaxUsd: 10000 });
    const { container } = render(<FeeBreakdownNote amount="12" audience="client" />);
    await waitFor(() => expect(getFeeQuote).toHaveBeenCalledWith("12"));
    await new Promise((r) => setTimeout(r, 0));
    expect(container).toBeEmptyDOMElement();
  });
});

describe("OrderFinancialSummary", () => {
  beforeEach(() => getFeeQuote.mockReset());

  it("uses the order's breakdown and no longer claims fees are 'Included'", () => {
    render(<OrderFinancialSummary order={{ amount: "12.00", feeBreakdown: TWELVE }} isBuyer={false} />);
    expect(rowValue("You receive")).toBe("$11.36");
    expect(screen.queryByText("Included")).not.toBeInTheDocument();
    expect(getFeeQuote).not.toHaveBeenCalled();
  });

  it("asks the quote endpoint when an older API omits the breakdown", async () => {
    getFeeQuote.mockResolvedValue({ minOrderAmount: "10.56", payoutMinUsd: 10, payoutMaxUsd: 10000, breakdown: { ...TWELVE, payoutInRange: true } });
    render(<OrderFinancialSummary order={{ amount: "12.00" }} isBuyer />);
    expect(screen.getByText("Agreed Project Price:")).toBeInTheDocument();
    await waitFor(() => expect(rowValue("Freelancer receives")).toBe("$11.36"));
  });
});
