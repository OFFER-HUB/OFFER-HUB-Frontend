import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpenDisputeModal } from "@/components/orders/OpenDisputeModal";
import AdminDisputesPage from "@/app/admin/disputes/page";
import { DisputeResolutionForm } from "@/components/admin/disputes/DisputeResolutionForm";
import { OrderSummaryHeader } from "@/components/orders/OrderSummaryHeader";
import { BuyerActionPanel } from "@/components/orders/BuyerActionPanel";
import { SellerStatusPanel } from "@/components/orders/SellerStatusPanel";
import { resolveOrderStep } from "@/constants/order-steps";
import { useAuthStore } from "@/stores/auth-store";
import type { Order, OrderStatus } from "@/types/order.types";
import type { AdminDispute, ResolveDisputePayload } from "@/types/admin.types";

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

vi.mock("@/lib/api/admin-disputes", () => ({
  getAdminDisputes: vi.fn(),
  resolveDispute: vi.fn(),
}));

import { getAdminDisputes, resolveDispute } from "@/lib/api/admin-disputes";

const noop = () => {};

const BASE_ORDER: Order = {
  id: "ord_integration_448",
  buyerId: "usr_buyer_1",
  sellerId: "usr_seller_1",
  source: "DIRECT",
  title: "Brand Identity Design",
  description: "Complete design kit for new branding launch",
  amount: "300.00",
  status: "IN_PROGRESS",
  createdAt: "2026-09-10T10:00:00.000Z",
  updatedAt: "2026-09-10T10:00:00.000Z",
  buyer: { id: "usr_buyer_1", email: "client@brand.io", username: "brand_client" },
  seller: { id: "usr_seller_1", email: "agency@studio.design", username: "design_agency" },
  milestones: [
    { id: "m1", orderId: "ord_integration_448", title: "Concept Sketches", amount: "100.00", status: "COMPLETED", description: "" },
    { id: "m2", orderId: "ord_integration_448", title: "Final Vectors & Guidelines", amount: "200.00", status: "OPEN", description: "" },
  ],
};

const BASE_DISPUTE: AdminDispute = {
  id: "dsp_integration_448",
  orderId: BASE_ORDER.id,
  openedBy: "BUYER",
  reason: "NOT_DELIVERED",
  evidence: [],
  status: "OPEN",
  resolutionDecision: null,
  decisionNote: null,
  createdAt: "2026-09-12T08:00:00.000Z",
  updatedAt: "2026-09-12T08:00:00.000Z",
  order: {
    id: BASE_ORDER.id,
    title: BASE_ORDER.title,
    description: BASE_ORDER.description,
    amount: BASE_ORDER.amount,
    currency: "USD",
    status: "DISPUTED",
    buyerId: BASE_ORDER.buyerId,
    sellerId: BASE_ORDER.sellerId,
    buyer: { id: "usr_buyer_1", email: "client@brand.io" },
    seller: { id: "usr_seller_1", email: "agency@studio.design" },
    service: null,
    escrow: null,
    milestones: [
      { id: "m1", title: "Concept Sketches", amount: "100.00", status: "COMPLETED" },
      { id: "m2", title: "Final Vectors & Guidelines", amount: "200.00", status: "OPEN" },
    ],
    createdAt: BASE_ORDER.createdAt,
  },
};

const BUYER_PANEL_PROPS = {
  amount: "300.00",
  isWorkCompleted: false,
  isProcessing: false,
  onConfirmOrder: noop,
  onCancelOrder: noop,
  onStartSecurePayment: noop,
  onSignFundEscrow: noop,
  onRequestRelease: noop,
  onRequestDispute: noop,
  onRequestRefund: noop,
};

const SELLER_PANEL_PROPS = {
  isWorkCompleted: false,
  isProcessing: false,
  onMarkCompleted: noop,
  onRequestDispute: noop,
};

describe("Dispute & Refund Lifecycle Integration Flow (#448)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("executes the full cycle: buyer opens dispute → admin inspects dashboard → admin resolves → parties see settled order", async () => {
    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 1: Buyer opens a dispute on an IN_PROGRESS order
    // ══════════════════════════════════════════════════════════════════════════
    const onDisputeSubmit = vi.fn().mockResolvedValue(undefined);
    const { unmount: unmountModal } = render(
      <OpenDisputeModal
        isOpen={true}
        orderTitle={BASE_ORDER.title}
        onClose={noop}
        onSubmit={onDisputeSubmit}
      />
    );

    expect(screen.getByText("Open a Dispute")).toBeInTheDocument();
    expect(screen.getByText(BASE_ORDER.title)).toBeInTheDocument();

    // Select reason
    await userEvent.selectOptions(screen.getByRole("combobox"), "NOT_DELIVERED");

    // Enter detailed reason (> 20 chars)
    const reasonText = "The specialist went completely dark and stopped submitting deliverables.";
    await userEvent.type(screen.getByPlaceholderText(/describe the issue in detail/i), reasonText);

    // Click Continue -> activates the caution warning step
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText(/important warning/i)).toBeInTheDocument();
    expect(screen.getByText(/opening a dispute will freeze all funds/i)).toBeInTheDocument();

    // Confirm & Open Dispute
    await userEvent.click(screen.getByRole("button", { name: /confirm & open dispute/i }));
    expect(onDisputeSubmit).toHaveBeenCalledWith("NOT_DELIVERED", reasonText);

    // Success screen confirmed
    expect(await screen.findByText("Dispute Opened")).toBeInTheDocument();
    unmountModal();

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 2: Admin views the new dispute on the Admin Dashboard
    // ══════════════════════════════════════════════════════════════════════════
    useAuthStore.setState({
      user: { id: "usr_admin", email: "admin@platform.io", username: "admin", type: "BOTH", isAdmin: true },
      token: "valid-admin-jwt",
      isAuthenticated: true,
      hasHydrated: true,
    });

    (getAdminDisputes as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      disputes: [BASE_DISPUTE],
      hasMore: false,
    });

    const { unmount: unmountAdminList } = render(<AdminDisputesPage />);

    expect(await screen.findByRole("heading", { name: "Disputes" })).toBeInTheDocument();
    expect(await screen.findByText("Brand Identity Design")).toBeInTheDocument();
    expect(screen.getByText("client@brand.io")).toBeInTheDocument();
    expect(screen.getByText("$300.00 USD")).toBeInTheDocument();
    expect(screen.getByText("Not delivered")).toBeInTheDocument();
    expect(screen.getAllByText("Open").length).toBeGreaterThanOrEqual(1);

    unmountAdminList();

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 3: Admin reviews and resolves dispute with proportional SPLIT
    // ══════════════════════════════════════════════════════════════════════════
    const underReviewDispute: AdminDispute = {
      ...BASE_DISPUTE,
      status: "UNDER_REVIEW",
    };

    const onResolveSubmit = vi.fn().mockImplementation(async (payload: ResolveDisputePayload) => {
      await resolveDispute("valid-admin-jwt", underReviewDispute.id, payload);
    });

    (resolveDispute as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...underReviewDispute,
      status: "RESOLVED",
      resolutionDecision: "SPLIT",
      decisionNote: "Concept completed ($100 to seller), remainder refunded ($200 to buyer).",
    });

    const { unmount: unmountResolveForm } = render(
      <DisputeResolutionForm
        dispute={underReviewDispute}
        onSubmit={onResolveSubmit}
        onCancel={noop}
      />
    );

    // Verify proportional split pre-fill from completed vs open milestones
    expect(screen.getByLabelText(/release to seller \(usd\)/i)).toHaveValue("100.00");
    expect(screen.getByLabelText(/refund to buyer \(usd\)/i)).toHaveValue("200.00");
    expect(screen.getByText(/1 of 2 completed/)).toBeInTheDocument();

    // Type decision note and resolve
    await userEvent.type(
      screen.getByLabelText(/decision note/i),
      "Concept completed ($100 to seller), remainder refunded ($200 to buyer)."
    );

    const resolveButton = screen.getByRole("button", { name: /resolve dispute/i });
    expect(resolveButton).toBeEnabled();
    await userEvent.click(resolveButton);

    await waitFor(() => {
      expect(onResolveSubmit).toHaveBeenCalledWith({
        decision: "SPLIT",
        releaseAmount: "100.00",
        refundAmount: "200.00",
        note: "Concept completed ($100 to seller), remainder refunded ($200 to buyer).",
      });
    });

    unmountResolveForm();

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 4: Counterparties order view reflects resolved / settled status
    // ══════════════════════════════════════════════════════════════════════════
    const settledStatus: OrderStatus = "REFUNDED";
    const settledOrder: Order = {
      ...BASE_ORDER,
      status: settledStatus,
    };
    const step = resolveOrderStep(settledStatus);

    // 1. Order Summary Header reflects resolved status label
    const { unmount: unmountHeader } = render(
      <OrderSummaryHeader order={settledOrder} statusLabel={step.label} />
    );
    expect(screen.getByText("Refunded")).toBeInTheDocument();
    expect(screen.getByText("Brand Identity Design")).toBeInTheDocument();
    expect(screen.getByText("$300.00")).toBeInTheDocument();
    unmountHeader();

    // 2. Buyer Action Panel shows settled state, no action buttons
    const { unmount: unmountBuyerPanel } = render(
      <BuyerActionPanel {...BUYER_PANEL_PROPS} status={settledStatus} />
    );
    expect(screen.getByText("This order has been completed and settled.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /release funds/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /request refund/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open dispute/i })).not.toBeInTheDocument();
    unmountBuyerPanel();

    // 3. Seller Status Panel renders no active completion or dispute buttons
    render(<SellerStatusPanel {...SELLER_PANEL_PROPS} status={settledStatus} />);
    expect(screen.queryByRole("button", { name: /mark as completed/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open dispute/i })).not.toBeInTheDocument();
  });

  it("correctly settles with FULL_RELEASE outcome", () => {
    const releasedStatus: OrderStatus = "RELEASED";
    const releasedOrder: Order = {
      ...BASE_ORDER,
      status: releasedStatus,
    };
    const step = resolveOrderStep(releasedStatus);

    // Verify header status
    expect(step.label).toBe("Payment Released");

    const { unmount: unmountHeader } = render(
      <OrderSummaryHeader order={releasedOrder} statusLabel={step.label} />
    );
    expect(screen.getByText("Payment Released")).toBeInTheDocument();
    unmountHeader();

    // Verify buyer action panel settled message
    render(<BuyerActionPanel {...BUYER_PANEL_PROPS} status={releasedStatus} />);
    expect(screen.getByText("This order has been completed and settled.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /release funds/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /request refund/i })).not.toBeInTheDocument();
  });
});
