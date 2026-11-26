"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import type { Order } from "@/types/order.types";

interface CheckoutRetryPanelProps {
  order: Order;
  onRetryStep2: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
}

export function CheckoutRetryPanel({
  order,
  onRetryStep2,
  onCancel,
  isProcessing,
}: CheckoutRetryPanelProps): React.JSX.Element {
  const creating = order.status === "ESCROW_CREATING";
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-background border border-black/5 space-y-2">
        <h3 className="text-sm font-bold text-[#111827]">
          {creating ? "Creating the payment contract…" : "Finish locking the payment"}
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {creating
            ? "Creating the payment contract… This can take a few seconds."
            : "The contract was created, but the payment wasn't locked yet."}
        </p>
      </div>
      {!creating && (
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onRetryStep2}
            disabled={isProcessing}
            className={cn(
              "w-full py-3 px-5 rounded-xl font-bold text-sm text-white h-12",
              "bg-primary hover:bg-primary-hover active:bg-primary-hover",
              "shadow-[3px_3px_8px_#cbd5e1]",
              "flex items-center justify-center gap-2",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Icon path={ICON_PATHS.lock} size="sm" />
                <span>Retry step 2 of 2</span>
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full py-2 text-xs font-semibold text-text-secondary hover:text-error"
            >
              Cancel order
            </button>
          )}
        </div>
      )}
      {creating && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-black/5">
          <LoadingSpinner size="sm" />
          <span className="text-xs text-text-secondary">Creating the payment contract… This can take a few seconds.</span>
        </div>
      )}
    </div>
  );
}
