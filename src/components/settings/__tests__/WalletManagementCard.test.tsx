import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletManagementCard } from "@/components/settings/WalletManagementCard";

const mockListWallets = vi.fn();
const mockDisconnectWallet = vi.fn();
const mockSetPrimaryWalletApi = vi.fn();

vi.mock("@/lib/api/wallet-connect", () => ({
  listWallets: (...args: unknown[]) => mockListWallets(...args),
  disconnectWallet: (...args: unknown[]) => mockDisconnectWallet(...args),
  setPrimaryWalletApi: (...args: unknown[]) => mockSetPrimaryWalletApi(...args),
  ConnectWalletError: class ConnectWalletError extends Error {
    code: string;
    status: number;
    constructor(message: string, code: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
}));

const mockSetPrimaryWallet = vi.fn();
let mockUser: { wallet?: { id: string } } | null = null;
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (
    selector: (s: {
      token: string | null;
      setPrimaryWallet: typeof mockSetPrimaryWallet;
      user: typeof mockUser;
    }) => unknown
  ) => selector({ token: "jwt-token", setPrimaryWallet: mockSetPrimaryWallet, user: mockUser }),
}));

const PRIMARY = {
  id: "wal_1",
  publicKey: "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ",
  type: "EXTERNAL",
  provider: "STELLAR",
  isPrimary: true,
  isActive: true,
  createdAt: "2026-01-15T00:00:00.000Z",
};

const SECONDARY = {
  id: "wal_2",
  publicKey: "GBUFHWMF2GCVS3MEBM7Q55XR73UHUVI5VYUDHSEXTHAJXORYULOX274N",
  type: "EXTERNAL",
  provider: "STELLAR",
  isPrimary: false,
  isActive: true,
  createdAt: "2026-01-10T00:00:00.000Z",
};

const DISCONNECTED = {
  id: "wal_3",
  publicKey: "GCZXNGBHTZ5W67VJCNLLVHKTCEDUYC6M7KWYPGLIYO3GMQBHZQXRZEJU",
  type: "EXTERNAL",
  provider: "STELLAR",
  isPrimary: false,
  isActive: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUser = null;
});

describe("WalletManagementCard", () => {
  it("renders the full wallet history with primary and active/disconnected badges", async () => {
    mockListWallets.mockResolvedValue([PRIMARY, SECONDARY, DISCONNECTED]);
    render(<WalletManagementCard />);

    await screen.findByText("Primary");
    expect(screen.getAllByText("Active")).toHaveLength(2);
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("shows an empty state when the account has never connected a wallet", async () => {
    mockListWallets.mockResolvedValue([]);
    render(<WalletManagementCard />);

    await screen.findByText("You have not connected a wallet yet.");
  });

  it("sets a secondary wallet as primary and updates the auth store", async () => {
    mockListWallets.mockResolvedValue([PRIMARY, SECONDARY]);
    mockSetPrimaryWalletApi.mockResolvedValue([
      { ...PRIMARY, isPrimary: false },
      { ...SECONDARY, isPrimary: true },
    ]);
    const user = userEvent.setup();
    render(<WalletManagementCard />);

    await screen.findByText("Primary");
    await user.click(screen.getByRole("button", { name: "Set as primary" }));

    await waitFor(() => expect(mockSetPrimaryWalletApi).toHaveBeenCalledWith("jwt-token", "wal_2"));
    expect(mockSetPrimaryWallet).toHaveBeenCalledWith({
      id: "wal_2",
      publicKey: SECONDARY.publicKey,
      type: "EXTERNAL",
    });
  });

  it("requires confirmation before disconnecting a wallet", async () => {
    mockListWallets.mockResolvedValue([SECONDARY]);
    const user = userEvent.setup();
    render(<WalletManagementCard />);

    await screen.findByText("Active");
    await user.click(screen.getByRole("button", { name: "Disconnect" }));

    expect(screen.getByRole("button", { name: "Confirm disconnect" })).toBeInTheDocument();
    expect(mockDisconnectWallet).not.toHaveBeenCalled();
  });

  it("disconnecting the primary wallet clears it from the auth store instead of promoting another", async () => {
    mockListWallets.mockResolvedValue([PRIMARY]);
    mockDisconnectWallet.mockResolvedValue([{ ...PRIMARY, isActive: false, isPrimary: false }]);
    const user = userEvent.setup();
    render(<WalletManagementCard />);

    await screen.findByText("Primary");
    await user.click(screen.getByRole("button", { name: "Disconnect" }));
    await user.click(screen.getByRole("button", { name: "Confirm disconnect" }));

    await waitFor(() => expect(mockDisconnectWallet).toHaveBeenCalledWith("jwt-token", "wal_1"));
    expect(mockSetPrimaryWallet).toHaveBeenCalledWith(undefined);
  });

  it("refetches when the account's primary wallet changes elsewhere (header button, claim flow, etc.)", async () => {
    mockListWallets.mockResolvedValueOnce([]).mockResolvedValueOnce([PRIMARY]);
    const { rerender } = render(<WalletManagementCard />);

    await screen.findByText("You have not connected a wallet yet.");
    expect(mockListWallets).toHaveBeenCalledTimes(1);

    mockUser = { wallet: { id: "wal_1" } };
    rerender(<WalletManagementCard />);

    await waitFor(() => expect(mockListWallets).toHaveBeenCalledTimes(2));
    await screen.findByText("Primary");
  });
});
