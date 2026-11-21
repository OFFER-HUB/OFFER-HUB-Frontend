import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DisputeNetPreview } from "../DisputeNetPreview";
import { DisputeFeeNotice } from "../DisputeFeeNotice";

const { getFeeQuote } = vi.hoisted(() => ({ getFeeQuote: vi.fn() }));
vi.mock("@/lib/api/fees", () => ({ getFeeQuote }));

/** Mirrors the API: 5% + 0.3%, net rounded down to the cent. */
function quoteFor(amount: string) {
  const gross = Number(amount);
  const net = Math.floor(Math.round(gross * 100) * 0.947) / 100;
  return {
    minOrderAmount: "10.56",
    payoutMinUsd: 10,
    payoutMaxUsd: 10000,
    breakdown: {
      currency: "USDC",
      gross: amount,
      platformFeePercent: 5,
      trustlessWorkFeePercent: 0.3,
      platformFee: (gross * 0.05).toFixed(2),
      trustlessWorkFee: (gross * 0.003).toFixed(3),
      totalFees: (gross * 0.053).toFixed(3),
      netReceived: (gross * 0.947).toFixed(3),
      payoutAmount: net.toFixed(2),
      payoutInRange: net >= 10,
    },
  };
}

const value = (label: string) => screen.getByText(label).nextElementSibling?.textContent;

describe("DisputeNetPreview", () => {
  beforeEach(() => {
    getFeeQuote.mockReset();
    getFeeQuote.mockImplementation(async (amount: string) => quoteFor(amount));
  });

  it("shows what the client really gets back from a full refund (the real 5.00 case: 4.73)", async () => {
    render(<DisputeNetPreview decision="FULL_REFUND" orderAmount="5.00" />);
    await waitFor(() => expect(value("Client receives")).toBe("$4.73"));
    expect(screen.queryByText("Freelancer receives")).not.toBeInTheDocument();
  });

  it("shows both shares of a split after fees", async () => {
    render(<DisputeNetPreview decision="SPLIT" orderAmount="100.00" releaseAmount="60.00" refundAmount="40.00" />);
    await waitFor(() => expect(value("Freelancer receives")).toBe("$56.82"));
    expect(value("Client receives")).toBe("$37.88");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("flags a freelancer share that can't be cashed out to a bank", async () => {
    render(<DisputeNetPreview decision="SPLIT" orderAmount="20.00" releaseAmount="10.00" refundAmount="10.00" />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("under $10 after fees"));
  });
});

describe("DisputeFeeNotice", () => {
  beforeEach(() => {
    getFeeQuote.mockReset();
    getFeeQuote.mockImplementation(async (amount: string) => quoteFor(amount));
  });

  it("says a full refund returns the order minus the contract fees", async () => {
    render(<DisputeFeeNotice orderAmount="12.00" />);
    await waitFor(() => expect(screen.getByTestId("dispute-fee-notice")).toHaveTextContent("a full refund returns $11.36"));
    expect(screen.getByTestId("dispute-fee-notice")).toHaveTextContent("keeps its fees (5.3%)");
  });

  it("renders nothing without an amount", () => {
    const { container } = render(<DisputeFeeNotice />);
    expect(container).toBeEmptyDOMElement();
  });
});
