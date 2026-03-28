"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface BalanceCardProps {
  available: string;
  reserved: string;
  currency: string;
  className?: string;
}

function formatMoney(value: string, currency: string): string {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

/**
 * Shows available vs reserved balance in a neumorphic card.
 */
export function BalanceCard({
  available,
  reserved,
  currency,
  className,
}: BalanceCardProps): React.JSX.Element {
  const availN = parseFloat(available);
  const resN = parseFloat(reserved);
  const totalN =
    !Number.isNaN(availN) && !Number.isNaN(resN) ? availN + resN : Number.NaN;
  const totalDisplay = Number.isNaN(totalN)
    ? formatMoney(available, currency)
    : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalN);

  return (
    <div
      className={cn(
        "p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">Total balance</p>
          <p className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            {totalDisplay}
          </p>
          <p className="text-xs text-text-secondary mt-2">Available plus reserved escrow</p>
        </div>
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
            "bg-primary text-white",
            "shadow-[4px_4px_8px_#d1d5db,-2px_-2px_6px_#ffffff]"
          )}
        >
          <Icon path={ICON_PATHS.currency} size="lg" className="text-white" />
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl",
          "bg-background",
          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      >
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">
            Available
          </p>
          <p className="text-lg font-semibold text-success">{formatMoney(available, currency)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">
            Reserved
          </p>
          <p className="text-lg font-semibold text-warning">{formatMoney(reserved, currency)}</p>
        </div>
      </div>
    </div>
  );
}
