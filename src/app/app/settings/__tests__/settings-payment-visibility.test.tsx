import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mock heavy dependencies so the settings page renders in jsdom ─────────────

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/onboarding-store", () => ({
  useOnboardingStore: vi.fn(() => ({ completedSteps: [] })),
}));

vi.mock("@/components/settings/ClaimWalletCard", () => ({
  ClaimWalletCard: () => <div data-testid="claim-wallet-card" />,
}));

vi.mock("@/components/settings/WalletManagementCard", () => ({
  WalletManagementCard: () => <div data-testid="wallet-management-card" />,
}));

vi.mock("@/components/bank-accounts/BankAccountSelector", () => ({
  BankAccountSelector: ({ title }: { title: string }) => (
    <div data-testid="bank-account-selector">{title}</div>
  ),
}));

// Silence Next.js Link without a Router
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useAuthStore } from "@/stores/auth-store";
import SettingsPage from "@/app/app/settings/page";

function setUserType(type: string | undefined) {
  (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (s: { user?: { type?: string } }) => unknown) =>
      selector({ user: type ? { type } : undefined }),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Settings page — Payment Accounts visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Payment Accounts section for SELLER users", () => {
    setUserType("SELLER");
    render(<SettingsPage />);
    expect(screen.getByTestId("bank-account-selector")).toBeInTheDocument();
    expect(screen.getByText("Payment Accounts")).toBeInTheDocument();
  });

  it("shows Payment Accounts section for BOTH users", () => {
    setUserType("BOTH");
    render(<SettingsPage />);
    expect(screen.getByTestId("bank-account-selector")).toBeInTheDocument();
  });

  it("hides Payment Accounts section for CLIENT users", () => {
    setUserType("CLIENT");
    render(<SettingsPage />);
    expect(screen.queryByTestId("bank-account-selector")).not.toBeInTheDocument();
  });

  it("hides Payment Accounts section when user type is unknown", () => {
    setUserType(undefined);
    render(<SettingsPage />);
    expect(screen.queryByTestId("bank-account-selector")).not.toBeInTheDocument();
  });
});
