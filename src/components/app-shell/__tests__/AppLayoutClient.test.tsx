import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let mockPathname = "/app/client/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/stores/auth-store", () => {
  const state = {
    hasHydrated: true,
    token: "jwt",
    user: { id: "usr_1", email: "a@b.co", username: "ada", isEmailVerified: true },
  };
  const useAuthStore = (selector: (s: typeof state) => unknown) => selector(state);
  useAuthStore.setState = vi.fn();
  return { useAuthStore };
});
vi.mock("@/lib/auth/is-new-user", () => ({ isNewUser: () => false }));
vi.mock("@/hooks/use-has-mounted", () => ({ useHasMounted: () => true }));
vi.mock("@/lib/api/auth", () => ({ sendVerification: vi.fn() }));

vi.mock("@/components/onboarding", () => ({ OnboardingTour: () => null }));
vi.mock("@/components/notifications/NotificationToastContainer", () => ({
  NotificationToastContainer: () => null,
}));
vi.mock("@/components/auth/EmailVerificationBanner", () => ({ EmailVerificationBanner: () => null }));
vi.mock("@/components/wallet/WalletConnectionBanner", () => ({ WalletConnectionBanner: () => null }));
vi.mock("@/components/wallet/CustodialWindowBanner", () => ({ CustodialWindowBanner: () => null }));
vi.mock("@/components/app-shell", () => ({
  AppHeader: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <button type="button" onClick={onMenuClick}>Toggle menu</button>
  ),
  AppSidebar: ({ isOpen }: { isOpen: boolean }) => (
    <aside data-testid="sidebar" data-open={String(isOpen)} />
  ),
}));

import { AppLayoutClient } from "../AppLayoutClient";

type MediaListener = () => void;
let mediaListeners: MediaListener[] = [];

beforeEach(() => {
  mockPathname = "/app/client/dashboard";
  mediaListeners = [];
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: (_: string, cb: MediaListener) => mediaListeners.push(cb),
      removeEventListener: (_: string, cb: MediaListener) => {
        mediaListeners = mediaListeners.filter((l) => l !== cb);
      },
    })),
  );
});

describe("AppLayoutClient mobile menu", () => {
  it("keeps the shell on the dynamic viewport height class", () => {
    const { container } = render(<AppLayoutClient>page</AppLayoutClient>);
    expect(container.firstElementChild).toHaveClass("app-shell-height");
  });

  it("closes the menu when the page changes, so it cannot cover the next page", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AppLayoutClient>page</AppLayoutClient>);

    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");

    mockPathname = "/app/client/offers";
    rerender(<AppLayoutClient>page</AppLayoutClient>);

    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");
  });

  it("resets the menu when the viewport crosses the desktop breakpoint (rotation)", async () => {
    const user = userEvent.setup();
    render(<AppLayoutClient>page</AppLayoutClient>);

    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");

    act(() => {
      mediaListeners.forEach((cb) => cb());
    });

    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");
  });

  it("can open the menu again after rotating", async () => {
    const user = userEvent.setup();
    render(<AppLayoutClient>page</AppLayoutClient>);

    act(() => {
      mediaListeners.forEach((cb) => cb());
    });
    await user.click(screen.getByRole("button", { name: "Toggle menu" }));

    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");
  });
});
