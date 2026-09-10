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

vi.mock("@/stores/mode-store", () => ({
  useModeStore: vi.fn(() => ({
    setMode: vi.fn(),
  })),
}));

vi.mock("@/lib/api/offers", () => ({
  createOffer: vi.fn().mockResolvedValue({ id: "created-offer-1" }),
  uploadAttachment: vi.fn(),
}));

import CreateOfferPage from "@/app/app/client/offers/new/page";

describe("Create Client Offer Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 2-column layout with preview and checklist", () => {
    render(<CreateOfferPage />);

    expect(screen.getByText("Create Job Offer")).toBeInTheDocument();
    expect(screen.getByText("Offer Feed Preview")).toBeInTheDocument();
    expect(screen.getByText("Offer Checklist")).toBeInTheDocument();
    expect(screen.getByText("Visuals & Documents")).toBeInTheDocument();
  });

  it("updates live preview when title is updated", () => {
    render(<CreateOfferPage />);

    const titleInput = screen.getByLabelText(/Offer Title/i);
    fireEvent.change(titleInput, { target: { value: "Build a brand new mobile app" } });

    expect(screen.getAllByText("Build a brand new mobile app").length).toBeGreaterThanOrEqual(1);
  });
});
