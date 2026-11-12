import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let mockNetwork: "testnet" | "public" = "testnet";
vi.mock("@/config/wallet", () => ({
  get STELLAR_NETWORK() {
    return mockNetwork;
  },
}));
vi.mock("@/stores/auth-store", () => ({ useAuthStore: vi.fn() }));
vi.mock("@/stores/onboarding-store", () => ({ useOnboardingStore: vi.fn(() => ({ completedSteps: [] })) }));
vi.mock("@/components/settings/ClaimWalletCard", () => ({
  ClaimWalletCard: () => <div data-testid="claim-wallet-card" />,
}));
vi.mock("@/components/settings/WalletManagementCard", () => ({
  WalletManagementCard: () => <div data-testid="wallet-management-card" />,
}));
vi.mock("@/components/bank-accounts/BankAccountSelector", () => ({ BankAccountSelector: () => <div /> }));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

import { useAuthStore } from "@/stores/auth-store";
import SettingsPage from "@/app/app/settings/page";

beforeEach(() => {
  (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (s: { user?: { type?: string } }) => unknown) => selector({ user: { type: "BUYER" } })
  );
});

describe("Settings page — Claim Your Wallet visibility (API ADR-001)", () => {
  it("shows Claim Your Wallet on the testnet sandbox", () => {
    mockNetwork = "testnet";
    render(<SettingsPage />);

    expect(screen.getByTestId("claim-wallet-card")).toBeInTheDocument();
  });

  it("hides it on mainnet, where the database holds no custodial keys", () => {
    mockNetwork = "public";
    render(<SettingsPage />);

    expect(screen.queryByTestId("claim-wallet-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("wallet-management-card")).toBeInTheDocument();
  });
});
