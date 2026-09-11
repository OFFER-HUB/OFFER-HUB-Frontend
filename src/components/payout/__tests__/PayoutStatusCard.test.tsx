import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { PayoutStatusCard } from "@/components/payout/PayoutStatusCard";

const mockGetPayoutStatus = vi.fn();

vi.mock("@/lib/api/orders", () => ({
  getPayoutStatus: (...args: unknown[]) => mockGetPayoutStatus(...args),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) => selector({ token: "jwt-token" }),
}));

let mockConnectedWalletAddress: string | null = "GSELLERADDRESS";
vi.mock("@/hooks/use-wallet-kit", () => ({
  useWalletKit: () => ({ address: mockConnectedWalletAddress }),
}));

const mockSign = vi.fn();
const mockReset = vi.fn();
let mockSigningState: "idle" | "building" | "awaiting_signature" | "submitting" | "confirmed" | "error" = "idle";
let mockPrepared: { fiatAmount: string; fiatCurrency: string; expiresAt: number } | null = null;

vi.mock("@/hooks/usePayoutSigning", () => ({
  usePayoutSigning: () => ({
    state: mockSigningState,
    sign: mockSign,
    reset: mockReset,
    prepared: mockPrepared,
    error: null,
  }),
}));

vi.mock("@/hooks/useEscrowSigningAction", () => ({
  currentWalletName: () => null,
}));

// Neither the escrow nor the wallet-connect modal is under test here — both
// depend on the real Stellar Wallets Kit tree, which this suite otherwise
// avoids importing (see useEscrowSigningAction.test.ts for the same pattern).
vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {},
}));

const PENDING_PAYOUT = {
  id: "pay_1",
  userId: "usr_1",
  orderId: "order_1",
  bankAccountId: "ba_1",
  blindpayPayoutId: null,
  corridor: "MX/SPEI_BITSO",
  status: "PENDING",
  usdcAmount: "100.00",
  fiatAmount: null,
  fiatCurrency: "MXN",
  exchangeRate: null,
  failureReason: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  mockConnectedWalletAddress = "GSELLERADDRESS";
  mockSigningState = "idle";
  mockPrepared = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PayoutStatusCard", () => {
  it("shows the corridor label and Pending step for a fresh payout", async () => {
    mockGetPayoutStatus.mockResolvedValue(PENDING_PAYOUT);
    render(<PayoutStatusCard orderId="order_1" />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Mexico — SPEI")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows a visible 'preparing' state (not a blank gap) while the payout row does not exist yet (404), then keeps polling", async () => {
    const notFound = Object.assign(new Error("No payout found"), { status: 404 });
    mockGetPayoutStatus.mockRejectedValueOnce(notFound).mockResolvedValueOnce(PENDING_PAYOUT);

    const { container } = render(<PayoutStatusCard orderId="order_1" />);

    await act(async () => {
      await Promise.resolve();
    });
    // The card must render *something* here — a 404 used to make the
    // component return null, leaving a blank gap that read as broken.
    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByText("Preparing your payout...")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockGetPayoutStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(mockGetPayoutStatus).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("polls every 5s while PROCESSING and stops once COMPLETED", async () => {
    mockGetPayoutStatus
      .mockResolvedValueOnce({ ...PENDING_PAYOUT, status: "PROCESSING" })
      .mockResolvedValueOnce({ ...PENDING_PAYOUT, status: "COMPLETED", fiatAmount: "1850.00" });

    render(<PayoutStatusCard orderId="order_1" />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockGetPayoutStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(mockGetPayoutStatus).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/deposited to your bank account/)).toBeInTheDocument();

    // Stopped: no further calls even after another interval elapses.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mockGetPayoutStatus).toHaveBeenCalledTimes(2);
  });

  it("shows the failure reason and a Contact Support link on FAILED, and stops polling", async () => {
    mockGetPayoutStatus.mockResolvedValue({
      ...PENDING_PAYOUT,
      status: "FAILED",
      failureReason: "BlindPay rejected the destination account",
    });

    render(<PayoutStatusCard orderId="order_1" />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("BlindPay rejected the destination account")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contact Support/ })).toHaveAttribute("href", "/app/chat");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mockGetPayoutStatus).toHaveBeenCalledTimes(1);
  });

  it("shows an inline error and stops polling on a non-404 failure", async () => {
    mockGetPayoutStatus.mockRejectedValue(new Error("Network error"));

    render(<PayoutStatusCard orderId="order_1" />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Network error")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mockGetPayoutStatus).toHaveBeenCalledTimes(1);
  });

  it("shows a Sign & Send CTA with the quoted fiat amount for AWAITING_SIGNATURE", async () => {
    mockGetPayoutStatus.mockResolvedValue({ ...PENDING_PAYOUT, status: "AWAITING_SIGNATURE" });
    mockPrepared = { fiatAmount: "1850.00", fiatCurrency: "MXN", expiresAt: Date.now() + 90_000 };

    render(<PayoutStatusCard orderId="order_1" />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Your signature is needed")).toBeInTheDocument();
    expect(screen.getByText(/Sending as/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign & Send/ })).toBeInTheDocument();
  });

  it("signs directly when a wallet is already connected", async () => {
    mockGetPayoutStatus.mockResolvedValue({ ...PENDING_PAYOUT, status: "AWAITING_SIGNATURE" });

    render(<PayoutStatusCard orderId="order_1" />);
    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign & Send/ }));

    expect(mockSign).toHaveBeenCalledWith("order_1");
  });

  it("clears the interval on unmount", async () => {
    mockGetPayoutStatus.mockResolvedValue(PENDING_PAYOUT);
    const { unmount } = render(<PayoutStatusCard orderId="order_1" />);

    await act(async () => {
      await Promise.resolve();
    });
    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });
    expect(mockGetPayoutStatus).toHaveBeenCalledTimes(1);
  });
});
