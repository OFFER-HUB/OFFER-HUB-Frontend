"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { getPayoutStatus, type PayoutApiError } from "@/lib/api/orders";
import { retryPayout } from "@/lib/api/payout";
import { SUPPORTED_CORRIDORS } from "@/lib/api/bank-accounts";
import type { Payout, PayoutStatus } from "@/types/order.types";
import { usePayoutSigning } from "@/hooks/usePayoutSigning";
import { currentWalletName } from "@/hooks/useEscrowSigningAction";
import { EscrowSigningModal } from "@/components/escrow/EscrowSigningModal";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";

const POLL_INTERVAL_MS = 5000;

const STEPS: Array<{ status: PayoutStatus; label: string }> = [
  { status: "PENDING", label: "Pending" },
  { status: "PROCESSING", label: "Processing" },
  { status: "COMPLETED", label: "Completed" },
];

function formatCountdown(expiresAt: number): string {
  const remainingMs = expiresAt - Date.now();
  if (remainingMs <= 0) return "expired";
  const minutes = Math.floor(remainingMs / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function corridorLabel(corridor: string): string {
  const [country, rail] = corridor.split("/");
  return SUPPORTED_CORRIDORS.find((c) => c.country === country && c.rail === rail)?.label ?? corridor;
}

function formatFiat(amount: string, currency: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}

function StepIndicator({ status }: { status: PayoutStatus }): React.JSX.Element {
  if (status === "FAILED") {
    return (
      <div className="flex items-center gap-3 text-error">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-error/10 shrink-0">
          <Icon path={ICON_PATHS.alertCircle} size="md" />
        </div>
        <span className="font-semibold">Payout failed</span>
      </div>
    );
  }

  if (status === "REFUNDED") {
    return (
      <div className="flex items-center gap-3 text-warning">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/10 shrink-0">
          <Icon path={ICON_PATHS.arrowLeft} size="md" />
        </div>
        <span className="font-semibold">Payout refunded</span>
      </div>
    );
  }

  if (status === "AWAITING_SIGNATURE") {
    return (
      <div className="flex items-center gap-3 text-primary">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 shrink-0">
          <Icon path={ICON_PATHS.creditCard} size="md" />
        </div>
        <span className="font-semibold">Your signature is needed</span>
      </div>
    );
  }

  if (status === "ON_HOLD") {
    return (
      <div className="flex items-center gap-3 text-warning">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/10 shrink-0">
          <LoadingSpinner size="sm" className="text-warning" />
        </div>
        <span className="font-semibold">Under compliance review</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const isPassed = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isReached = index <= currentIndex;

        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-background",
                  isReached
                    ? "text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
                    : "text-text-secondary shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                )}
              >
                {isPassed ? (
                  <Icon path={ICON_PATHS.check} size="sm" className="text-primary" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isReached ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 -translate-y-3",
                  isPassed ? "bg-primary" : "bg-border-light"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface PayoutStatusCardProps {
  orderId: string;
  className?: string;
}

type CardState =
  | { kind: "loading" }
  | { kind: "waiting" }
  | { kind: "error"; message: string }
  | { kind: "ready"; payout: Payout };

/**
 * Tracks a released order's BlindPay off-ramp from pending through to the
 * fiat deposit, polling every 5s while it's still in flight.
 *
 * A 404 means the off-ramp job hasn't created the Payout row yet — expected
 * for a moment right after release — so it renders a "preparing" state
 * rather than nothing, and keeps polling silently underneath.
 */
export function PayoutStatusCard({ orderId, className }: PayoutStatusCardProps): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const [state, setState] = useState<CardState>({ kind: "loading" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const { address: connectedWalletAddress } = useWalletKit();
  const signing = usePayoutSigning();
  const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchPayout = useCallback(async () => {
    if (!token) return;
    try {
      const result = await getPayoutStatus(token, orderId);
      if (cancelledRef.current) return;
      setState({ kind: "ready", payout: result });
      if (result.status === "COMPLETED" || result.status === "FAILED" || result.status === "REFUNDED") {
        stopPolling();
      }
    } catch (err) {
      if (cancelledRef.current) return;
      const status = (err as PayoutApiError).status;
      if (status === 404) {
        // Off-ramp job hasn't created the row yet — keep polling silently.
        setState({ kind: "waiting" });
        return;
      }
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not load payout status.",
      });
      stopPolling();
    }
  }, [token, orderId, stopPolling]);

  const startPolling = useCallback(() => {
    if (pollRef.current !== null) return;
    pollRef.current = setInterval(() => void fetchPayout(), POLL_INTERVAL_MS);
  }, [fetchPayout]);

  useEffect(() => {
    if (!token) return;
    cancelledRef.current = false;

    void fetchPayout();
    startPolling();

    return () => {
      cancelledRef.current = true;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fetchPayout, stopPolling]);

  const handleSignClick = useCallback(() => {
    if (!connectedWalletAddress) {
      setIsWalletConnectOpen(true);
      return;
    }
    void signing.sign(orderId);
  }, [connectedWalletAddress, orderId, signing]);

  /**
   * Re-attempts a FAILED payout server-side, re-resolving the seller's
   * current default bank account instead of whatever was frozen on the
   * payout at its first attempt. Fixes the case that used to leave a seller
   * stuck forever on a broken account: adding a new one and setting it
   * default did nothing, because nothing ever re-read it until now.
   */
  const handleRetryPayout = useCallback(async () => {
    if (!token) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      await retryPayout(token, orderId);
      // Polling stopped when the card first saw FAILED — restart it so the
      // now-PENDING (then, shortly, AWAITING_SIGNATURE or COMPLETED) status
      // shows up without a manual page refresh.
      await fetchPayout();
      startPolling();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Failed to retry the payout.");
    } finally {
      setIsRetrying(false);
    }
  }, [token, orderId, fetchPayout, startPolling]);

  const isSigningModalOpen =
    signing.state === "building" ||
    signing.state === "awaiting_signature" ||
    signing.state === "submitting" ||
    signing.state === "confirmed" ||
    signing.state === "error";

  if (state.kind === "loading" || state.kind === "waiting") {
    return (
      <div className={cn(NEUMORPHIC_CARD, className)}>
        <div role="status" className="flex items-center justify-center gap-2.5 py-6 text-sm text-text-secondary">
          <LoadingSpinner size="sm" />
          {state.kind === "loading" ? "Loading payout status..." : "Preparing your payout..."}
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className={cn(NEUMORPHIC_CARD, className)}>
        <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Icon path={ICON_PATHS.currency} size="md" className="text-primary" />
          Payout status
        </h2>
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      </div>
    );
  }

  const { payout } = state;

  return (
    <div className={cn(NEUMORPHIC_CARD, className)}>
      <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Icon path={ICON_PATHS.currency} size="md" className="text-primary" />
        Payout status
      </h2>
      <p className="text-sm text-text-secondary mb-5">{corridorLabel(payout.corridor)}</p>

      <StepIndicator status={payout.status} />

      <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4 mt-5 space-y-2")}>
        {payout.status === "COMPLETED" && payout.fiatAmount ? (
          <div className="flex items-center gap-2 text-success">
            <Icon path={ICON_PATHS.check} size="md" />
            <p className="text-sm font-medium">
              {formatFiat(payout.fiatAmount, payout.fiatCurrency)} deposited to your bank account
            </p>
          </div>
        ) : payout.status === "FAILED" ? (
          <div className="space-y-3">
            <p className="text-sm text-text-primary">
              {payout.failureReason ?? "This payout could not be completed."}
            </p>
            <p className="text-xs text-text-secondary">
              This usually resolves itself on retry — for example, if it failed because of an
              issue with your bank account, add a new one, set it as your default, then retry.
            </p>
            {retryError && (
              <div role="alert" className="rounded-xl bg-error/10 p-3 text-xs text-error">
                {retryError}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => void handleRetryPayout()}
                disabled={isRetrying}
                className={cn(PRIMARY_BUTTON, "justify-center")}
              >
                {isRetrying ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <Icon path={ICON_PATHS.refresh} size="sm" />
                    <span>Retry Payout</span>
                  </>
                )}
              </button>
              <Link
                href="/app/chat"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Icon path={ICON_PATHS.chat} size="sm" />
                Contact Support
              </Link>
            </div>
          </div>
        ) : payout.status === "REFUNDED" ? (
          <>
            <p className="text-sm text-text-primary">
              {payout.failureReason ?? "BlindPay returned the funds to OfferHub."}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Our team will reach out to arrange a new transfer to your bank account.
            </p>
            <Link
              href="/app/chat"
              className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-primary hover:underline"
            >
              <Icon path={ICON_PATHS.chat} size="sm" />
              Contact Support
            </Link>
          </>
        ) : payout.status === "AWAITING_SIGNATURE" ? (
          <div className="space-y-3">
            <p className="text-sm text-text-primary">
              Your signature is needed to send the funds — your connected wallet is non-custodial, so
              OfferHub can't sign this transfer on your behalf.
            </p>
            {signing.prepared?.fiatAmount && (
              <p className="text-xs text-text-secondary">
                Sending as {formatFiat(signing.prepared.fiatAmount, signing.prepared.fiatCurrency)}
                {signing.prepared.expiresAt && (
                  <> — quote valid for {formatCountdown(signing.prepared.expiresAt)}</>
                )}
              </p>
            )}
            <button type="button" onClick={handleSignClick} className={cn(PRIMARY_BUTTON, "justify-center")}>
              <Icon path={ICON_PATHS.creditCard} size="sm" />
              <span>Sign & Send</span>
            </button>
          </div>
        ) : payout.status === "ON_HOLD" ? (
          <p className="text-sm text-text-secondary">
            {payout.failureReason
              ? `Under review: ${payout.failureReason}`
              : "Your payout is under compliance review. This usually resolves within 1–2 business days."}
          </p>
        ) : payout.fiatAmount ? (
          <p className="text-sm text-text-secondary">
            Settling as {formatFiat(payout.fiatAmount, payout.fiatCurrency)}
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            Settling to {payout.fiatCurrency} — amount confirmed once BlindPay processes the payout.
          </p>
        )}
      </div>

      <EscrowSigningModal
        isOpen={isSigningModalOpen}
        state={signing.state}
        error={signing.error}
        transactionHash={null}
        walletName={currentWalletName()}
        copy={{
          actionTitle: "Send Funds to BlindPay",
          actionExplanation:
            "You are authorizing the transfer of your released USDC from your own wallet to BlindPay, which converts and deposits it to your bank account.",
          confirmedMessage: "Transfer sent — BlindPay is now processing your payout.",
        }}
        onRetry={() => void signing.sign(orderId)}
        onClose={() => {
          const wasConfirmed = signing.state === "confirmed";
          signing.reset();
          if (wasConfirmed) void fetchPayout();
        }}
      />

      <WalletConnectModal
        isOpen={isWalletConnectOpen}
        onClose={() => setIsWalletConnectOpen(false)}
        onConnected={() => {
          setIsWalletConnectOpen(false);
          void signing.sign(orderId);
        }}
      />
    </div>
  );
}
