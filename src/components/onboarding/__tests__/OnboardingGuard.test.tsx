import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import { useAuthStore } from "@/stores/auth-store";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockReplace }),
}));

const NEW_USER = {
  id: "usr_1",
  email: "",
  username: "wallet_user",
  firstName: null,
  lastName: null,
  type: "BOTH" as const,
};

const COMPLETE_USER = {
  ...NEW_USER,
  firstName: "Ada",
  lastName: "Lovelace",
};

function resetStore() {
  act(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
    });
  });
}

describe("OnboardingGuard", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    resetStore();
  });

  it("does not redirect before the auth store hydrates", () => {
    render(
      <OnboardingGuard>
        <p>onboarding</p>
      </OnboardingGuard>
    );

    expect(screen.queryByText("onboarding")).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users to login", () => {
    act(() => {
      useAuthStore.setState({ hasHydrated: true, user: null, token: null });
    });

    render(
      <OnboardingGuard>
        <p>onboarding</p>
      </OnboardingGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("onboarding")).toBeNull();
  });

  it("redirects complete profiles to /app", () => {
    act(() => {
      useAuthStore.setState({
        hasHydrated: true,
        user: COMPLETE_USER,
        token: "jwt",
        isAuthenticated: true,
      });
    });

    render(
      <OnboardingGuard>
        <p>onboarding</p>
      </OnboardingGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith("/app");
    expect(screen.queryByText("onboarding")).toBeNull();
  });

  it("renders children for a new wallet user", () => {
    act(() => {
      useAuthStore.setState({
        hasHydrated: true,
        user: NEW_USER,
        token: "jwt",
        isAuthenticated: true,
      });
    });

    render(
      <OnboardingGuard>
        <p>onboarding</p>
      </OnboardingGuard>
    );

    expect(screen.getByText("onboarding")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
