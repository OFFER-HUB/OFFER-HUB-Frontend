"use client";

import { cn } from "@/lib/cn";
import { formatUsdc } from "@/lib/fees";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { useFeeQuote } from "@/hooks/use-fee-quote";
import type { ResolutionDecision } from "@/types/admin.types";

interface DisputeNetPreviewProps {
  decision: ResolutionDecision;
  orderAmount: string;
  /** Seller share, for a SPLIT. */
  releaseAmount?: string;
  /** Buyer share, for a SPLIT. */
  refundAmount?: string;
}

/**
 * What each party really receives from a resolution: the contract takes its
 * fees from every share it pays out, a refund included. Flags a freelancer
 * share too small to be cashed out to a bank.
 */
export function DisputeNetPreview({
  decision,
  orderAmount,
  releaseAmount,
  refundAmount,
}: DisputeNetPreviewProps): React.JSX.Element | null {
  const sellerGross = decision === "FULL_RELEASE" ? orderAmount : decision === "SPLIT" ? releaseAmount : null;
  const buyerGross = decision === "FULL_REFUND" ? orderAmount : decision === "SPLIT" ? refundAmount : null;
  const seller = useFeeQuote(sellerGross && Number(sellerGross) > 0 ? sellerGross : null);
  const buyer = useFeeQuote(buyerGross && Number(buyerGross) > 0 ? buyerGross : null);

  if (!seller && !buyer) return null;
  const sellerTooSmall = seller ? Number(seller.payoutAmount) < 10 : false;

  return (
    <div className={cn(NEUMORPHIC_INSET, "p-4 space-y-2 text-xs")} data-testid="dispute-net-preview" aria-live="polite">
      <p className="font-semibold text-text-primary">After the contract&apos;s fees (5.3%)</p>
      {buyer && (
        <div className="flex items-center justify-between text-text-secondary">
          <span>Client receives</span>
          <span className="font-mono font-bold text-text-primary">${formatUsdc(buyer.payoutAmount)}</span>
        </div>
      )}
      {seller && (
        <div className="flex items-center justify-between text-text-secondary">
          <span>Freelancer receives</span>
          <span className="font-mono font-bold text-text-primary">${formatUsdc(seller.payoutAmount)}</span>
        </div>
      )}
      {sellerTooSmall && (
        <p className="text-warning font-medium" role="alert">
          The freelancer&apos;s share is under $10 after fees: it stays in their wallet and can&apos;t be cashed out to a
          bank.
        </p>
      )}
    </div>
  );
}
