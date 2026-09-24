import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      token: "test-token",
      user: { id: "user-1", email: "freelancer@test.com" },
    })
  ),
}));

vi.mock("@/lib/api/services", () => ({
  getMyServices: vi.fn(),
  deleteService: vi.fn(),
}));

import { getMyServices } from "@/lib/api/services";
import ServicesPage from "@/app/app/freelancer/services/page";

describe("Freelancer Services Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header and KPI stat cards when services load", async () => {
    (getMyServices as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: "srv-1",
        title: "Full Stack Next.js Development",
        description: "High performance apps with clean neumorphic design.",
        category: "WEB_DEVELOPMENT",
        price: "150.00",
        deliveryDays: 5,
        status: "ACTIVE",
        totalOrders: 12,
        averageRating: "4.9",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    render(<ServicesPage />);

    await waitFor(() => {
      expect(screen.getByText("My Services")).toBeInTheDocument();
      expect(screen.getByText("Total Services")).toBeInTheDocument();
      expect(screen.getByText("Active Listings")).toBeInTheDocument();
      expect(screen.getByText("Full Stack Next.js Development")).toBeInTheDocument();
      expect(screen.getByText("$150.00")).toBeInTheDocument();
    });
  });

  it("renders empty state when user has no services", async () => {
    (getMyServices as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    render(<ServicesPage />);

    await waitFor(() => {
      expect(screen.getByText("No services yet")).toBeInTheDocument();
      expect(screen.getByText("Create Your First Service")).toBeInTheDocument();
    });
  });
});
