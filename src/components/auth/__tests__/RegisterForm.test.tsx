import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/auth/RegisterForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span>{props.alt}</span>,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/auth/WalletSignInButton", () => ({
  WalletSignInButton: () => <div data-testid="wallet-sign-in">Sign in with wallet</div>,
}));

vi.mock("@/components/auth/SocialAuthButtons", () => ({
  SocialAuthButtons: () => <div>Social auth</div>,
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Email / Password and Connect Wallet tabs", () => {
    render(<RegisterForm />);

    expect(screen.getByRole("tab", { name: "Email / Password" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Connect Wallet" })).toBeInTheDocument();
  });

  it("renders WalletSignInButton on the wallet tab", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("tab", { name: "Connect Wallet" }));

    expect(screen.getByTestId("wallet-sign-in")).toBeInTheDocument();
  });

  it("still mounts the email form", () => {
    render(<RegisterForm />);

    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Choose a username")).toBeInTheDocument();
  });
});
