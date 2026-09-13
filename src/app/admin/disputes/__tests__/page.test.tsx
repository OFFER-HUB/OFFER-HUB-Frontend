import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDisputesPage from "@/app/admin/disputes/page";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user.types";
import type { AdminDispute } from "@/types/admin.types";

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

vi.mock("@/lib/api/admin-disputes", () => ({
  getAdminDisputes: vi.fn(),
}));

import { getAdminDisputes } from "@/lib/api/admin-disputes";

const BASE_USER: User = {
  id: "usr_admin_1",
  email: "admin@offerhub.local",
  username: "admin_user",
  type: "BOTH",
};

const MOCK_DISPUTE: AdminDispute = {
  id: "dsp_101",
  orderId: "ord_101",
  openedBy: "BUYER",
  reason: "QUALITY_ISSUE",
  evidence: [],
  status: "OPEN",
  resolutionDecision: null,
  decisionNote: null,
  createdAt: "2026-09-12T10:00:00.000Z",
  updatedAt: "2026-09-12T10:00:00.000Z",
  order: {
    id: "ord_101",
    title: "Fullstack SaaS App",
    description: "Build Next.js + Soroban integration",
    amount: "500.00",
    currency: "USD",
    status: "DISPUTED",
    buyerId: "usr_buyer",
    sellerId: "usr_seller",
    buyer: { id: "usr_buyer", email: "buyer@example.com" },
    seller: { id: "usr_seller", email: "seller@example.com" },
    service: null,
    escrow: null,
    milestones: [],
    createdAt: "2026-09-11T10:00:00.000Z",
  },
};

function setSession(user: User | null, hasHydrated: boolean) {
  useAuthStore.setState({
    user,
    token: user ? "mock-jwt-token" : null,
    isAuthenticated: user !== null,
    hasHydrated,
  });
}

describe("AdminDisputesPage — Route Guard & Access Control (#448)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAdminDisputes as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      disputes: [MOCK_DISPUTE],
      hasMore: false,
    });
  });

  it("redirects a signed-out visitor to /login and keeps disputes data hidden", () => {
    setSession(null, true);
    render(<AdminDisputesPage />);

    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(screen.getByText(/checking permissions/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Disputes" })).not.toBeInTheDocument();
    expect(getAdminDisputes).not.toHaveBeenCalled();
  });

  it("redirects a signed-in non-admin to /app/client/dashboard", () => {
    setSession({ ...BASE_USER, isAdmin: false }, true);
    render(<AdminDisputesPage />);

    expect(mockReplace).toHaveBeenCalledWith("/app/client/dashboard");
    expect(screen.getByText(/checking permissions/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Disputes" })).not.toBeInTheDocument();
    expect(getAdminDisputes).not.toHaveBeenCalled();
  });

  it("treats a user without an isAdmin flag as non-admin and redirects", () => {
    setSession(BASE_USER, true);
    render(<AdminDisputesPage />);

    expect(mockReplace).toHaveBeenCalledWith("/app/client/dashboard");
    expect(screen.queryByRole("heading", { name: "Disputes" })).not.toBeInTheDocument();
    expect(getAdminDisputes).not.toHaveBeenCalled();
  });

  it("allows an admin (isAdmin: true) to reach the page and renders the disputes dashboard", async () => {
    setSession({ ...BASE_USER, isAdmin: true }, true);
    render(<AdminDisputesPage />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(await screen.findByRole("heading", { name: "Disputes" })).toBeInTheDocument();
    expect(screen.getByText("Review and resolve platform disputes")).toBeInTheDocument();
    expect(await screen.findByText("Fullstack SaaS App")).toBeInTheDocument();
    expect(screen.getByText("buyer@example.com")).toBeInTheDocument();
    expect(screen.getByText("$500.00 USD")).toBeInTheDocument();
  });

  it("allows an admin to navigate to dispute detail view from the table", async () => {
    setSession({ ...BASE_USER, isAdmin: true }, true);
    render(<AdminDisputesPage />);

    const viewButton = await screen.findByRole("button", {
      name: "View dispute for Fullstack SaaS App",
    });
    await userEvent.click(viewButton);

    expect(mockPush).toHaveBeenCalledWith(`/admin/disputes/${MOCK_DISPUTE.id}`);
  });
});
