import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";

const mockRefreshSupportedWallets = vi.fn();
const mockSetWallet = vi.fn();
const mockFetchAddress = vi.fn();
const mockSignMessage = vi.fn();
const mockDisconnect = vi.fn();

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {
    refreshSupportedWallets: () => mockRefreshSupportedWallets(),
    setWallet: (id: string) => mockSetWallet(id),
    fetchAddress: () => mockFetchAddress(),
    signMessage: (...args: unknown[]) => mockSignMessage(...args),
    disconnect: () => mockDisconnect(),
  },
}));

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span>{props.alt}</span>,
}));

const mockRequestChallenge = vi.fn();
vi.mock("@/services/wallet-auth.service", () => ({
  requestChallenge: (...args: unknown[]) => mockRequestChallenge(...args),
}));

const mockConnectWalletApi = vi.fn();
const mockDisconnectWalletApi = vi.fn();
vi.mock("@/lib/api/wallet-connect", () => ({
  connectWallet: (...args: unknown[]) => mockConnectWalletApi(...args),
  disconnectWallet: (...args: unknown[]) => mockDisconnectWalletApi(...args),
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

const mockConnectWallet = vi.fn();
const mockDisconnectWallet = vi.fn();
const mockSetPrimaryWallet = vi.fn();
let mockToken: string | null = "jwt-token";
let mockUser: { id: string; wallet?: { id: string; publicKey: string; type: string } } | null = null;

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (
    selector: (s: {
      user: typeof mockUser;
      connectWallet: typeof mockConnectWallet;
      disconnectWallet: typeof mockDisconnectWallet;
      setPrimaryWallet: typeof mockSetPrimaryWallet;
      token: string | null;
    }) => unknown
  ) =>
    selector({
      user: mockUser,
      connectWallet: mockConnectWallet,
      disconnectWallet: mockDisconnectWallet,
      setPrimaryWallet: mockSetPrimaryWallet,
      token: mockToken,
    }),
}));

const PUBLIC_KEY = "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ";
const CHALLENGE = "aa".repeat(32);
const SIGNED = "signature==";

const FREIGHTER = {
  id: "freighter",
  name: "Freighter",
  icon: "/freighter.png",
  url: "https://freighter.app",
  isAvailable: true,
};

const LOBSTR_NOT_INSTALLED = {
  id: "lobstr",
  name: "Lobstr",
  icon: "/lobstr.png",
  url: "https://lobstr.co",
  isAvailable: false,
};

function setup() {
  mockToken = "jwt-token";
  mockUser = { id: "usr_1" };
  mockRefreshSupportedWallets.mockResolvedValue([FREIGHTER]);
  mockFetchAddress.mockResolvedValue({ address: PUBLIC_KEY });
  mockRequestChallenge.mockResolvedValue({ challenge: CHALLENGE, expiresIn: 300 });
  mockSignMessage.mockResolvedValue({ signedMessage: SIGNED, signerAddress: PUBLIC_KEY });
  mockDisconnectWalletApi.mockResolvedValue([]);
  mockConnectWalletApi.mockResolvedValue([
    {
      id: "wal_1",
      publicKey: PUBLIC_KEY,
      type: "EXTERNAL",
      provider: "STELLAR",
      isPrimary: true,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ]);
}

beforeEach(() => {
  vi.clearAllMocks();
  setup();
});

describe("WalletConnectModal — persisting the link server-side", () => {
  it("proves ownership and calls POST /wallet/connect before updating local state", async () => {
    const user = userEvent.setup();
    const onConnected = vi.fn();
    render(<WalletConnectModal isOpen onClose={vi.fn()} onConnected={onConnected} />);

    await user.click(await screen.findByRole("button", { name: "Connect Freighter" }));

    await waitFor(() => expect(mockConnectWalletApi).toHaveBeenCalledWith("jwt-token", {
      publicKey: PUBLIC_KEY,
      signature: SIGNED,
      challenge: CHALLENGE,
    }));

    expect(mockSetWallet).toHaveBeenCalledWith("freighter");
    expect(mockRequestChallenge).toHaveBeenCalledWith(PUBLIC_KEY);
    expect(mockSignMessage).toHaveBeenCalledWith(CHALLENGE, { address: PUBLIC_KEY });
  });

  it("reflects the primary wallet from the API response onto the auth store", async () => {
    const user = userEvent.setup();
    render(<WalletConnectModal isOpen onClose={vi.fn()} />);

    await user.click(await screen.findByRole("button", { name: "Connect Freighter" }));

    await waitFor(() =>
      expect(mockSetPrimaryWallet).toHaveBeenCalledWith({
        id: "wal_1",
        publicKey: PUBLIC_KEY,
        type: "EXTERNAL",
      })
    );
  });

  it("still mirrors the connection into local SWK state after a successful link", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<WalletConnectModal isOpen onClose={onClose} />);

    await user.click(await screen.findByRole("button", { name: "Connect Freighter" }));

    await waitFor(() => expect(mockConnectWallet).toHaveBeenCalledWith(PUBLIC_KEY));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not touch local state or close the modal when the backend link fails", async () => {
    mockConnectWalletApi.mockRejectedValue(
      Object.assign(new Error("This wallet is already linked to another account"), {
        code: "WALLET_ALREADY_LINKED",
        status: 409,
      })
    );
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<WalletConnectModal isOpen onClose={onClose} />);

    await user.click(await screen.findByRole("button", { name: "Connect Freighter" }));

    await screen.findByText("This wallet is already linked to another account");
    expect(mockConnectWallet).not.toHaveBeenCalled();
    expect(mockSetPrimaryWallet).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("skips the backend link when there is no auth token yet", async () => {
    mockToken = null;
    const user = userEvent.setup();
    render(<WalletConnectModal isOpen onClose={vi.fn()} />);

    await user.click(await screen.findByRole("button", { name: "Connect Freighter" }));

    await waitFor(() => expect(mockConnectWallet).toHaveBeenCalledWith(PUBLIC_KEY));
    expect(mockConnectWalletApi).not.toHaveBeenCalled();
    expect(mockRequestChallenge).not.toHaveBeenCalled();
  });
});

describe("WalletConnectModal — wallet list rendering", () => {
  it("renders an installed wallet as connectable and a not-installed one as install-only", async () => {
    mockRefreshSupportedWallets.mockResolvedValue([FREIGHTER, LOBSTR_NOT_INSTALLED]);
    render(<WalletConnectModal isOpen onClose={vi.fn()} />);

    expect(await screen.findByRole("button", { name: "Connect Freighter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Install Lobstr" })).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Not installed")).toBeInTheDocument();
  });

  it("opens the install page instead of attempting to connect a not-installed wallet", async () => {
    mockRefreshSupportedWallets.mockResolvedValue([LOBSTR_NOT_INSTALLED]);
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();
    render(<WalletConnectModal isOpen onClose={vi.fn()} />);

    await user.click(await screen.findByRole("button", { name: "Install Lobstr" }));

    expect(openSpy).toHaveBeenCalledWith("https://lobstr.co", "_blank", "noopener,noreferrer");
    expect(mockSetWallet).not.toHaveBeenCalled();
    expect(mockConnectWalletApi).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });
});

describe("WalletConnectModal — display reflects the account, not the browser session", () => {
  const OTHER_ACCOUNTS_KEY = "GBUFHWMF2GCVS3MEBM7Q55XR73UHUVI5VYUDHSEXTHAJXORYULOX274N";

  it("shows the wallet-selection list, not a false \"connected\" state, when the account has no linked wallet", async () => {
    mockUser = { id: "usr_1" }; // no `wallet` — nothing linked to this account
    render(<WalletConnectModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("Connect wallet")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Connect Freighter" })).toBeInTheDocument();
    expect(screen.queryByText("Wallet connected")).not.toBeInTheDocument();
  });

  it("shows connected only once the account's own linked wallet is present, using its address", () => {
    mockUser = { id: "usr_1", wallet: { id: "wal_1", publicKey: OTHER_ACCOUNTS_KEY, type: "EXTERNAL" } };
    render(<WalletConnectModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("Wallet connected")).toBeInTheDocument();
    expect(screen.getByText("GBUFHWMF…ULOX274N")).toBeInTheDocument();
  });

  it("disconnecting calls the backend with the linked wallet's id, then clears it from the store", async () => {
    mockUser = { id: "usr_1", wallet: { id: "wal_1", publicKey: OTHER_ACCOUNTS_KEY, type: "EXTERNAL" } };
    const user = userEvent.setup();
    render(<WalletConnectModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Disconnect" }));

    await waitFor(() => expect(mockDisconnectWalletApi).toHaveBeenCalledWith("jwt-token", "wal_1"));
    expect(mockSetPrimaryWallet).toHaveBeenCalledWith(undefined);
  });
});
