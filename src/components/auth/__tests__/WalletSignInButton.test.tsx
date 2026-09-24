import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletSignInButton } from "@/components/auth/WalletSignInButton";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span>{props.alt}</span>,
}));

const mockSignIn = vi.fn();
const mockReset = vi.fn();
vi.mock("@/hooks/useWalletAuth", () => ({
  useWalletAuth: () => ({
    signIn: mockSignIn,
    step: "idle",
    isAuthenticating: false,
    error: null,
    reset: mockReset,
  }),
}));

let mockModalIsOpen = false;
vi.mock("@/components/wallet/WalletConnectModal", () => ({
  WalletConnectModal: ({ isOpen }: { isOpen: boolean }) => {
    mockModalIsOpen = isOpen;
    return isOpen ? <div data-testid="wallet-connect-modal" /> : null;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockModalIsOpen = false;
});

describe("WalletSignInButton", () => {
  it("always opens the wallet picker instead of silently signing in with SWK's remembered wallet", async () => {
    const user = userEvent.setup();
    render(<WalletSignInButton />);

    await user.click(screen.getByRole("button", { name: "Sign in with wallet" }));

    expect(mockModalIsOpen).toBe(true);
    expect(screen.getByTestId("wallet-connect-modal")).toBeInTheDocument();
    // The old shortcut called signIn() directly without the picker — it must not.
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
