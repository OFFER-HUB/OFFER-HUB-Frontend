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
const mockListWallets = vi.fn();
vi.mock("@/lib/api/wallet-connect", () => ({
  disconnectWallet: (...args: unknown[]) => mockDisconnectWalletApi(...args),
  listWallets: (...args: unknown[]) => mockListWallets(...args),
}));

vi.mock("@/components/wallet/WalletConnectModal", () => ({
  WalletConnectModal: () => null,
}));

const mockDisconnectWallet = vi.fn();
const mockSetPrimaryWallet = vi.fn();
const mockLogout = vi.fn().mockResolvedValue(undefined);
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
      logout: typeof mockLogout;
    }) => unknown
  ) =>
    selector({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      hasHydrated: true,
      disconnectWallet: mockDisconnectWallet,
      setPrimaryWallet: mockSetPrimaryWallet,
      logout: mockLogout,
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

  it("ends the session when the user signed in with this very wallet", async () => {
    const payload = btoa(JSON.stringify({ sub: "usr_1", walletAddress: LINKED_WALLET.publicKey }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    mockToken = `header.${payload}.signature`;
    const original = window.location;
    Object.defineProperty(window, "location", { value: { href: "" }, writable: true, configurable: true });

    const user = userEvent.setup();
    render(<WalletConnectButton />);
    await user.click(screen.getByRole("button", { name: /GDRX...UJUJ/ }));
    await user.click(await screen.findByText("Disconnect"));

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    expect(mockDisconnectWalletApi).not.toHaveBeenCalled();
    Object.defineProperty(window, "location", { value: original, writable: true, configurable: true });
  });

  it("looks the wallet id up when the stored session has none", async () => {
    mockUser = { id: "usr_1", wallet: { publicKey: LINKED_WALLET.publicKey, type: "EXTERNAL" } as never };
    mockListWallets.mockResolvedValue([{ id: "wal_9", publicKey: LINKED_WALLET.publicKey }]);

    const user = userEvent.setup();
    render(<WalletConnectButton />);
    await user.click(screen.getByRole("button", { name: /GDRX...UJUJ/ }));
    await user.click(await screen.findByText("Disconnect"));

    await waitFor(() => expect(mockDisconnectWalletApi).toHaveBeenCalledWith("jwt-token", "wal_9"));
  });

  it("tells the user when disconnecting fails instead of staying silent", async () => {
    mockDisconnectWalletApi.mockRejectedValue(new Error("Wallet not found"));

    const user = userEvent.setup();
    render(<WalletConnectButton />);
    await user.click(screen.getByRole("button", { name: /GDRX...UJUJ/ }));
    await user.click(await screen.findByText("Disconnect"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Wallet not found");
    expect(mockSetPrimaryWallet).not.toHaveBeenCalled();
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
