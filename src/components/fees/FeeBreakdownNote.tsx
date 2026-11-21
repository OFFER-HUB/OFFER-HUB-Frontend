"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { useFeeQuote } from "@/hooks/use-fee-quote";
import { FeeBreakdownLines, type FeeAudience } from "./FeeBreakdownLines";

interface FeeBreakdownNoteProps {
  /** The amount being typed or confirmed (an offer budget, a service price, a proposed rate). */
  amount: string | number | null | undefined;
  audience: FeeAudience;
  /** Adds the note that contract fees also apply to a refund (shown to clients). */
  showRefundNote?: boolean;
  className?: string;
}

/**
 * Shows, before anything is created or paid, what the freelancer will receive
 * after the escrow fees. Renders nothing until the API has an answer.
 */
export function FeeBreakdownNote({
  amount,
  audience,
  showRefundNote = false,
  className,
}: FeeBreakdownNoteProps): React.JSX.Element | null {
  const breakdown = useFeeQuote(amount);
  if (!breakdown) return null;

  return (
    <div className={cn(NEUMORPHIC_INSET, "p-4 space-y-3", className)} aria-live="polite">
      <FeeBreakdownLines breakdown={breakdown} audience={audience} />
      {showRefundNote && (
        <p className="text-[11px] leading-relaxed text-text-secondary">
          The escrow contract also keeps its fees if the order is refunded: a refund returns the amount minus fees.
        </p>
      )}
    </div>
  );
}
