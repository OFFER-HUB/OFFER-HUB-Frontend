import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardWalletHeader } from "@/components/ui/DashboardWalletHeader";

const ADDRESS = "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ";

describe("DashboardWalletHeader", () => {
  it("shows the connect CTA when no wallet is linked", () => {
    render(<DashboardWalletHeader walletAddress={null} />);
    expect(screen.getByText("No wallet connected")).toBeInTheDocument();
  });

  it("does not render the on-chain USDC pill while it is still loading", () => {
    render(
      <DashboardWalletHeader
        walletAddress={ADDRESS}
        onChainUsdc={{ amount: "0", isLoading: true }}
      />
    );
    expect(screen.queryByText("On-chain USDC")).not.toBeInTheDocument();
  });

  it("shows the live on-chain USDC balance once it has loaded", () => {
    render(
      <DashboardWalletHeader
        walletAddress={ADDRESS}
        onChainUsdc={{ amount: "1234.5", isLoading: false }}
      />
    );
    expect(screen.getByText("On-chain USDC")).toBeInTheDocument();
    expect(screen.getByText("1,234.50")).toBeInTheDocument();
  });

  it("does not render the on-chain pill when no wallet is connected", () => {
    render(<DashboardWalletHeader walletAddress={null} onChainUsdc={null} />);
    expect(screen.queryByText("On-chain USDC")).not.toBeInTheDocument();
  });
});
