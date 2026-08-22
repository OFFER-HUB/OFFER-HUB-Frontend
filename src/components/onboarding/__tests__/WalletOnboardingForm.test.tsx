import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletOnboardingForm } from "@/components/onboarding/WalletOnboardingForm";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUpdateProfile = vi.fn();
vi.mock("@/lib/api/profile", () => ({
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  ProfileApiError: class ProfileApiError extends Error {
    code: string;
    status: number;
    constructor(message: string, code: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
}));

let mockUser: {
  id: string;
  username?: string;
  email?: string;
  wallet?: { id: string; publicKey: string; type: string };
} | null = null;
const mockLogin = vi.fn();

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (
    selector: (s: {
      user: typeof mockUser;
      token: string | null;
      login: typeof mockLogin;
    }) => unknown
  ) => selector({ user: mockUser, token: "jwt-token", login: mockLogin }),
}));

let mockModalOnConnected: (() => void) | undefined;
vi.mock("@/components/wallet/WalletConnectModal", () => ({
  WalletConnectModal: ({
    isOpen,
    onConnected,
  }: {
    isOpen: boolean;
    onConnected?: () => void;
  }) => {
    mockModalOnConnected = onConnected;
    return isOpen ? <div data-testid="wallet-connect-modal" /> : null;
  },
}));

async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Jane"), "Jane");
  await user.type(screen.getByPlaceholderText("Doe"), "Doe");
  await user.type(screen.getByPlaceholderText("Costa Rica"), "Costa Rica");
  await user.type(screen.getByPlaceholderText("+506 8888 8888"), "88888888");
}

beforeEach(() => {
  vi.clearAllMocks();
  mockModalOnConnected = undefined;
  mockUser = { id: "usr_1", username: "jane_dev", email: "jane@example.com" };
  mockUpdateProfile.mockResolvedValue({
    firstName: "Jane",
    lastName: "Doe",
    username: "jane_dev",
    type: "BUYER",
  });
});

describe("WalletOnboardingForm — optional wallet step", () => {
  it("offers to connect a wallet after profile submission when the account has none linked", async () => {
    const user = userEvent.setup();
    render(<WalletOnboardingForm />);

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Get started" }));

    await screen.findByText("Connect your wallet");
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip for now" })).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    // The profile update must not reach the store yet: applying it here would
    // flip `user.firstName` away from null, which is exactly the signal
    // OnboardingGuard watches to redirect to /app on its own, racing this
    // step off the screen before the user can act on it.
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("completes onboarding without a wallet when the user skips", async () => {
    const user = userEvent.setup();
    render(<WalletOnboardingForm />);

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Get started" }));

    await user.click(await screen.findByRole("button", { name: "Skip for now" }));

    expect(mockLogin).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Jane", lastName: "Doe" }),
      "jwt-token"
    );
    expect(mockPush).toHaveBeenCalledWith("/app");
  });

  it("completes onboarding once the wallet step reports a successful connection", async () => {
    const user = userEvent.setup();
    render(<WalletOnboardingForm />);

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Get started" }));

    await user.click(await screen.findByRole("button", { name: "Connect wallet" }));
    expect(screen.getByTestId("wallet-connect-modal")).toBeInTheDocument();

    mockModalOnConnected?.();

    expect(mockLogin).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Jane", lastName: "Doe" }),
      "jwt-token"
    );
    expect(mockPush).toHaveBeenCalledWith("/app");
  });

  it("skips the wallet step entirely for a wallet-first account that already has one linked", async () => {
    mockUser = {
      id: "usr_1",
      username: "jane_dev",
      email: "jane@example.com",
      wallet: { id: "wal_1", publicKey: "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ", type: "EXTERNAL" },
    };
    const user = userEvent.setup();
    render(<WalletOnboardingForm />);

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Get started" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/app"));
    expect(screen.queryByText("Connect your wallet")).not.toBeInTheDocument();
  });
});
