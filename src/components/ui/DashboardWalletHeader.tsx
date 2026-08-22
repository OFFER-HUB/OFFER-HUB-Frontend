import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { WalletAddress } from "@/components/ui/WalletAddress";
import type { WalletBalanceSummary } from "@/lib/api/wallet";

const DEFAULT_WALLET_HREF = "/app/wallet";

interface OnChainUsdcBalance {
  /** USDC balance as Horizon reports it, e.g. "0" without a trustline. */
  amount: string;
  isLoading: boolean;
}

interface DashboardWalletHeaderProps {
  /** Stellar public key of the linked wallet, or null/undefined when none is linked. */
  walletAddress?: string | null;
  /** Platform-ledger balance (custodial). The balance pill stays hidden until it loads. */
  balance?: WalletBalanceSummary | null;
  /**
   * Live USDC balance read from Horizon for the connected wallet (SCF D1.1) — independent
   * of the platform ledger above. Omit while it hasn't loaded yet rather than passing zero.
   */
  onChainUsdc?: OnChainUsdcBalance | null;
  /** Route both the balance pill and the connect CTA point at. */
  walletHref?: string;
  className?: string;
}

function formatUsdc(amount: string): string {
  const n = parseFloat(amount);
  return Number.isNaN(n)
    ? amount
    : new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function formatAvailableBalance(balance: WalletBalanceSummary): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: balance.currency,
  }).format(parseFloat(balance.availableBalance));
}

/**
 * Wallet segment of a dashboard header: address plus balance when a wallet is
 * linked, or a CTA to connect one when it is not.
 *
 * Shared by the client and freelancer dashboards so the connected/not-connected
 * states cannot drift apart between them.
 */
export function DashboardWalletHeader({
  walletAddress,
  balance,
  onChainUsdc,
  walletHref = DEFAULT_WALLET_HREF,
  className,
}: DashboardWalletHeaderProps): React.JSX.Element {
  if (!walletAddress) {
    return (
      <div className={cn("mt-4 inline-block", className)}>
        <Link
          href={walletHref}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-xl",
            "bg-white",
            "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            "active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
            "transition-all duration-200",
            "group"
          )}
        >
          <div className="w-5 h-5 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Icon path={ICON_PATHS.alertCircle} size="sm" className="text-red-500" />
          </div>
          <span className="text-sm font-medium text-text-secondary group-hover:text-red-500 transition-colors">
            No wallet connected
          </span>
          <Icon
            path={ICON_PATHS.chevronRight}
            size="sm"
            className="text-text-secondary/60 group-hover:text-red-500 transition-colors group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("mt-4 flex flex-wrap items-center gap-3", className)}>
      <WalletAddress address={walletAddress} />
      {balance && (
        <Link
          href={walletHref}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl",
            "bg-white",
            "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "hover:shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]",
            "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            "transition-all duration-200",
            "group"
          )}
          title="View wallet"
        >
          <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon
              path={ICON_PATHS.currency}
              size="sm"
              className="text-primary group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col items-start leading-none pr-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-text-secondary">
              Balance
            </span>
            <span className="text-xs font-bold text-text-primary mt-0.5 group-hover:text-primary transition-colors">
              {formatAvailableBalance(balance)}
            </span>
          </div>
          <Icon
            path={ICON_PATHS.chevronRight}
            size="sm"
            className="text-text-secondary/50 group-hover:text-primary transition-colors group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      )}
      {onChainUsdc && !onChainUsdc.isLoading && (
        <Link
          href={walletHref}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl",
            "bg-white",
            "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "hover:shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]",
            "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            "transition-all duration-200",
            "group"
          )}
          title="On-chain USDC balance of your connected wallet"
        >
          <div className="w-5 h-5 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
            <Icon
              path={ICON_PATHS.currency}
              size="sm"
              className="text-success group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col items-start leading-none pr-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-text-secondary">
              On-chain USDC
            </span>
            <span className="text-xs font-bold text-text-primary mt-0.5 group-hover:text-primary transition-colors">
              {formatUsdc(onChainUsdc.amount)}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}
