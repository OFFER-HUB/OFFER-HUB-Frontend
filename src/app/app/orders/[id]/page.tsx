"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { resolveOrderStep } from "@/constants/order-steps";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderModals } from "@/hooks/useOrderModals";
import { useOrderRoles } from "@/hooks/useOrderRoles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { BuyerActionPanel } from "@/components/orders/BuyerActionPanel";
import { EscrowDetailsCard } from "@/components/orders/EscrowDetailsCard";
import { OpenDisputeModal } from "@/components/orders/OpenDisputeModal";
import { OrderDescriptionCard } from "@/components/orders/OrderDescriptionCard";
import { OrderDetailLoading } from "@/components/orders/OrderDetailLoading";
import { OrderNotFoundCard } from "@/components/orders/OrderNotFoundCard";
import { OrderParticipantCard } from "@/components/orders/OrderParticipantCard";
import { OrderProgressStepper } from "@/components/orders/OrderProgressStepper";
import { OrderReviewPromptModal } from "@/components/orders/OrderReviewPromptModal";
import { OrderReviewSection } from "@/components/orders/OrderReviewSection";
import { OrderStatusBanner } from "@/components/orders/OrderStatusBanner";
import { OrderSummaryHeader } from "@/components/orders/OrderSummaryHeader";
import { ReleaseFundsModal } from "@/components/orders/ReleaseFundsModal";
import { RefundModal } from "@/components/orders/RefundModal";
import { SellerStatusPanel } from "@/components/orders/SellerStatusPanel";
import { PayoutStatusCard } from "@/components/payout/PayoutStatusCard";
import { EscrowSigningModal } from "@/components/escrow/EscrowSigningModal";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { currentWalletName } from "@/hooks/useEscrowSigningAction";

const ORDERS_ROUTE = "/app/orders";

export default function OrderDetailPage(): React.JSX.Element {
  const params = useParams();
  const orderId = typeof params.id === "string" ? params.id : "";

  const {
    order,
    review,
    isLoading,
    isReviewLoading,
    loadError,
    dismissLoadError,
    setOrder,
    setReview,
    refetch,
  } = useOrderData(orderId);

  const roles = useOrderRoles({ order, review, isReviewLoading });
  const modals = useOrderModals({ shouldPromptForReview: roles.canLeaveReview });

  const actions = useOrderActions({
    orderId,
    order,
    review,
    isBuyer: roles.isBuyer,
    onOrderChange: setOrder,
    onReviewChange: setReview,
    refetchOrder: refetch,
    onFundsReleased: modals.closeReleaseModal,
    onRefundRequested: modals.closeRefundModal,
    onReviewSubmitted: modals.holdReviewModalOpen,
  });

  // Only one of the four D2.1 signing flows can be mid-connect at a time —
  // whichever one is, this is the wallet-connect guard driving it.
  const activeWalletConnectGuard = actions.completeSigning.isWalletConnectOpen
    ? actions.completeSigning
    : actions.releaseSigning.isWalletConnectOpen
      ? actions.releaseSigning
      : actions.disputeSigning.isWalletConnectOpen
        ? actions.disputeSigning
        : actions.refundSigning.isWalletConnectOpen
          ? actions.refundSigning
          : null;

  if (isLoading) return <OrderDetailLoading />;
  if (!order) return <OrderNotFoundCard />;

  const step = resolveOrderStep(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link
        href={ORDERS_ROUTE}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <Icon path={ICON_PATHS.chevronLeft} size="sm" />
        <span>Back to Orders</span>
      </Link>

      <OrderSummaryHeader order={order} statusLabel={step.label} />

      <OrderProgressStepper currentStep={step.step} />

      <OrderStatusBanner tone="error" message={loadError} onDismiss={dismissLoadError} />
      <OrderStatusBanner tone="error" message={actions.error} onDismiss={actions.dismissError} />
      <OrderStatusBanner
        tone="success"
        message={actions.success}
        onDismiss={actions.dismissSuccess}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderParticipantCard
          title={roles.isBuyer ? "Freelancer" : "Client"}
          participant={roles.counterparty}
        />
        <OrderDescriptionCard description={order.description} />
      </div>

      {roles.isReviewSectionVisible && (
        <OrderReviewSection
          review={review}
          isLoading={isReviewLoading}
          canLeaveReview={roles.canLeaveReview}
          canRespondToReview={roles.canRespondToReview}
          onLeaveReview={modals.openReviewModal}
          onSubmitResponse={actions.handleSubmitReviewResponse}
        />
      )}

      {roles.isBuyer && (
        <BuyerActionPanel
          status={order.status}
          isWorkCompleted={roles.isWorkCompleted}
          isProcessing={actions.isProcessing}
          onConfirmOrder={actions.handleReserveFunds}
          onCancelOrder={actions.handleCancel}
          onStartSecurePayment={actions.handleCreateEscrow}
          onRequestRelease={modals.openReleaseModal}
          onRequestDispute={modals.openDisputeModal}
          onRequestRefund={modals.openRefundModal}
        />
      )}

      {roles.isSeller && (
        <SellerStatusPanel
          status={order.status}
          isWorkCompleted={roles.isWorkCompleted}
          isProcessing={actions.isProcessing}
          onMarkCompleted={actions.handleMarkCompleted}
          onRequestDispute={modals.openDisputeModal}
        />
      )}

      {roles.isSeller && roles.isOrderComplete && (
        <PayoutStatusCard orderId={order.id} />
      )}

      {order.escrow && (
        <EscrowDetailsCard
          escrow={order.escrow}
          orderStatus={order.status}
          onNotifySuccess={actions.showSuccess}
          onNotifyError={actions.showError}
        />
      )}

      <ReleaseFundsModal
        isOpen={modals.isReleaseModalOpen && !actions.releaseSigning.isSigningModalOpen}
        amount={order.amount}
        isProcessing={actions.isProcessing}
        error={actions.releaseSigning.inlineError}
        onCancel={modals.closeReleaseModal}
        onConfirm={actions.handleReleaseFunds}
      />

      <OpenDisputeModal
        isOpen={modals.isDisputeModalOpen && !actions.disputeSigning.isSigningModalOpen}
        orderTitle={order.title}
        onClose={modals.closeDisputeModal}
        onSubmit={actions.handleOpenDispute}
      />

      <RefundModal
        isOpen={modals.isRefundModalOpen && !actions.refundSigning.isSigningModalOpen}
        amount={order.amount}
        isProcessing={actions.isProcessing}
        error={actions.refundSigning.inlineError}
        onCancel={modals.closeRefundModal}
        onConfirm={actions.handleRequestRefund}
      />

      <EscrowSigningModal
        isOpen={actions.releaseSigning.isSigningModalOpen}
        state={actions.releaseSigning.signingState}
        error={actions.releaseSigning.signingError}
        transactionHash={actions.releaseSigning.transactionHash}
        walletName={currentWalletName()}
        onRetry={() => void actions.handleReleaseFunds()}
        onClose={() => {
          actions.releaseSigning.dismissSigningModal();
          modals.closeReleaseModal();
        }}
      />

      <EscrowSigningModal
        isOpen={actions.disputeSigning.isSigningModalOpen}
        state={actions.disputeSigning.signingState}
        error={actions.disputeSigning.signingError}
        transactionHash={actions.disputeSigning.transactionHash}
        walletName={currentWalletName()}
        onRetry={() => void actions.handleOpenDispute("OTHER", "")}
        onClose={() => {
          actions.disputeSigning.dismissSigningModal();
          modals.closeDisputeModal();
        }}
      />

      <EscrowSigningModal
        isOpen={actions.refundSigning.isSigningModalOpen}
        state={actions.refundSigning.signingState}
        error={actions.refundSigning.signingError}
        transactionHash={actions.refundSigning.transactionHash}
        walletName={currentWalletName()}
        onRetry={() => void actions.handleRequestRefund("")}
        onClose={() => {
          actions.refundSigning.dismissSigningModal();
          modals.closeRefundModal();
        }}
      />

      <EscrowSigningModal
        isOpen={actions.completeSigning.isSigningModalOpen}
        state={actions.completeSigning.signingState}
        error={actions.completeSigning.signingError}
        transactionHash={actions.completeSigning.transactionHash}
        walletName={currentWalletName()}
        onRetry={() => void actions.handleMarkCompleted()}
        onClose={actions.completeSigning.dismissSigningModal}
      />

      <WalletConnectModal
        isOpen={activeWalletConnectGuard !== null}
        onClose={() => activeWalletConnectGuard?.closeWalletConnect()}
        onConnected={() => activeWalletConnectGuard?.onWalletConnected()}
      />

      <OrderReviewPromptModal
        isOpen={modals.isReviewModalOpen}
        order={order}
        onClose={modals.dismissReviewModal}
        onSkip={modals.dismissReviewModal}
        onSubmit={actions.handleSubmitReview}
      />
    </div>
  );
}
