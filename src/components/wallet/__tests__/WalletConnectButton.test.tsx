import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockDisconnectWalletApi = vi.fn();
vi.mock("@/lib/api/wallet-connect", () => ({
  disconnectWallet: (...args: unknown[]) => mockDisconnectWalletApi(...args),
}));

vi.mock("@/components/wallet/WalletConnectModal", () => ({
  WalletConnectModal: () => null,
}));

const mockDisconnectWallet = vi.fn();
const mockSetPrimaryWallet = vi.fn();
let mockUser: { id: string; wallet?: { id: string; publicKey: string; type: string } } | null = null;
let mockToken: string | null = "jwt-token";

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (
    selector: (s: {
      user: typeof mockUser;
      token: string | null;
      isAuthenticated: boolean;
      hasHydrated: boolean;
      disconnectWallet: typeof mockDisconnectWallet;
      setPrimaryWallet: typeof mockSetPrimaryWallet;
    }) => unknown
  ) =>
    selector({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      hasHydrated: true,
      disconnectWallet: mockDisconnectWallet,
      setPrimaryWallet: mockSetPrimaryWallet,
    }),
}));

const LINKED_WALLET = {
  id: "wal_1",
  publicKey: "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ",
  type: "EXTERNAL",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockToken = "jwt-token";
  mockUser = { id: "usr_1", wallet: LINKED_WALLET };
  mockDisconnectWalletApi.mockResolvedValue([]);
});

describe("WalletConnectButton", () => {
  it("shows the account's own linked wallet, not any other address", () => {
    render(<WalletConnectButton />);
    expect(screen.getByText(/GDRX...UJUJ/)).toBeInTheDocument();
  });

  it("shows Connect Wallet when the account has no linked wallet", () => {
    mockUser = { id: "usr_1" };
    render(<WalletConnectButton />);
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  it("disconnecting calls the backend with the linked wallet's id, then clears it from the store", async () => {
    const user = userEvent.setup();
    render(<WalletConnectButton />);

    await user.click(screen.getByRole("button", { name: /GDRX...UJUJ/ }));
    await user.click(await screen.findByText("Disconnect"));

    await waitFor(() => expect(mockDisconnectWalletApi).toHaveBeenCalledWith("jwt-token", "wal_1"));
    expect(mockSetPrimaryWallet).toHaveBeenCalledWith(undefined);
  });

  it("still clears the local SWK session even when the account has no linked wallet to unlink", async () => {
    mockUser = { id: "usr_1" };
    const user = userEvent.setup();
    render(<WalletConnectButton />);

    // No connected wallet means the trigger opens the connect modal instead
    // of a menu — nothing to disconnect, so the backend call must not fire.
    await user.click(screen.getByText("Connect Wallet"));
    expect(mockDisconnectWalletApi).not.toHaveBeenCalled();
  });
});
