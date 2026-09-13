import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderSummaryHeader } from "@/components/orders/OrderSummaryHeader";
import type { Order } from "@/types/order.types";

const ORDER: Order = {
  id: "ord_1",
  buyerId: "usr_buyer",
  sellerId: "usr_seller",
  source: "DIRECT",
  title: "Landing page redesign",
  description: "",
  amount: "450.00",
  status: "IN_PROGRESS",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("OrderSummaryHeader — refresh button", () => {
  it("renders no refresh button when onRefresh is not provided", () => {
    render(<OrderSummaryHeader order={ORDER} statusLabel="In progress" />);
    expect(screen.queryByTitle("Refresh order")).not.toBeInTheDocument();
  });

  it("calls onRefresh when clicked", async () => {
    const onRefresh = vi.fn();
    render(<OrderSummaryHeader order={ORDER} statusLabel="In progress" onRefresh={onRefresh} />);

    await userEvent.click(screen.getByTitle("Refresh order"));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("disables the button and spins the icon while isRefreshing", () => {
    render(
      <OrderSummaryHeader
        order={ORDER}
        statusLabel="In progress"
        onRefresh={vi.fn()}
        isRefreshing
      />,
    );

    const button = screen.getByTitle("Refresh order");
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toHaveClass("animate-spin");
  });
});
