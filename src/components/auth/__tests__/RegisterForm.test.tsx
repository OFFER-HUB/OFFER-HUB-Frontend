import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
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

// Stand-in for Cloudflare's widget: exposes the token callback so a test can
// "pass" the check, and records each mount (a reset remounts it).
const turnstile = vi.hoisted(() => ({
  siteKey: "",
  onTokenChange: null as ((token: string | null) => void) | null,
  mounts: [] as number[],
}));

vi.mock("@/components/auth/TurnstileWidget", () => ({
  turnstileSiteKey: () => turnstile.siteKey,
  TurnstileWidget: ({ onTokenChange, resetKey }: { onTokenChange: (t: string | null) => void; resetKey?: number }) => {
    turnstile.onTokenChange = onTokenChange;
    if (turnstile.mounts.at(-1) !== resetKey) turnstile.mounts.push(resetKey ?? 0);
    return <div data-testid="turnstile-widget" />;
  },
}));

// Generated per run so no credential-looking literal sits in the repo
const TEST_PASSWORD = `Aa1-${crypto.randomUUID()}`;

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

  describe("captcha", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
      turnstile.siteKey = "site-key";
      turnstile.onTokenChange = null;
      turnstile.mounts = [];
      vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
      turnstile.siteKey = "";
      vi.unstubAllGlobals();
      fetchMock.mockReset();
    });

    async function fillForm() {
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText("you@example.com"), "new@example.com");
      await user.type(screen.getByPlaceholderText("Choose a username"), "newbie");
      await user.type(screen.getByPlaceholderText("Create a password"), TEST_PASSWORD);
      await user.type(screen.getByPlaceholderText("Confirm your password"), TEST_PASSWORD);
      return user;
    }

    it("is hidden when no site key is configured", () => {
      turnstile.siteKey = "";
      render(<RegisterForm />);
      expect(screen.queryByTestId("turnstile-widget")).not.toBeInTheDocument();
    });

    it("blocks submitting until the check passes", async () => {
      render(<RegisterForm />);
      const user = await fillForm();

      await user.click(screen.getByRole("button", { name: "Create account" }));

      expect(screen.getByRole("alert")).toHaveTextContent("Please complete the human check");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("sends the token and asks for a new check when the API rejects it", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "CAPTCHA_FAILED", message: "We could not verify you are human." } }), {
          status: 400,
        }),
      );
      render(<RegisterForm />);
      const user = await fillForm();
      act(() => turnstile.onTokenChange?.("tok-1"));

      await user.click(screen.getByRole("button", { name: "Create account" }));

      await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("We could not verify you are human."));
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ captchaToken: "tok-1" });
      // A token works once: the widget was reset for the next try
      expect(turnstile.mounts).toEqual([0, 1]);
    });
  });
});
