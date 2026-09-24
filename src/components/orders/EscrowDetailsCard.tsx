"use client";

import { useState, useCallback } from "react";
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
  onNotifySuccess?: (message: string) => void;
  onNotifyError?: (message: string) => void;
  className?: string;
}

/**
 * The on-chain side of the order: escrow state, contract address and a way out
 * to the block explorer. Compact and neumorphic so it can sit in the sticky
 * action column on desktop or above the fold on mobile.
 */
export function EscrowDetailsCard({
  escrow,
  orderStatus,
  onNotifySuccess,
  onNotifyError,
  className,
}: EscrowDetailsCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const contractId = escrow.trustlessContractId;
  const isSettled = orderStatus === "CLOSED" || escrow.status === FUNDED_ESCROW_STATUS;
  const displayStatus = orderStatus === "CLOSED" ? COMPLETED_LABEL : escrow.status;

  const copyAddress = useCallback(async (): Promise<void> => {
    if (!contractId) return;

    try {
      await navigator.clipboard.writeText(contractId);
      setCopied(true);
      onNotifySuccess?.(ORDER_CLIPBOARD_MESSAGES.copied);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onNotifyError?.(ORDER_CLIPBOARD_MESSAGES.failed);
    }
  }, [contractId, onNotifyError, onNotifySuccess]);

  return (
    <div
      className={cn(
        NEUMORPHIC_CARD,
        "p-5 space-y-3.5 transition-all duration-200",
        className
      )}
      data-testid="escrow-details-card"
    >
      {/* Header Row: Title & Status Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-primary shrink-0",
              "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
            )}
          >
            <Icon path={ICON_PATHS.lock} size="sm" className="text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary tracking-tight truncate">
              Secure Payment Contract
            </h2>
            <p className="text-[11px] text-text-secondary truncate">Soroban Smart Escrow</p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0",
            "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
            isSettled
              ? "text-success"
              : displayStatus === "DISPUTED"
                ? "text-warning"
                : "text-primary"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full bg-current",
              !isSettled && "animate-pulse"
            )}
          />
          <span className="text-[11px] uppercase tracking-wide">{displayStatus}</span>
        </div>
      </div>

      {/* Contract Address Section */}
      {contractId ? (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span className="font-semibold uppercase tracking-wider">Contract Address</span>
            <span className="font-mono text-[10px] text-text-secondary">Stellar Blockchain</span>
          </div>

          <div
            className={cn(
              "p-2.5 rounded-xl transition-all",
              NEUMORPHIC_INSET,
              "hover:shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff]"
            )}
          >
            <p
              className="font-mono text-[11px] text-text-primary break-all leading-relaxed select-all"
              title={contractId}
            >
              {contractId}
            </p>
          </div>

          {/* Action Buttons: Copy & Explorer */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={copyAddress}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200",
                "bg-background text-text-primary",
                copied
                  ? "text-success shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                  : "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
              title="Copy Smart Contract ID"
              aria-label="Copy smart contract address"
            >
              <Icon
                path={copied ? ICON_PATHS.check : ICON_PATHS.copy}
                size="sm"
                className={cn("w-3.5 h-3.5", copied ? "text-success" : "text-text-secondary")}
              />
              <span>{copied ? "Copied!" : "Copy Address"}</span>
            </button>

            <a
              href={`${STELLAR_EXPLORER_URL}/contract/${contractId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200",
                "bg-background text-primary",
                "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
                "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
              title="Inspect on Stellar Explorer"
            >
              <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5 text-primary" />
              <span>Explorer</span>
            </a>
          </div>
        </div>
      ) : (
        <div className={cn("p-3 rounded-xl text-center", NEUMORPHIC_INSET)}>
          <p className="text-xs text-text-secondary">
            Contract ID will be generated upon escrow initialization.
          </p>
        </div>
      )}

      {/* Safety Micro-footer */}
      <div className="pt-2 flex items-center justify-between text-[10px] text-text-secondary">
        <span className="flex items-center gap-1">
          <Icon path={ICON_PATHS.shield} size="sm" className="w-3 h-3 text-primary" />
          <span>Trustless Escrow</span>
        </span>
        <span className="font-mono text-text-secondary/80">Automated settlement</span>
      </div>
    </div>
  );
}
