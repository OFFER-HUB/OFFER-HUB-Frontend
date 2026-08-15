"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import {
  OrderNoticeRow,
  OrderStatusCallout,
  orderCalloutBorder,
} from "@/components/orders/OrderStatusCallout";
import type { OrderStatus } from "@/types/order.types";

/** Tonal button base shared by the two seller actions, which differ only in size. */
const SELLER_ACTION_BUTTON = cn(
  "w-full rounded-lg font-medium transition-all",
  "bg-background",
  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
);

interface SellerStatusPanelProps {
  status: OrderStatus;
  /** This freelancer has already flagged the work as delivered. */
  isWorkCompleted: boolean;
  /** An action is already running — the completion button is disabled. */
  isProcessing: boolean;
  onMarkCompleted: () => void;
  onRequestDispute: () => void;
}

/**
 * Where the order stands from the freelancer's side, plus the one action they
 * own: declaring the work delivered.
 *
 * Everything before `IN_PROGRESS` is a waiting state — the client drives it —
 * so those branches deliberately render information and no controls.
 */
export function SellerStatusPanel({
  status,
  isWorkCompleted,
  isProcessing,
  onMarkCompleted,
  onRequestDispute,
}: SellerStatusPanelProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Order Status</h2>

      {status === "ORDER_CREATED" && (
        <div
          className={cn(
            "p-5 rounded-xl",
            NEUMORPHIC_INSET,
            "border-l-4",
            orderCalloutBorder("warning")
          )}
        >
          <OrderNoticeRow tone="warning" iconPath={ICON_PATHS.clock}>
            Waiting for client to confirm the order and reserve funds.
          </OrderNoticeRow>
        </div>
      )}

      {status === "FUNDS_RESERVED" && (
        <div
          className={cn(
            "p-5 rounded-xl",
            NEUMORPHIC_INSET,
            "border-l-4",
            orderCalloutBorder("primary")
          )}
        >
          <OrderNoticeRow tone="primary" iconPath={ICON_PATHS.lock}>
            Client has confirmed the order. Waiting for secure payment setup.
          </OrderNoticeRow>
        </div>
      )}

      {status === "IN_PROGRESS" && (
        <div className="space-y-4">
          <OrderStatusCallout
            tone={isWorkCompleted ? "success" : "primary"}
            iconPath={isWorkCompleted ? ICON_PATHS.check : ICON_PATHS.briefcase}
            title={isWorkCompleted ? "Waiting for Client Review" : "Ready to Start"}
            description={
              isWorkCompleted
                ? "You have marked the work as completed. Waiting for the client to review and release funds."
                : "Payment is secured. You can now start working on this order! When finished, mark as completed."
            }
          />

          {!isWorkCompleted && (
            <div className={cn("p-3 rounded-lg", NEUMORPHIC_INSET)}>
              <h3 className="text-xs font-medium text-text-secondary mb-2">Actions</h3>
              <button
                type="button"
                onClick={onMarkCompleted}
                disabled={isProcessing}
                className={cn(
                  SELLER_ACTION_BUTTON,
                  "px-4 py-2 text-sm text-success",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Marking...</span>
                  </>
                ) : (
                  <>
                    <Icon path={ICON_PATHS.check} size="sm" />
                    <span>Mark as Completed</span>
                  </>
                )}
              </button>
            </div>
          )}

          {isWorkCompleted && (
            <div className={cn("p-3 rounded-lg", NEUMORPHIC_INSET)}>
              <h3 className="text-xs font-medium text-text-secondary mb-2">Need help?</h3>
              <p className="text-xs text-text-secondary mb-2">
                If the client doesn&apos;t respond, you can open a dispute.
              </p>
              <button
                type="button"
                onClick={onRequestDispute}
                className={cn(
                  SELLER_ACTION_BUTTON,
                  "px-3 py-1.5 text-xs text-error",
                  "flex items-center justify-center gap-1"
                )}
              >
                <Icon path={ICON_PATHS.flag} size="sm" />
                <span>Open Dispute</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
