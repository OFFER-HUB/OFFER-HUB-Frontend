import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServiceActions } from "@/components/services/ServiceActions";
import type { Service } from "@/types/service.types";

const mockService: Service = {
  id: "srv-1",
  userId: "user-1",
  title: "Test Service",
  description: "Description",
  category: "DESIGN",
  price: "100.00",
  deliveryDays: 3,
  status: "ACTIVE",
  totalOrders: 5,
  averageRating: "5.0",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("ServiceActions", () => {
  it("renders edit, pause, and delete buttons for active service", () => {
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();

    render(
      <ServiceActions
        service={mockService}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText("Edit Service")).toBeInTheDocument();
    expect(screen.getByText("Pause Service")).toBeInTheDocument();
    expect(screen.getByText("Delete Service")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Pause Service"));
    expect(onStatusChange).toHaveBeenCalledWith("PAUSED");

    fireEvent.click(screen.getByText("Delete Service"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders activate button for paused service", () => {
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();

    render(
      <ServiceActions
        service={{ ...mockService, status: "PAUSED" }}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText("Activate Service")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Activate Service"));
    expect(onStatusChange).toHaveBeenCalledWith("ACTIVE");
  });
});
