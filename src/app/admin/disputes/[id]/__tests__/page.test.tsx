import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminDisputeDetailPage from "@/app/admin/disputes/[id]/page";
import type { AdminDispute } from "@/types/admin.types";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "dsp_1" }),
}));

vi.mock("@/hooks/useAdminGuard", () => ({
  useAdminGuard: () => true,
}));

const mockUseAdminDispute = vi.fn();
vi.mock("@/hooks/useAdminDispute", () => ({
  useAdminDispute: (...args: unknown[]) => mockUseAdminDispute(...args),
}));

const BASE_DISPUTE: AdminDispute = {
  id: "dsp_1",
  orderId: "ord_1",
  openedBy: "BUYER",
  reason: "NOT_DELIVERED",
  evidence: [],
  status: "OPEN",
  resolutionDecision: null,
  decisionNote: null,
  createdAt: "2026-09-12T08:00:00.000Z",
  updatedAt: "2026-09-12T08:00:00.000Z",
  order: {
    id: "ord_1",
    title: "Brand Identity Design",
    description: "Complete design kit",
    amount: "300.00",
    currency: "USD",
    status: "DISPUTED",
    buyerId: "usr_buyer_1",
    sellerId: "usr_seller_1",
    buyer: { id: "usr_buyer_1", email: "client@brand.io" },
    seller: { id: "usr_seller_1", email: "agency@studio.design" },
    service: null,
    escrow: null,
    milestones: [],
    createdAt: "2026-09-10T10:00:00.000Z",
  },
};

function mockDetail(dispute: AdminDispute) {
  mockUseAdminDispute.mockReturnValue({
    dispute,
    isLoading: false,
    error: null,
    isActing: false,
    refetch: vi.fn(),
    takeForReview: vi.fn(),
    resolve: vi.fn(),
  });
}

describe("AdminDisputeDetailPage — evidence rendering", () => {
  it("renders the empty-evidence message when evidence is an empty array", () => {
    mockDetail(BASE_DISPUTE);
    render(<AdminDisputeDetailPage />);
    expect(screen.getByText(/no evidence was attached/i)).toBeInTheDocument();
  });

  it("does not crash when evidence is null — the backend omits it rather than sending []", () => {
    mockDetail({ ...BASE_DISPUTE, evidence: null });
    render(<AdminDisputeDetailPage />);
    expect(screen.getByText(/no evidence was attached/i)).toBeInTheDocument();
  });

  it("lists evidence URLs when present", () => {
    mockDetail({ ...BASE_DISPUTE, evidence: ["https://example.com/proof.png"] });
    render(<AdminDisputeDetailPage />);
    expect(screen.getByText("https://example.com/proof.png")).toBeInTheDocument();
  });
});
