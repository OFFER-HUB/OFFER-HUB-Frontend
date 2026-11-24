import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("uses the app's inline email error instead of the browser's native tooltip", async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginForm />);

    expect(container.querySelector("form")).toHaveAttribute("novalidate");

    await user.type(screen.getByPlaceholderText("you@example.com"), "john.example.com");
    await user.click(screen.getByRole("button", { name: /sign in|log in/i }));

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });
});
