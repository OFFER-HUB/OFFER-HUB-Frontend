import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "@/components/auth/LoginForm";

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

describe("LoginForm", () => {
  it("mounts the email form and wallet tab", () => {
    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Connect Wallet" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });
});
