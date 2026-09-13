import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppSidebar } from "@/components/app-shell/AppSidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { useChatStore } from "@/stores/chat-store";
import type { User } from "@/types/user.types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/client/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const ADMIN_USER: User = {
  id: "usr_admin_1",
  email: "admin@offerhub.local",
  username: "admin_user",
  type: "BOTH",
  isAdmin: true,
};

const REGULAR_USER: User = {
  id: "usr_1",
  email: "person@offerhub.local",
  username: "person",
  type: "BOTH",
  isAdmin: false,
};

function setUser(user: User) {
  useAuthStore.setState({ user, token: "mock-token", isAuthenticated: true, hasHydrated: true });
}

describe("AppSidebar", () => {
  beforeEach(() => {
    useModeStore.setState({ mode: "client" });
    // Pre-seed so the sidebar's own useEffect doesn't fire a real fetch.
    useChatStore.setState({ conversations: [{ id: "c1", unreadCount: 0 } as any] });
  });

  it("shows only the admin nav for an admin — no marketplace mode toggle, no marketplace links", () => {
    setUser(ADMIN_USER);
    render(<AppSidebar isOpen onClose={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Freelancer" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Client" })).not.toBeInTheDocument();
    expect(screen.queryByText("Manage Offers")).not.toBeInTheDocument();
    expect(screen.queryByText("My Purchases")).not.toBeInTheDocument();
    expect(screen.queryByText("Favorites")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: /analytics/i })).toHaveAttribute("href", "/admin/analytics");
    expect(screen.getByRole("link", { name: /users/i })).toHaveAttribute("href", "/admin/users");
    expect(screen.getByRole("link", { name: /disputes/i })).toHaveAttribute("href", "/admin/disputes");
  });

  it("shows the regular marketplace nav and mode toggle for a non-admin, with no admin section", () => {
    setUser(REGULAR_USER);
    render(<AppSidebar isOpen onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Freelancer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Client" })).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /analytics/i })).not.toBeInTheDocument();
  });
});
