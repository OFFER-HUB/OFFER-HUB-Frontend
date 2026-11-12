import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UsdcReadinessPrompt, GET_XLM_URL } from "../UsdcReadinessPrompt";
import type { UseUsdcTrustlineResult } from "@/hooks/useUsdcTrustline";

const mockEnable = vi.fn();
let trustline: UseUsdcTrustlineResult;
vi.mock("@/hooks/useUsdcTrustline", () => ({
  useUsdcTrustline: () => trustline,
}));

beforeEach(() => {
  vi.clearAllMocks();
  trustline = { state: "idle", enable: mockEnable, reset: vi.fn(), error: null, transactionHash: null };
});

describe("UsdcReadinessPrompt", () => {
  it("explains activation with XLM when the account does not exist, with no in-app purchase", () => {
    render(<UsdcReadinessPrompt readiness="no_account" onEnabled={vi.fn()} />);

    expect(screen.getByText(/Activate your wallet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /How to get XLM/ })).toHaveAttribute("href", GET_XLM_URL);
    expect(screen.queryByRole("button", { name: /Enable USDC/ })).not.toBeInTheDocument();
  });

  it("offers Enable USDC when the trustline is missing", () => {
    render(<UsdcReadinessPrompt readiness="no_trustline" onEnabled={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Enable USDC" }));

    expect(mockEnable).toHaveBeenCalledTimes(1);
  });

  it("disables the button and names the step while signing", () => {
    trustline = { ...trustline, state: "awaiting_signature" };
    render(<UsdcReadinessPrompt readiness="no_trustline" onEnabled={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Confirm in your wallet/ })).toBeDisabled();
  });

  it("shows a friendly error and lets the user retry", () => {
    trustline = { ...trustline, state: "error", error: { code: "USER_REJECTED", message: "You declined the signature request in your wallet." } };
    render(<UsdcReadinessPrompt readiness="no_trustline" onEnabled={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("You declined the signature request in your wallet.");
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  });

  it("confirms once USDC is enabled", () => {
    trustline = { ...trustline, state: "confirmed", transactionHash: "abc" };
    render(<UsdcReadinessPrompt readiness="no_trustline" onEnabled={vi.fn()} />);

    expect(screen.getByText(/USDC enabled/)).toBeInTheDocument();
  });

  it.each(["ready", "unknown"] as const)("renders nothing when readiness is %s", (readiness) => {
    const { container } = render(<UsdcReadinessPrompt readiness={readiness} onEnabled={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
