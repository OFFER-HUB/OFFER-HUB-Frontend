"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  WalletAssetBalances,
  type WalletAssetBalancesProps,
} from "@/components/wallet/WalletAssetBalances";

/**
 * Live Horizon balances for a connected external wallet. Everything the
 * `useWalletBalance` hook returns, plus its refresh callback.
 */
export type BalanceCardExternalWallet = Omit<WalletAssetBalancesProps, "className">;

interface BalanceCardProps {
  available: string;
  reserved: string;
  currency: string;
  className?: string;
  /**
   * On-chain XLM and USDC of the connected `WalletType.EXTERNAL` wallet.
   * Omitted for custodial (INVISIBLE) wallets, which hold nothing on Horizon —
   * the card then renders exactly as before.
   */
  externalWallet?: BalanceCardExternalWallet;
}

/**
 * Formats the platform ledger balance, which is a fiat currency. Not reusable
 * for XLM or USDC: `style: "currency"` requires an ISO 4217 code.
 */
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
  externalWallet,
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
        "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900",
        "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
        "border-none transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">Total Balance</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
            {totalDisplay}
          </p>
          <p className="text-xs text-text-secondary mt-2">Available funds plus active escrow reserves</p>
        </div>
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
            "bg-primary/10 text-primary",
            "shadow-[var(--shadow-neumorphic-inset-light)] dark:shadow-[var(--shadow-neumorphic-inset-dark)]"
          )}
        >
          <Icon path={ICON_PATHS.currency} size="lg" className="text-primary" />
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl",
          "bg-background",
          "shadow-[var(--shadow-neumorphic-inset-light)] dark:shadow-[var(--shadow-neumorphic-inset-dark)]"
        )}
      >
        <div className="flex flex-col justify-between">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-success" />
            Available for Payout
          </p>
          <p className="text-xl sm:text-2xl font-bold text-success tracking-tight">{formatMoney(available, currency)}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">Ready for instant withdrawal</p>
        </div>
        <div className="flex flex-col justify-between">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-warning" />
            Locked in Escrow
          </p>
          <p className="text-xl sm:text-2xl font-bold text-warning tracking-tight">{formatMoney(reserved, currency)}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">Released upon milestone approval</p>
        </div>
      </div>

      {externalWallet ? (
        <WalletAssetBalances
          {...externalWallet}
          className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800"
        />
      ) : null}
    </div>
  );
}
