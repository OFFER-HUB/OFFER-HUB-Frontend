"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { STELLAR_EXPLORER_URL } from "@/config/wallet";
import { useFocusTrapModal } from "@/hooks/useFocusTrapModal";
import {
  getStepInfo,
  errorCopy,
  stateTitle,
  truncateHash,
  type EscrowSigningCopyOverride,
} from "@/lib/escrow-signing-copy";
import type { EscrowSigningState, EscrowSigningError } from "@/hooks/useEscrowSigning";
import type { EscrowOperation, EscrowStepName } from "@/lib/api/escrow";

export interface EscrowSigningModalProps {
  isOpen: boolean;
  state: EscrowSigningState;
  error: EscrowSigningError | null;
  transactionHash: string | null;
  /**
   * Connected wallet's display name (e.g. "Freighter"), read by the caller
   * from `StellarWalletsKit.selectedModule?.productName`.
   */
  walletName?: string | null;
  /**
   * Which flow this is, and which of its on-chain steps is currently being
   * signed. Release/refund are more than one signature from the same
   * person (e.g. a buyer releasing funds signs "approve" then "release" as
   * two separate confirmations) — without these, each one lands as a bare
   * "Transaction confirmed" that looks identical to a one-shot action
   * completing, so a second signing prompt right after reads as a bug
   * instead of the next expected step.
   */
  operation?: EscrowOperation;
  step?: EscrowStepName | null;
  /**
   * Overrides the `operation`/`step` copy lookup. For flows this modal
   * didn't originally know about (e.g. the BlindPay payout transfer, which
   * has no `operation`/`step` of its own) — passing this instead of widening
   * `EscrowOperation` keeps that union honest about what it actually names.
   */
  copy?: EscrowSigningCopyOverride;
  /** Re-runs the same operation from scratch (a fresh XDR is fetched). */
  onRetry: () => void;
  /** Dismisses the modal. Has no effect while a wallet or submission is in flight. */
  onClose: () => void;
}

// ─── Local button style constants ─────────────────────────────────────────────

const SOLID_PRIMARY_BUTTON = cn(
  "w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white",
  "bg-primary hover:bg-primary-hover active:bg-primary-hover",
  "shadow-[2px_2px_6px_#cbd5e1]",
  "hover:shadow-[3px_3px_8px_#cbd5e1]",
  "active:scale-[0.99] transition-all duration-150 cursor-pointer",
  "flex items-center justify-center gap-1.5",
  "disabled:opacity-60 disabled:cursor-not-allowed"
);

const NEUMORPHIC_SECONDARY_BUTTON = cn(
  "w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer",
  "bg-background text-text-secondary hover:text-text-primary",
  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "hover:shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff]",
  "active:scale-[0.99]",
  "flex items-center justify-center gap-1.5",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

/**
 * Detailed, informative dialog for client-side Stellar/Soroban escrow signing flow.
 *
 * All copy data lives in `src/lib/escrow-signing-copy.ts`.
 * Keyboard a11y (Escape / Tab-cycling / focus-on-open) lives in `useFocusTrapModal`.
 */
export function EscrowSigningModal({
  isOpen,
  state,
  error,
  transactionHash,
  walletName,
  operation,
  step,
  copy,
  onRetry,
  onClose,
}: EscrowSigningModalProps): React.JSX.Element | null {
  const [copied, setCopied] = useState(false);
  const [lastHash, setLastHash] = useState(transactionHash);
  if (transactionHash !== lastHash) {
    setLastHash(transactionHash);
    setCopied(false);
  }

  const isBlocking = state === "awaiting_signature" || state === "submitting";

  const { dialogRef } = useFocusTrapModal({ isOpen, onClose, isBlocking });

  if (!isOpen || typeof document === "undefined") return null;

  async function copyTransactionHash() {
    if (!transactionHash) return;
    try {
      await navigator.clipboard.writeText(transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy transaction hash:", err);
    }
  }

  const title = stateTitle(state, error);
  const stepInfo = getStepInfo(operation, step, copy);
  const showStepBadge = Boolean(stepInfo?.position) && state !== "error";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={isBlocking ? undefined : onClose}
        disabled={isBlocking}
        aria-label="Close"
      />

      {/* Neumorphic Modal Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="escrow-signing-title"
        className={cn(
          "relative w-full max-w-[460px] outline-none",
          "bg-background rounded-3xl p-5 sm:p-6",
          "shadow-[10px_10px_28px_#cbd5e1,-10px_-10px_28px_#ffffff]",
          "border border-white/80",
          "animate-scale-in space-y-4 text-left"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                state === "confirmed" && "bg-emerald-500",
                state === "error" && "bg-rose-500",
                (state === "building" ||
                  state === "awaiting_signature" ||
                  state === "submitting" ||
                  state === "idle") &&
                  "bg-primary animate-pulse"
              )}
            />
            <div className="min-w-0">
              <h2
                id="escrow-signing-title"
                className="text-sm sm:text-base font-bold text-text-primary truncate"
              >
                {title}
              </h2>
            </div>
          </div>

          {!isBlocking && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-xl shrink-0 ml-2",
                "text-text-secondary bg-background",
                "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "hover:shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff]",
                "hover:text-text-primary transition-all cursor-pointer"
              )}
            >
              <Icon path={ICON_PATHS.close} size="sm" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Step Badge */}
        {showStepBadge && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
              {stepInfo?.position}
            </span>
          </div>
        )}

        {/* State 1: Building / Idle */}
        {(state === "building" || state === "idle") && (
          <div role="status" className="space-y-4 py-2 text-center">
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-[3px_3px_7px_#d1d5db,-3px_-3px_7px_#ffffff] border border-white flex items-center justify-center">
                <LoadingSpinner size="md" className="text-primary" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">Preparing transaction…</p>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Fetching the unsigned transaction from the escrow smart contract and preparing cryptographic parameters for your wallet…
              </p>
            </div>

            {stepInfo && (
              <div className="p-3.5 rounded-2xl bg-background shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] border border-white/60 text-left text-xs text-text-secondary flex items-start gap-2.5">
                <Icon path={ICON_PATHS.shield} size="sm" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">{stepInfo.actionTitle}: </span>
                  <span>{stepInfo.actionExplanation}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State 2: Awaiting Signature */}
        {state === "awaiting_signature" && (
          <div role="status" className="space-y-4 py-2 text-center">
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="absolute -inset-2 rounded-2xl bg-primary/15 animate-ping opacity-75 pointer-events-none" />
              <div className="relative w-14 h-14 rounded-2xl bg-white shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff] border border-white flex items-center justify-center text-primary">
                <Icon path={ICON_PATHS.creditCard} size="md" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-text-primary font-bold leading-snug">
                Check your wallet extension to sign
                {walletName ? ` (${walletName})` : ""}
              </p>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                A signing prompt has been triggered. Please review and authorize this on-chain smart contract transaction.
              </p>
            </div>

            {/* Context & Security Guarantee Card */}
            <div className="p-3.5 rounded-2xl bg-background shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] border border-white/60 text-left space-y-2">
              <div className="flex items-center gap-1.5">
                <Icon path={ICON_PATHS.shield} size="sm" className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-bold text-text-primary">
                  {stepInfo?.actionTitle ?? "Smart Contract Authorization"}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {stepInfo?.actionExplanation ??
                  "You are authorizing an escrow smart contract interaction on the Stellar blockchain."}
              </p>
              <div className="pt-1.5 border-t border-black/5 flex items-center gap-1.5 text-[10px] text-text-secondary">
                <Icon path={ICON_PATHS.lock} size="sm" className="w-3 h-3 text-primary shrink-0" />
                <span>Non-custodial escrow: only this specific on-chain action is authorized.</span>
              </div>
            </div>

            {/* Popup instruction banner */}
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-text-secondary flex items-center justify-center gap-2">
              <Icon path={ICON_PATHS.infoCircle} size="sm" className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-[11px]">
                Please approve in your wallet popup.
              </span>
            </div>
          </div>
        )}

        {/* State 3: Submitting */}
        {state === "submitting" && (
          <div role="status" className="space-y-4 py-2 text-center">
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-[3px_3px_7px_#d1d5db,-3px_-3px_7px_#ffffff] border border-white flex items-center justify-center">
                <LoadingSpinner size="md" className="text-primary" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">Submitting to Stellar…</p>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Broadcasting your signed transaction to the Stellar network and awaiting consensus validation on the ledger.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-background shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] text-[11px] text-text-secondary flex items-center justify-center gap-1.5 border border-white/60">
              <Icon path={ICON_PATHS.clock} size="sm" className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Consensus usually takes 3–5 seconds. Please do not close this window.</span>
            </div>
          </div>
        )}

        {/* State 4: Confirmed */}
        {state === "confirmed" && (
          <div className="space-y-4 py-1 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 shadow-[3px_3px_8px_#d1d5db,-3px_-3px_8px_#ffffff] border border-emerald-200 flex items-center justify-center mx-auto">
              <Icon path={ICON_PATHS.check} size="lg" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-text-primary">
                On-Chain Action Confirmed
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {stepInfo?.confirmedMessage ?? "Funds are secured in smart escrow."}
              </p>
            </div>

            {/* 2-Step Release Notice for Buyer */}
            {stepInfo && operation === "release" && step === "approve_milestone" && (
              <div className="rounded-2xl p-3.5 bg-primary/5 shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] border border-primary/20 space-y-2.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                    <Icon path={ICON_PATHS.infoCircle} size="sm" className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-text-primary">
                    2-Step Release Flow: Action Needed Next
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Delivery has been approved on-chain. On Stellar, releasing escrow payment requires two separate cryptographic signatures for buyer security. Once you close this modal, click <strong className="text-text-primary">&ldquo;Release Funds&rdquo;</strong> again to finalize the payment transfer to the freelancer.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Icon path={ICON_PATHS.check} size="sm" className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-emerald-800">Step 1: Done</p>
                      <p className="truncate text-[9px] text-emerald-700">Milestone approved</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px]">
                      2
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-amber-900">Step 2: Next</p>
                      <p className="truncate text-[9px] text-amber-700">Release payment</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Hash & Explorer Section */}
            {transactionHash && (
              <div className="rounded-2xl p-3.5 bg-background shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] border border-white/60 space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon path={ICON_PATHS.shield} size="sm" className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      Transaction Hash
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-text-secondary bg-black/5 px-2 py-0.5 rounded-full">
                    Stellar Ledger
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary leading-snug">
                  This unique hash is permanent proof of your transaction on the Stellar blockchain. You can verify it on any block explorer.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 rounded-xl bg-white/80 border border-black/5">
                  <code className="font-mono text-xs font-bold text-text-primary truncate select-all px-1 py-0.5">
                    {truncateHash(transactionHash)}
                  </code>

                  <div className="flex items-center gap-1.5 shrink-0 justify-end">
                    <button
                      type="button"
                      onClick={copyTransactionHash}
                      aria-label={copied ? "Transaction hash copied" : "Copy transaction hash"}
                      title={copied ? "Copied!" : "Copy transaction hash"}
                      className={cn(
                        "p-1.5 px-2.5 rounded-lg text-xs font-semibold",
                        "bg-background text-text-secondary",
                        "shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff]",
                        "hover:shadow-[inset_1px_1px_2px_#d1d5db]",
                        "hover:text-text-primary transition-all cursor-pointer flex items-center gap-1.5",
                        copied && "text-emerald-600 font-bold"
                      )}
                    >
                      <Icon
                        path={copied ? ICON_PATHS.check : ICON_PATHS.copy}
                        size="sm"
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
                    </button>

                    <a
                      href={`${STELLAR_EXPLORER_URL}/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View transaction on Stellar Expert"
                      className={cn(
                        "p-1.5 px-2.5 rounded-lg text-xs font-semibold",
                        "bg-background text-text-secondary",
                        "shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff]",
                        "hover:shadow-[inset_1px_1px_2px_#d1d5db]",
                        "hover:text-primary transition-all cursor-pointer flex items-center gap-1.5"
                      )}
                    >
                      <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Stellar Expert</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className={SOLID_PRIMARY_BUTTON}
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* State 5: Error */}
        {state === "error" && error && (
          <div className="space-y-4 py-1 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 shadow-[3px_3px_8px_#d1d5db,-3px_-3px_8px_#ffffff] border border-rose-200 flex items-center justify-center mx-auto">
              <Icon path={ICON_PATHS.alertTriangle} size="lg" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-text-primary">
                {errorCopy(error).title}
              </p>
              <p role="alert" className="text-xs text-text-secondary leading-relaxed">
                {errorCopy(error).message}
              </p>
            </div>

            {/* Action hint card */}
            <div className="rounded-2xl p-3.5 bg-background shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] border border-white/60 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5">
                <Icon path={ICON_PATHS.infoCircle} size="sm" className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                  Recommended Next Step
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {errorCopy(error).actionHint}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onRetry}
                className={SOLID_PRIMARY_BUTTON}
              >
                <span>Retry</span>
              </button>

              {error.code !== "XDR_EXPIRED" && (
                <button
                  type="button"
                  onClick={onClose}
                  className={NEUMORPHIC_SECONDARY_BUTTON}
                >
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
