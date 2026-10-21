import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApplicationCard } from "@/components/offers/ApplicationCard";
import type { Application } from "@/types/application.types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockApp: Application = {
  id: "app-1",
  offerId: "offer-1",
  freelancerId: "freelancer-1",
  coverLetter: "I have 5+ years of experience in React and Node.js.",
  proposedRate: 500,
  status: "PENDING",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  offer: {
    id: "offer-1",
    clientId: "client-1",
    title: "Build Marketplace Frontend",
    description: "Looking for an expert Next.js developer.",
    budget: 600,
    status: "OPEN",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  freelancer: {
    id: "freelancer-1",
    email: "john.doe@example.com",
    role: "FREELANCER",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
};

describe("ApplicationCard", () => {
  it("renders client variant by default", () => {
    render(<ApplicationCard application={mockApp} />);

    expect(screen.getByText("john.doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("Proposed Rate: $500")).toBeInTheDocument();
  });

  it("renders freelancer variant with offer details and withdraw button", () => {
    const onWithdraw = vi.fn();
    render(
      <ApplicationCard
        application={mockApp}
        variant="freelancer"
        onWithdraw={onWithdraw}
      />
    );

    expect(screen.getByText("Build Marketplace Frontend")).toBeInTheDocument();
    expect(screen.getByText("Budget: $600")).toBeInTheDocument();
    expect(screen.getByText("Your rate: $500")).toBeInTheDocument();
    expect(screen.getByText("View Offer")).toBeInTheDocument();

    const withdrawBtn = screen.getByText("Withdraw");
    fireEvent.click(withdrawBtn);
    expect(onWithdraw).toHaveBeenCalledWith("app-1");
  });
});
