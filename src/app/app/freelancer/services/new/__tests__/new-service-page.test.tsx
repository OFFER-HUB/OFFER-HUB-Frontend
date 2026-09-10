import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
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
      user: { id: "user-1" },
    })
  ),
}));

vi.mock("@/lib/api/services", () => ({
  createService: vi.fn().mockResolvedValue({ id: "created-srv-1" }),
}));

import CreateServicePage from "@/app/app/freelancer/services/new/page";

describe("Create Service Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 2-column layout with preview and checklist", () => {
    render(<CreateServicePage />);

    expect(screen.getByText("Create New Service")).toBeInTheDocument();
    expect(screen.getByText("Marketplace Preview")).toBeInTheDocument();
    expect(screen.getByText("Listing Checklist")).toBeInTheDocument();
    expect(screen.getByText("General Information")).toBeInTheDocument();
  });

  it("updates the live preview card when user types title", () => {
    render(<CreateServicePage />);

    const titleInput = screen.getByLabelText(/Service Title/i);
    fireEvent.change(titleInput, { target: { value: "Full Stack Web Development" } });

    expect(screen.getAllByText("Full Stack Web Development").length).toBeGreaterThanOrEqual(1);
  });
});
