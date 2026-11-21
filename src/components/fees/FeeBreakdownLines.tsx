import { formatUsdc } from "@/lib/fees";
import type { FeeBreakdown } from "@/types/fees.types";

export type FeeAudience = "client" | "freelancer";

interface FeeBreakdownLinesProps {
  breakdown: FeeBreakdown;
  audience: FeeAudience;
}

/**
 * The real amounts of an order, worded for who is reading: the client sees
 * what they pay and what reaches the freelancer, the freelancer sees what
 * they receive. Numbers come from the API; nothing is computed here.
 */
export function FeeBreakdownLines({ breakdown, audience }: FeeBreakdownLinesProps): React.JSX.Element {
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: audience === "client" ? "You pay" : "Order price", value: formatUsdc(breakdown.gross) },
    { label: `Platform fee (${breakdown.platformFeePercent}%)`, value: `− ${formatUsdc(breakdown.platformFee)}` },
    {
      label: `Escrow network fee (${breakdown.trustlessWorkFeePercent}%)`,
      value: `− ${formatUsdc(breakdown.trustlessWorkFee)}`,
    },
    {
      label: audience === "client" ? "Freelancer receives" : "You receive",
      value: formatUsdc(breakdown.payoutAmount),
      strong: true,
    },
  ];

  return (
    <dl className="space-y-2.5 text-xs" data-testid="fee-breakdown">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-text-secondary">
          <dt>{row.label}</dt>
          <dd className={row.strong ? "font-bold text-text-primary font-mono" : "font-semibold text-text-primary font-mono"}>
            ${row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
