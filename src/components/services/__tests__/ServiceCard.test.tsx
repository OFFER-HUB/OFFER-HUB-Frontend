import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { Service } from "@/types/service.types";

const mockService: Service = {
  id: "srv-123",
  userId: "user-1",
  title: "Fullstack Web App Development",
  description: "Next.js and Node.js modern full-stack web application development.",
  category: "WEB_DEVELOPMENT",
  price: "150.00",
  deliveryDays: 5,
  status: "ACTIVE",
  totalOrders: 12,
  averageRating: "4.9",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("ServiceCard", () => {
  it("renders service details correctly", () => {
    const onDelete = vi.fn();
    render(<ServiceCard service={mockService} onDelete={onDelete} />);

    expect(screen.getByText("Fullstack Web App Development")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("5d")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("triggers onDelete callback when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(<ServiceCard service={mockService} onDelete={onDelete} />);

    const deleteBtn = screen.getByTitle("Delete Service");
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith("srv-123", "Fullstack Web App Development");
  });
});
