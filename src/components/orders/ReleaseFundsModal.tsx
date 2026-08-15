"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";

const MODAL_BUTTON_BASE = cn(
  "flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm",
  "bg-background",
  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
);

interface ReleaseFundsModalProps {
  isOpen: boolean;
  /** Raw order amount; formatted here so callers never pass a pre-rounded value. */
  amount: string;
  /** Disables both buttons while the release request is in flight. */
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation for the one irreversible action a buyer can take: paying out the
 * escrow. The modal only closes on success — the caller keeps it open while the
 * request runs so the error banner behind it is not hidden by a closing dialog.
 */
export function ReleaseFundsModal({
  isOpen,
  amount,
  isProcessing,
  onCancel,
  onConfirm,
}: ReleaseFundsModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  const payout = parseFloat(amount);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={cn(NEUMORPHIC_CARD, "max-w-md w-full")}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <Icon path={ICON_PATHS.check} size="md" className="text-success" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">Release Funds</h3>
        </div>
        <p className="text-text-secondary mb-6">
          Are you satisfied with the work? This will release{" "}
          <span className="font-semibold text-primary">${payout.toFixed(2)}</span> to the
          freelancer. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className={cn(MODAL_BUTTON_BASE, "text-text-secondary")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={cn(
              MODAL_BUTTON_BASE,
              "text-success",
              "flex items-center justify-center gap-2"
            )}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Icon path={ICON_PATHS.check} size="sm" />
                <span>Confirm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
