import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

let mockModalIsOpen = false;
vi.mock("@/components/wallet/WalletConnectModal", () => ({
  WalletConnectModal: ({ isOpen }: { isOpen: boolean }) => {
    mockModalIsOpen = isOpen;
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
  mockModalIsOpen = false;
  mockUser = { id: "usr_1", username: "jane_dev", email: "jane@example.com" };
  mockUpdateProfile.mockResolvedValue({
    firstName: "Jane",
    lastName: "Doe",
    username: "jane_dev",
    type: "BUYER",
  });
});

describe("WalletOnboardingForm inline optional wallet connect", () => {
  it("shows a Connect wallet option alongside the profile fields when the account has no wallet linked", () => {
    render(<WalletOnboardingForm />);

    expect(screen.getByText("Connect a wallet")).toBeInTheDocument();
    expect(screen.getByText("(Freighter, Lobstr, xBull)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
  });

  it("opens WalletConnectModal without submitting the profile or navigating", async () => {
    const user = userEvent.setup();
    render(<WalletOnboardingForm />);

    await user.click(screen.getByRole("button", { name: "Connect wallet" }));

    expect(mockModalIsOpen).toBe(true);
    expect(screen.getByTestId("wallet-connect-modal")).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not render the Connect wallet option for an account that already has one linked", () => {
    mockUser = {
      id: "usr_1",
      username: "jane_dev",
      email: "jane@example.com",
      wallet: { id: "wal_1", publicKey: "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ", type: "EXTERNAL" },
    };
    render(<WalletOnboardingForm />);

    expect(screen.queryByText("Connect a wallet")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect wallet" })).not.toBeInTheDocument();
  });

  it("submits the profile and redirects to /app immediately regardless of the wallet section", async () => {
    const user = userEvent.setup();
    render(<WalletOnboardingForm />);

    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Get started" }));

    expect(mockLogin).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Jane", lastName: "Doe" }),
      "jwt-token"
    );
    expect(mockPush).toHaveBeenCalledWith("/app");
  });

  it("submits and redirects the same way for a wallet-first account that already has one linked", async () => {
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

    expect(mockPush).toHaveBeenCalledWith("/app");
  });
});
