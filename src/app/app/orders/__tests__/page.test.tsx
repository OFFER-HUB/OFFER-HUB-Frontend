import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrdersPage from "@/app/app/orders/page";
import { useAuthStore } from "@/stores/auth-store";
import { listOrders } from "@/lib/api/orders";
import type { Order } from "@/types/order.types";

vi.mock("@/lib/api/orders", () => ({
  listOrders: vi.fn(),
}));

const MOCK_BUYER_ORDER: Order = {
  id: "ord_buyer_1",
  buyerId: "user_me",
  sellerId: "user_freelancer",
  source: "SERVICE",
  title: "Website Development Contract",
  description: "Full stack web app",
  amount: "1500.00",
  status: "IN_PROGRESS",
  createdAt: "2026-09-10T12:00:00.000Z",
  updatedAt: "2026-09-10T12:00:00.000Z",
  seller: {
    id: "user_freelancer",
    email: "dev@example.com",
    name: "John Developer",
  },
  escrow: {
    id: "escrow_1",
    status: "FUNDED",
    trustlessContractId: "CC123",
  },
};

const MOCK_SELLER_ORDER: Order = {
  id: "ord_seller_2",
  buyerId: "user_client",
  sellerId: "user_me",
  source: "DIRECT",
  title: "UI Design System",
  description: "Figma design system",
  amount: "800.00",
  status: "CLOSED",
  createdAt: "2026-09-08T12:00:00.000Z",
  updatedAt: "2026-09-09T12:00:00.000Z",
  buyer: {
    id: "user_client",
    email: "client@example.com",
    name: "Sarah Client",
  },
};

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      token: "jwt_token",
      user: {
        id: "user_me",
        email: "me@example.com",
        username: "me",
        firstName: "Me",
        lastName: "User",
        type: "BOTH",
        isAdmin: false,
      },
      isAuthenticated: true,
      hasHydrated: true,
    });

    (listOrders as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (_token, _userId, filters) => {
        if (filters?.role === "buyer") return Promise.resolve([MOCK_BUYER_ORDER]);
        if (filters?.role === "seller") return Promise.resolve([MOCK_SELLER_ORDER]);
        return Promise.resolve([]);
      }
    );
  });

  it("renders page header and both purchases and sales in All Orders view", async () => {
    render(<OrdersPage />);

    expect(screen.getByRole("heading", { name: "My Orders" })).toBeInTheDocument();
    expect(await screen.findByText("Website Development Contract")).toBeInTheDocument();
    expect(screen.getByText("UI Design System")).toBeInTheDocument();
  });

  it("renders alert banner when active orders exist and allows filtering to active orders", async () => {
    render(<OrdersPage />);

    expect(await screen.findByText(/you have 1 active order in progress/i)).toBeInTheDocument();

    const viewActiveButton = screen.getByRole("button", { name: /view active orders/i });
    await userEvent.click(viewActiveButton);

    expect(await screen.findByText("Website Development Contract")).toBeInTheDocument();
    expect(screen.queryByText("UI Design System")).not.toBeInTheDocument();
  });

  it("filters orders by Purchases and Sales tabs", async () => {
    render(<OrdersPage />);

    // Click My Purchases
    const purchasesTab = await screen.findByRole("button", { name: /my purchases/i });
    await userEvent.click(purchasesTab);

    expect(await screen.findByText("Website Development Contract")).toBeInTheDocument();
    expect(screen.queryByText("UI Design System")).not.toBeInTheDocument();

    // Click My Sales
    const salesTab = screen.getByRole("button", { name: /my sales/i });
    await userEvent.click(salesTab);

    expect(await screen.findByText("UI Design System")).toBeInTheDocument();
    expect(screen.queryByText("Website Development Contract")).not.toBeInTheDocument();
  });
});
