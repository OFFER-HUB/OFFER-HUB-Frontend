import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "@/app/admin/page";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user.types";
import type { AdminAnalyticsData } from "@/types/admin-analytics.types";

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

vi.mock("@/lib/api/admin-analytics", () => ({
  getAdminAnalytics: vi.fn(),
}));

import { getAdminAnalytics } from "@/lib/api/admin-analytics";

const BASE_USER: User = {
  id: "usr_admin_1",
  email: "admin@offerhub.local",
  username: "admin_user",
  type: "BOTH",
};

const MOCK_ANALYTICS: AdminAnalyticsData = {
  period: { from: "2026-08-13", to: "2026-09-12" },
  stats: {
    totalUsers: 103,
    activeUsers: 80,
    newUsers: 10,
    newUsersChangePercent: 25,
    totalOrders: 42,
    completedOrders: 30,
    ordersChangePercent: 12,
    transactionVolume: 5400,
    volumeChangePercent: 8,
    averageOrderValue: 128,
    openDisputes: 3,
    disputeRate: 7.1,
    withdrawalsVolume: 900,
  },
  trends: [],
  categories: [],
};

function setSession(user: User | null, hasHydrated: boolean) {
  useAuthStore.setState({
    user,
    token: user ? "mock-jwt-token" : null,
    isAuthenticated: user !== null,
    hasHydrated,
  });
}

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAdminAnalytics as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ANALYTICS);
  });

  it("redirects a signed-out visitor to /login", () => {
    setSession(null, true);
    render(<AdminDashboardPage />);

    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(screen.getByText(/checking permissions/i)).toBeInTheDocument();
    expect(getAdminAnalytics).not.toHaveBeenCalled();
  });

  it("redirects a signed-in non-admin to /app/client/dashboard", () => {
    setSession({ ...BASE_USER, isAdmin: false }, true);
    render(<AdminDashboardPage />);

    expect(mockReplace).toHaveBeenCalledWith("/app/client/dashboard");
    expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
  });

  it("greets an admin by name and shows quick actions for Users, Disputes, and Analytics", async () => {
    setSession({ ...BASE_USER, firstName: "Ada", lastName: "Lovelace", isAdmin: true }, true);
    render(<AdminDashboardPage />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(await screen.findByText("Welcome back, Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /users/i })).toHaveAttribute("href", "/admin/users");
    expect(screen.getByRole("link", { name: /disputes/i })).toHaveAttribute("href", "/admin/disputes");
    expect(screen.getByRole("link", { name: /analytics/i })).toHaveAttribute("href", "/admin/analytics");
  });

  it("renders the platform stats once analytics data loads", async () => {
    setSession({ ...BASE_USER, isAdmin: true }, true);
    render(<AdminDashboardPage />);

    expect(await screen.findByText("103")).toBeInTheDocument(); // totalUsers, formatted
  });
});
