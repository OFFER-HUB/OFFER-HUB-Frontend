import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let mockNetwork: "testnet" | "public" = "testnet";
vi.mock("@/config/wallet", () => ({
  get STELLAR_NETWORK() {
    return mockNetwork;
  },
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock("@/components/wallet/BalanceCard", () => ({ BalanceCard: () => <div /> }));
vi.mock("@/components/wallet/BalanceChart", () => ({ BalanceChart: () => <div /> }));
vi.mock("@/components/wallet/RecentTransactions", () => ({ RecentTransactions: () => <div /> }));
vi.mock("@/components/wallet/WalletMonthlyMetrics", () => ({ WalletMonthlyMetrics: () => <div /> }));
vi.mock("@/components/wallet/UsdbTestnetFundingCard", () => ({
  UsdbTestnetFundingCard: () => <div>Testnet funds</div>,
}));

import { WalletDashboardContent } from "../WalletDashboardContent";

const DATA = {
  balance: { available: "10.00", reserved: "0.00", currency: "USD" },
  monthly: {},
  withdrawals: {},
  chart: [],
  recentTransactions: [],
} as never;

function renderDashboard(isExternalWallet: boolean) {
  return render(
    <WalletDashboardContent
      data={DATA}
      isExternalWallet={isExternalWallet}
      isRefreshing={false}
      walletBalance={{ address: null } as never}
      onRefresh={vi.fn()}
    />
  );
}

beforeEach(() => {
  mockNetwork = "testnet";
});

describe("WalletDashboardContent — testnet-only UI", () => {
  it("offers test USDB funding on testnet for an external wallet", () => {
    renderDashboard(true);

    expect(screen.getByText("Testnet funds")).toBeInTheDocument();
  });

  it("does not offer it on testnet to a custodial wallet", () => {
    renderDashboard(false);

    expect(screen.queryByText("Testnet funds")).not.toBeInTheDocument();
  });

  it("never shows it on the mainnet build", () => {
    mockNetwork = "public";
    renderDashboard(true);

    expect(screen.queryByText("Testnet funds")).not.toBeInTheDocument();
  });
});
