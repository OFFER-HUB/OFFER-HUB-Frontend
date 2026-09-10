"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { OrderStatusCallout } from "@/components/orders/OrderStatusCallout";
import type { OrderStatus } from "@/types/order.types";

const SOLID_PRIMARY_BUTTON = cn(
  "w-full py-3 px-5 rounded-xl font-bold text-sm text-white",
  "bg-primary hover:bg-primary-hover active:bg-primary-hover",
  "shadow-[3px_3px_8px_#cbd5e1]",
  "hover:shadow-[4px_4px_12px_#cbd5e1]",
  "active:scale-[0.99] transition-all duration-200 cursor-pointer",
  "flex items-center justify-center gap-2",
  "disabled:opacity-60 disabled:cursor-not-allowed"
);

const NEUMORPHIC_SECONDARY_BUTTON = cn(
  "w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer",
  "bg-background text-text-secondary hover:text-error",
  "shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]",
  "hover:shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff]",
  "active:scale-[0.99]",
  "flex items-center justify-center gap-1.5",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

const REVIEW_ACTION_BUTTON = cn(
  "p-3 rounded-xl font-semibold transition-all text-xs",
  "bg-white shadow-[2px_2px_6px_#cbd5e1,-2px_-2px_6px_#ffffff]",
  "hover:shadow-[3px_3px_8px_#cbd5e1]",
  "active:scale-[0.98]",
  "flex flex-col items-center justify-center gap-1.5"
);

interface BuyerActionPanelProps {
  status: OrderStatus;
  amount?: string;
  isWorkCompleted: boolean;
  isProcessing: boolean;
  isExternalWallet?: boolean;
  onConfirmOrder: () => void;
  onCancelOrder: () => void;
  onStartSecurePayment: () => void;
  onSignFundEscrow?: () => void;
  onRequestRelease: () => void;
  onRequestDispute: () => void;
  onRequestRefund: () => void;
}

export function BuyerActionPanel({
  status,
  amount,
  isWorkCompleted,
  isProcessing,
  isExternalWallet = false,
  onConfirmOrder,
  onCancelOrder,
  onStartSecurePayment,
  onSignFundEscrow,
  onRequestRelease,
  onRequestDispute,
  onRequestRefund,
}: BuyerActionPanelProps): React.JSX.Element {
  const formattedAmount = amount ? `$${Number(amount).toFixed(2)} USD` : null;

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 border border-white/80 space-y-5")}>
      <div className="flex items-center justify-between pb-3 border-b border-black/5">
        <div>
          <h2 className="text-sm font-bold text-[#111827]">Order Action</h2>
          <p className="text-[11px] text-text-secondary mt-0.5">Escrow Payment Gateway</p>
        </div>
        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Client Action
        </span>
      </div>

      {status === "ORDER_CREATED" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-background border border-black/5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon path={ICON_PATHS.lock} size="sm" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#111827]">Smart Escrow Protection</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isExternalWallet
                    ? "Lock funds directly in the Soroban escrow contract by signing with your connected wallet."
                    : "Confirm this order to reserve funds into escrow. The specialist will be notified immediately to start work."}
                </p>
              </div>
            </div>

            {formattedAmount && (
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">Reservation Total:</span>
                <span className="font-mono font-bold text-primary text-sm">{formattedAmount}</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {isExternalWallet ? (
              <button
                type="button"
                onClick={onStartSecurePayment}
                disabled={isProcessing}
                className={SOLID_PRIMARY_BUTTON}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Icon path={ICON_PATHS.lock} size="sm" />
                    <span>Lock Funds in Escrow</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onConfirmOrder}
                disabled={isProcessing}
                className={SOLID_PRIMARY_BUTTON}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Reserving Funds...</span>
                  </>
                ) : (
                  <>
                    <Icon path={ICON_PATHS.check} size="sm" />
                    <span>Confirm Order</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onCancelOrder}
              disabled={isProcessing}
              className={NEUMORPHIC_SECONDARY_BUTTON}
            >
              <Icon path={ICON_PATHS.close} size="sm" className="w-3.5 h-3.5 text-text-secondary/70" />
              <span>Cancel Order</span>
            </button>
          </div>
        </div>
      )}

      {status === "FUNDS_RESERVED" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-background border border-black/5 space-y-2">
            <p className="text-xs text-text-secondary leading-relaxed">
              Funds are reserved in your account. Initialize the smart contract to securely lock payment until project delivery.
            </p>
            {formattedAmount && (
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">Escrow Value:</span>
                <span className="font-mono font-bold text-primary">{formattedAmount}</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onStartSecurePayment}
              disabled={isProcessing}
              className={SOLID_PRIMARY_BUTTON}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Setting Up Escrow...</span>
                </>
              ) : (
                <>
                  <Icon path={ICON_PATHS.lock} size="sm" />
                  <span>Start Secure Payment</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancelOrder}
              disabled={isProcessing}
              className={NEUMORPHIC_SECONDARY_BUTTON}
            >
              <Icon path={ICON_PATHS.close} size="sm" className="w-3.5 h-3.5 text-text-secondary/70" />
              <span>Cancel Order</span>
            </button>
          </div>
        </div>
      )}

      {status === "ESCROW_CREATING" && (
        <div className="p-5 rounded-xl bg-background border border-black/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <LoadingSpinner size="sm" />
          </div>
          <div>
            <p className="font-bold text-sm text-[#111827]">Creating Escrow Contract...</p>
            <p className="text-xs text-text-secondary mt-0.5">Please wait while the blockchain contract is prepared.</p>
          </div>
        </div>
      )}

      {status === "ESCROW_FUNDING" && (
        isExternalWallet ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-background border border-black/5 space-y-2">
              <p className="text-xs text-text-secondary leading-relaxed">
                The escrow contract is ready. Sign the transaction with your wallet to lock funds and begin work.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignFundEscrow}
              disabled={isProcessing}
              className={SOLID_PRIMARY_BUTTON}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Icon path={ICON_PATHS.lock} size="sm" />
                  <span>Sign Fund Transaction</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-background border border-black/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <LoadingSpinner size="sm" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#111827]">Funding Escrow...</p>
              <p className="text-xs text-text-secondary mt-0.5">Transferring reserved funds into the escrow contract.</p>
            </div>
          </div>
        )
      )}

      {status === "IN_PROGRESS" && (
        <div className="space-y-4">
          <OrderStatusCallout
            tone={isWorkCompleted ? "warning" : "success"}
            iconPath={isWorkCompleted ? ICON_PATHS.alertCircle : ICON_PATHS.check}
            title={isWorkCompleted ? "Deliverables Ready for Review" : "Payment Secured in Escrow"}
            description={
              isWorkCompleted
                ? "The specialist has marked work as completed. Please inspect all files and deliverables before releasing payment."
                : "Funds are safely protected in escrow. The specialist is currently working on your order."
            }
          />

          {isWorkCompleted && (
            <div className="p-4 rounded-xl bg-background border border-black/5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Order Review Actions
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={onRequestRelease}
                  className={cn(REVIEW_ACTION_BUTTON, "text-emerald-700 hover:text-emerald-800")}
                >
                  <Icon path={ICON_PATHS.check} size="sm" className="text-emerald-600" />
                  <span>Release Funds</span>
                </button>
                <button
                  type="button"
                  onClick={onRequestRefund}
                  className={cn(REVIEW_ACTION_BUTTON, "text-amber-700 hover:text-amber-800")}
                >
                  <Icon path={ICON_PATHS.currency} size="sm" className="text-amber-600" />
                  <span>Request Refund</span>
                </button>
                <button
                  type="button"
                  onClick={onRequestDispute}
                  className={cn(REVIEW_ACTION_BUTTON, "text-rose-700 hover:text-rose-800")}
                >
                  <Icon path={ICON_PATHS.flag} size="sm" className="text-rose-600" />
                  <span>Open Dispute</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {["RELEASED", "REFUNDED", "CLOSED"].includes(status) && (
        <div className="p-4 rounded-xl bg-background border border-black/5 text-center">
          <p className="text-xs font-semibold text-text-secondary">
            This order has been completed and settled.
          </p>
        </div>
      )}
    </div>
  );
}
