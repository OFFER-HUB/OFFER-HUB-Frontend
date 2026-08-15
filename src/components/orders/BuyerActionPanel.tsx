"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON, DANGER_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { OrderNoticeRow, OrderStatusCallout } from "@/components/orders/OrderStatusCallout";
import type { OrderStatus } from "@/types/order.types";

/** Compact tonal button used by the two-up review actions. */
const REVIEW_ACTION_BUTTON = cn(
  "px-3 py-2 rounded-lg font-medium transition-all text-xs",
  "bg-background",
  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
  "flex flex-col items-center gap-1"
);

interface BuyerActionPanelProps {
  status: OrderStatus;
  /** Freelancer has flagged the work as delivered. */
  isWorkCompleted: boolean;
  /** An action is already running — every button is disabled. */
  isProcessing: boolean;
  onConfirmOrder: () => void;
  onCancelOrder: () => void;
  onStartSecurePayment: () => void;
  onRequestRelease: () => void;
  onRequestDispute: () => void;
}

/**
 * What the client can do next, branching on the order status.
 *
 * The card renders for every status a buyer can reach, including the ones with
 * nothing to act on — a settled order keeps the heading and simply offers no
 * controls, rather than making the section disappear from the page.
 */
export function BuyerActionPanel({
  status,
  isWorkCompleted,
  isProcessing,
  onConfirmOrder,
  onCancelOrder,
  onStartSecurePayment,
  onRequestRelease,
  onRequestDispute,
}: BuyerActionPanelProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Next Steps</h2>

      {status === "ORDER_CREATED" && (
        <div className="space-y-4">
          <div className={cn("p-5 rounded-xl", NEUMORPHIC_INSET)}>
            <OrderNoticeRow tone="primary" iconPath={ICON_PATHS.infoCircle} className="mb-4">
              Confirm this order to reserve funds from your balance. The freelancer will be
              notified to start work.
            </OrderNoticeRow>
            <button
              type="button"
              onClick={onConfirmOrder}
              disabled={isProcessing}
              className={cn(PRIMARY_BUTTON, "w-full justify-center")}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Icon path={ICON_PATHS.check} size="sm" />
                  <span>Confirm Order</span>
                </>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={onCancelOrder}
            disabled={isProcessing}
            className={cn(DANGER_BUTTON, "w-full justify-center")}
          >
            <Icon path={ICON_PATHS.close} size="sm" />
            <span>Cancel Order</span>
          </button>
        </div>
      )}

      {status === "FUNDS_RESERVED" && (
        <div className="space-y-4">
          <div className={cn("p-5 rounded-xl", NEUMORPHIC_INSET)}>
            <OrderNoticeRow tone="primary" iconPath={ICON_PATHS.lock} className="mb-4">
              Start secure payment to lock funds in escrow. This protects both you and the
              freelancer.
            </OrderNoticeRow>
            <button
              type="button"
              onClick={onStartSecurePayment}
              disabled={isProcessing}
              className={cn(PRIMARY_BUTTON, "w-full justify-center")}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Icon path={ICON_PATHS.lock} size="sm" />
                  <span>Start Secure Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {(status === "ESCROW_CREATING" || status === "ESCROW_FUNDING") && (
        <div
          className={cn(
            "p-5 rounded-xl flex items-center gap-4",
            "bg-background shadow-[inset_3px_3px_6px_rgba(245,158,11,0.1),inset_-3px_-3px_6px_#ffffff]",
            "border-l-4 border-warning"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
            <LoadingSpinner size="sm" />
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">Processing Payment...</p>
            <p className="text-sm text-text-secondary">This may take a few moments. Please wait.</p>
          </div>
        </div>
      )}

      {status === "IN_PROGRESS" && (
        <div className="space-y-4">
          <OrderStatusCallout
            tone={isWorkCompleted ? "warning" : "success"}
            iconPath={isWorkCompleted ? ICON_PATHS.alertCircle : ICON_PATHS.check}
            title={isWorkCompleted ? "Work Completed - Please Review" : "Payment Secured"}
            description={
              isWorkCompleted
                ? "The freelancer has marked the work as completed. Please review and release funds or open a dispute if needed."
                : "Funds are safely held in escrow. The freelancer is now working on your order."
            }
          />

          {isWorkCompleted && (
            <div className={cn("p-3 rounded-lg", NEUMORPHIC_INSET)}>
              <h3 className="text-xs font-medium text-text-secondary mb-2">Review</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onRequestRelease}
                  className={cn(REVIEW_ACTION_BUTTON, "text-success")}
                >
                  <Icon path={ICON_PATHS.check} size="sm" />
                  <span>Release Funds</span>
                </button>
                <button
                  type="button"
                  onClick={onRequestDispute}
                  className={cn(REVIEW_ACTION_BUTTON, "text-error")}
                >
                  <Icon path={ICON_PATHS.flag} size="sm" />
                  <span>Open Dispute</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
