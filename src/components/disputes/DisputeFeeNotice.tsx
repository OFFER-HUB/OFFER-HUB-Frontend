"use client";

import { formatUsdc } from "@/lib/fees";
import { useFeeQuote } from "@/hooks/use-fee-quote";

interface DisputeFeeNoticeProps {
  orderAmount?: string;
}

/**
 * Tells both parties, before a dispute is opened, that the escrow contract
 * keeps its fees whatever the outcome: a full refund returns the order minus
 * fees, not the full amount. Renders nothing until the API answers.
 */
export function DisputeFeeNotice({ orderAmount }: DisputeFeeNoticeProps): React.JSX.Element | null {
  const breakdown = useFeeQuote(orderAmount ?? null);
  if (!breakdown) return null;

  return (
    <p className="text-sm text-text-secondary mb-4 leading-relaxed" data-testid="dispute-fee-notice">
      Whatever the outcome, the escrow contract keeps its fees ({breakdown.platformFeePercent + breakdown.trustlessWorkFeePercent}
      %): a full refund returns <strong className="text-text-primary">${formatUsdc(breakdown.payoutAmount)}</strong> to the
      client, and a full release pays the same to the freelancer.
    </p>
  );
}
