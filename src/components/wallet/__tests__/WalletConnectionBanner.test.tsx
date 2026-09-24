import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletConnectionBanner } from "@/components/wallet/WalletConnectionBanner";

vi.mock("@/components/wallet/WalletConnectModal", () => ({
  WalletConnectModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="wallet-connect-modal">Connect modal open</div> : null,
}));

beforeEach(() => {
  window.sessionStorage.clear();
});

describe("WalletConnectionBanner", () => {
  it("does not render when the account already has a primary wallet", () => {
    render(<WalletConnectionBanner userId="usr_1" hasWallet />);
    expect(screen.queryByTestId("wallet-connection-banner")).not.toBeInTheDocument();
  });

  it("renders the reminder when the account has no wallet", () => {
    render(<WalletConnectionBanner userId="usr_1" hasWallet={false} />);
    expect(screen.getByText("Connect your wallet")).toBeInTheDocument();
  });

  it("opens the connect modal from the CTA", async () => {
    const user = userEvent.setup();
    render(<WalletConnectionBanner userId="usr_1" hasWallet={false} />);

    await user.click(screen.getByRole("button", { name: "Connect wallet" }));

    expect(screen.getByTestId("wallet-connect-modal")).toBeInTheDocument();
  });

  it("hides for the session after dismiss, scoped to the current user", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<WalletConnectionBanner userId="usr_1" hasWallet={false} />);

    await user.click(screen.getByTestId("wallet-connection-banner-dismiss"));
    expect(screen.queryByTestId("wallet-connection-banner")).not.toBeInTheDocument();
    unmount();

    // Same user, fresh mount (e.g. navigating between dashboard and profile
    // within the session) — stays dismissed.
    render(<WalletConnectionBanner userId="usr_1" hasWallet={false} />);
    expect(screen.queryByTestId("wallet-connection-banner")).not.toBeInTheDocument();
  });

  it("does not carry a dismissal forward to a different user", () => {
    const { unmount } = render(<WalletConnectionBanner userId="usr_1" hasWallet={false} />);
    window.sessionStorage.setItem("offerhub:wallet-connection-banner-dismissed:usr_1", "1");
    unmount();

    render(<WalletConnectionBanner userId="usr_2" hasWallet={false} />);
    expect(screen.getByTestId("wallet-connection-banner")).toBeInTheDocument();
  });
});
