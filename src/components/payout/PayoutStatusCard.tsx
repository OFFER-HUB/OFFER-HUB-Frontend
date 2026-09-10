"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import { getPayoutStatus, type PayoutApiError } from "@/lib/api/orders";
import { SUPPORTED_CORRIDORS } from "@/lib/api/bank-accounts";
import type { Payout, PayoutStatus } from "@/types/order.types";

const POLL_INTERVAL_MS = 5000;

const STEPS: Array<{ status: PayoutStatus; label: string }> = [
  { status: "PENDING", label: "Pending" },
  { status: "PROCESSING", label: "Processing" },
  { status: "COMPLETED", label: "Completed" },
];

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

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    function stopPolling() {
      if (pollRef.current !== null) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    async function poll() {
      try {
        const result = await getPayoutStatus(token as string, orderId);
        if (cancelled) return;
        setState({ kind: "ready", payout: result });
        if (result.status === "COMPLETED" || result.status === "FAILED" || result.status === "REFUNDED") {
          stopPolling();
        }
      } catch (err) {
        if (cancelled) return;
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
    }

    void poll();
    pollRef.current = setInterval(() => void poll(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [token, orderId]);

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
          <>
            <p className="text-sm text-text-primary">
              {payout.failureReason ?? "This payout could not be completed."}
            </p>
            <Link
              href="/app/chat"
              className={cn(
                "inline-flex items-center gap-2 mt-2 text-sm font-medium text-primary hover:underline"
              )}
            >
              <Icon path={ICON_PATHS.chat} size="sm" />
              Contact Support
            </Link>
          </>
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
    </div>
  );
}
