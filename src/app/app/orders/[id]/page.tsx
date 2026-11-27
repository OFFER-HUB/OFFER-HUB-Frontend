"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { resolveOrderStep } from "@/constants/order-steps";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderModals } from "@/hooks/useOrderModals";
import { useOrderRoles } from "@/hooks/useOrderRoles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { BuyerActionPanel } from "@/components/orders/BuyerActionPanel";
import { EscrowDetailsCard } from "@/components/orders/EscrowDetailsCard";
import { OpenDisputeModal } from "@/components/orders/OpenDisputeModal";
import { OrderDescriptionCard } from "@/components/orders/OrderDescriptionCard";
import { OrderFinancialSummary } from "@/components/orders/OrderFinancialSummary";
import { OrderDeliverablesCard } from "@/components/orders/OrderDeliverablesCard";
import { MilestonePaymentStatusCard } from "@/components/orders/MilestonePaymentStatusCard";
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
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";

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
    isRefetching,
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

  const currentUserWallet = useAuthStore((s) => s.user?.wallet);
  const { address: liveWalletAddress } = useWalletKit();
  const isExternalWallet = roles.isBuyer && currentUserWallet?.type === "EXTERNAL";

  const activeWalletConnectGuard = actions.createSigning.isWalletConnectOpen
    ? actions.createSigning
    : actions.fundSigning.isWalletConnectOpen
      ? actions.fundSigning
      : actions.completeSigning.isWalletConnectOpen
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
    <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar: Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Link
            href={ORDERS_ROUTE}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-2xl",
              "bg-background text-text-secondary hover:text-text-primary text-sm font-medium",
              "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
              "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
              "transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            <span>All Orders</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary pl-2">
            <span>/</span>
            <span className="truncate max-w-[280px]">{order.title}</span>
            <span>/</span>
            <span className="font-mono text-text-primary font-medium">#{order.id.slice(-8)}</span>
          </div>
        </div>
      </div>

      {/* Status Notifications / Banners */}
      <OrderStatusBanner tone="error" message={loadError} onDismiss={dismissLoadError} />
      <OrderStatusBanner tone="error" message={actions.error} onDismiss={actions.dismissError} />
      <OrderStatusBanner
        tone="success"
        message={actions.success}
        onDismiss={actions.dismissSuccess}
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Order Documentation & Progress (8 Cols) */}
        <div className="lg:col-span-8 space-y-7">
          <OrderSummaryHeader
            order={order}
            statusLabel={step.label}
            onRefresh={refetch}
            isRefreshing={isRefetching}
          />

          <OrderProgressStepper currentStep={step.step} />

          {/* On mobile screens (< lg), show the compact smart contract card right here above the fold */}
          {order.escrow && (
            <div className="lg:hidden">
              <EscrowDetailsCard
                escrow={order.escrow}
                orderStatus={order.status}
                onNotifySuccess={actions.showSuccess}
                onNotifyError={actions.showError}
              />
            </div>
          )}

          <OrderDescriptionCard description={order.description} />

          <OrderDeliverablesCard
            orderId={order.id}
            orderStatus={order.status}
            metadata={order.metadata}
            isBuyer={roles.isBuyer}
            isSeller={roles.isSeller}
            isReleased={order.escrow?.status === "RELEASED" || Boolean(order.escrow?.releasedAt)}
            onOrderUpdated={setOrder}
          />

          {order.milestones && <MilestonePaymentStatusCard milestones={order.milestones} />}

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
        </div>

        {/* Right Column: Action Hub & Counterparty (4 Cols, Sticky) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          
          {/* Action Center */}
          {roles.isBuyer && (
            <BuyerActionPanel
              status={order.status}
              amount={order.amount}
              isWorkCompleted={roles.isWorkCompleted}
              refundRequiresDispute={roles.refundRequiresDispute}
              isProcessing={actions.isProcessing}
              isExternalWallet={isExternalWallet}
              onConfirmOrder={actions.handleReserveFunds}
              onCancelOrder={actions.handleCancel}
              onStartSecurePayment={actions.handleCreateEscrow}
              onSignFundEscrow={actions.handleFundEscrow}
              onRequestRelease={modals.openReleaseModal}
              onRequestDispute={modals.openDisputeModal}
              onRequestRefund={modals.openRefundModal}
            />
          )}

          {roles.isSeller && (
            <SellerStatusPanel
              status={order.status}
              escrowStatus={order.escrow?.status}
              isWorkCompleted={roles.isWorkCompleted}
              isProcessing={actions.isProcessing}
              onMarkCompleted={actions.handleMarkCompleted}
              onRequestDispute={modals.openDisputeModal}
            />
          )}

          {roles.isSeller && roles.isPayoutExpected && (
            <PayoutStatusCard orderId={order.id} />
          )}

          {/* Secure Payment Contract (Escrow Details) - Sticky on Desktop */}
          {order.escrow && (
            <div className="hidden lg:block">
              <EscrowDetailsCard
                escrow={order.escrow}
                orderStatus={order.status}
                onNotifySuccess={actions.showSuccess}
                onNotifyError={actions.showError}
              />
            </div>
          )}

          {/* Order Financial & Security Overview */}
          <OrderFinancialSummary order={order} isBuyer={roles.isBuyer} />

          {/* Counterparty Card (Freelancer / Client) */}
          <OrderParticipantCard
            title={roles.isBuyer ? "Freelancer" : "Client"}
            participant={roles.counterparty}
          />
        </div>

      </div>

      {/* Modals */}
      <ReleaseFundsModal
        isOpen={modals.isReleaseModalOpen && !actions.releaseSigning.isSigningModalOpen}
        amount={order.amount}
        isProcessing={actions.isProcessing}
        error={actions.releaseSigning.inlineError}
        isEarlyRelease={!roles.isWorkCompleted}
        onCancel={modals.closeReleaseModal}
        onConfirm={actions.handleReleaseFunds}
      />

      <OpenDisputeModal
        isOpen={modals.isDisputeModalOpen && !actions.disputeSigning.isSigningModalOpen}
        orderTitle={order.title}
        orderAmount={order.amount}
        onClose={modals.closeDisputeModal}
        onSubmit={actions.handleOpenDispute}
      />

      <RefundModal
        isOpen={modals.isRefundModalOpen && !actions.refundSigning.isSigningModalOpen}
        amount={order.amount}
        milestones={order.milestones}
        isProcessing={actions.isProcessing}
        error={actions.refundSigning.inlineError}
        onCancel={modals.closeRefundModal}
        onConfirm={actions.handleRequestRefund}
      />

      <EscrowSigningModal
        isOpen={actions.createSigning.isSigningModalOpen}
        state={actions.createSigning.signingState}
        error={actions.createSigning.signingError}
        transactionHash={actions.createSigning.transactionHash}
        walletName={currentWalletName()}
        operation="create"
        step={actions.createSigning.currentStep}
        onRetry={() => void actions.handleCreateEscrow()}
        onChangeWallet={actions.createSigning.changeWallet}
        onClose={actions.createSigning.dismissSigningModal}
      />

      <EscrowSigningModal
        isOpen={actions.fundSigning.isSigningModalOpen}
        state={actions.fundSigning.signingState}
        error={actions.fundSigning.signingError}
        transactionHash={actions.fundSigning.transactionHash}
        walletName={currentWalletName()}
        operation="fund"
        step={actions.fundSigning.currentStep}
        onRetry={() => void actions.handleFundEscrow()}
        onChangeWallet={actions.fundSigning.changeWallet}
        onClose={actions.fundSigning.dismissSigningModal}
      />

      <EscrowSigningModal
        isOpen={actions.releaseSigning.isSigningModalOpen}
        state={actions.releaseSigning.signingState}
        error={actions.releaseSigning.signingError}
        transactionHash={actions.releaseSigning.transactionHash}
        walletName={currentWalletName()}
        operation="release"
        step={actions.releaseSigning.currentStep}
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
        operation="dispute"
        step={actions.disputeSigning.currentStep}
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
        operation="refund"
        step={actions.refundSigning.currentStep}
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
        operation="release"
        step={actions.completeSigning.currentStep}
        onRetry={() => void actions.handleMarkCompleted()}
        onClose={actions.completeSigning.dismissSigningModal}
      />

      <WalletConnectModal
        isOpen={activeWalletConnectGuard !== null}
        onClose={() => activeWalletConnectGuard?.closeWalletConnect()}
        onConnected={() => activeWalletConnectGuard?.onWalletConnected()}
        liveAddress={liveWalletAddress}
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
