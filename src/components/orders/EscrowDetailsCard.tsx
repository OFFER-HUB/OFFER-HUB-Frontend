"use client";

import { useCallback } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { STELLAR_EXPLORER_URL } from "@/config/wallet";
import { ORDER_CLIPBOARD_MESSAGES } from "@/constants/order-messages";
import type { OrderEscrow, OrderStatus } from "@/types/order.types";

const FUNDED_ESCROW_STATUS = "FUNDED";
const COMPLETED_LABEL = "COMPLETED";

interface EscrowDetailsCardProps {
  escrow: OrderEscrow;
  /** The order status outranks the escrow status once the order is closed. */
  orderStatus: OrderStatus;
  /** Reports the clipboard result to the page banner. */
  onNotifySuccess: (message: string) => void;
  onNotifyError: (message: string) => void;
}

/**
 * The on-chain side of the order: escrow state, contract address and a way out
 * to the block explorer.
 *
 * The explorer host comes from the wallet config rather than a literal, so the
 * link follows whichever network the app is pointed at.
 */
export function EscrowDetailsCard({
  escrow,
  orderStatus,
  onNotifySuccess,
  onNotifyError,
}: EscrowDetailsCardProps): React.JSX.Element {
  const contractId = escrow.trustlessContractId;
  const isSettled = orderStatus === "CLOSED" || escrow.status === FUNDED_ESCROW_STATUS;

  const copyAddress = useCallback(async (): Promise<void> => {
    if (!contractId) return;

    try {
      await navigator.clipboard.writeText(contractId);
      onNotifySuccess(ORDER_CLIPBOARD_MESSAGES.copied);
    } catch {
      onNotifyError(ORDER_CLIPBOARD_MESSAGES.failed);
    }
  }, [contractId, onNotifyError, onNotifySuccess]);

  return (
    <div className={NEUMORPHIC_CARD}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon path={ICON_PATHS.lock} size="sm" className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Secure Payment Contract</h2>
          <p className="text-sm text-text-secondary">
            Funds are protected by blockchain smart contract
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className={cn("flex justify-between items-center p-3 rounded-lg", NEUMORPHIC_INSET)}>
          <span className="text-text-secondary">Status</span>
          <span
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              isSettled ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            )}
          >
            {orderStatus === "CLOSED" ? COMPLETED_LABEL : escrow.status}
          </span>
        </div>

        {contractId && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Smart Contract Address
              </label>
              <div className="flex gap-2">
                <div className={cn("flex-1 p-3 rounded-lg", NEUMORPHIC_INSET)}>
                  <p className="font-mono text-xs text-text-primary break-all">{contractId}</p>
                </div>
                <button
                  type="button"
                  onClick={copyAddress}
                  className={cn(
                    "px-4 py-3 rounded-lg font-medium transition-all",
                    "bg-background text-text-secondary",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                    "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
                  )}
                  title="Copy address"
                  aria-label="Copy smart contract address"
                >
                  <Icon path={ICON_PATHS.copy} size="sm" />
                </button>
              </div>
            </div>

            <a
              href={`${STELLAR_EXPLORER_URL}/contract/${contractId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "w-full px-6 py-4 rounded-xl font-medium transition-all",
                "bg-gradient-to-r from-primary to-primary/80 text-white",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
                "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
                "flex items-center justify-center gap-3"
              )}
            >
              <Icon path={ICON_PATHS.externalLink} size="md" className="text-white" />
              <span className="text-base font-semibold">View Contract Status on Stellar</span>
            </a>

            <p className="text-xs text-text-secondary text-center">
              This link will take you to Stellar&apos;s blockchain explorer where you can view the
              real-time status of your escrow smart contract
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
