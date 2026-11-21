"use client";

import { cn } from "@/lib/cn";
import { formatUsdc } from "@/lib/fees";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { useFeeQuote } from "@/hooks/use-fee-quote";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { FeeBreakdownLines } from "@/components/fees/FeeBreakdownLines";
import type { Order } from "@/types/order.types";

interface OrderFinancialSummaryProps {
  order: Pick<Order, "amount" | "feeBreakdown">;
  isBuyer: boolean;
}

/**
 * The order's real amounts: what the client pays, the fees the escrow contract
 * takes, and what the freelancer receives. Uses the order's `feeBreakdown`
 * from the API, or asks the fee quote endpoint when an older API omits it.
 */
export function OrderFinancialSummary({ order, isBuyer }: OrderFinancialSummaryProps): React.JSX.Element {
  const quoted = useFeeQuote(order.feeBreakdown ? null : order.amount);
  const breakdown = order.feeBreakdown ?? quoted;

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 space-y-4")}>
      <div className="flex items-center justify-between pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Financial Summary</span>
        <span className="text-xs font-mono font-bold text-text-primary">${formatUsdc(order.amount)} USDC</span>
      </div>

      {breakdown ? (
        <FeeBreakdownLines breakdown={breakdown} audience={isBuyer ? "client" : "freelancer"} />
      ) : (
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Agreed Project Price:</span>
          <span className="font-semibold text-text-primary font-mono">${formatUsdc(order.amount)}</span>
        </div>
      )}

      <div className="pt-3 flex items-start gap-2 text-[11px] text-text-secondary leading-relaxed">
        <Icon path={ICON_PATHS.lock} size="sm" className="text-primary flex-shrink-0 mt-0.5" />
        <span>
          Funds remain safely held in smart escrow until the order is signed off. The contract takes its fees when it
          pays out, including on a refund.
        </span>
      </div>
    </div>
  );
}
