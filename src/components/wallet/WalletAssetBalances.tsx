"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { STELLAR_NETWORK } from "@/config/wallet";
import { buildAccountExplorerUrl } from "@/services/stellar.service";
import type { StellarAccountBalances, StellarAssetBalance } from "@/types/wallet.types";

export interface WalletAssetBalancesProps {
  /** Public key of the connected wallet. */
  address: string;
  /** Balances read from Horizon, or null while none have loaded yet. */
  balances: StellarAccountBalances | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  /** True when the account has never been funded on this network. */
  isUnfunded: boolean;
  onRefresh: () => void;
  className?: string;
}

/**
 * `Intl.NumberFormat` cannot format these with `style: "currency"` — neither XLM
 * nor USDC is an ISO 4217 code — so amounts are formatted as plain decimals and
 * the asset code is rendered as the tile label instead. Stellar carries 7
 * decimal places; trailing zeros past two are dropped, so a whole balance still
 * reads as "25.00".
 */
const AMOUNT_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 7,
});

function formatAssetAmount(balance: string): string {
  const amount = Number.parseFloat(balance);
  return Number.isFinite(amount) ? AMOUNT_FORMATTER.format(amount) : balance;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

const TILE_STYLES = cn(
  "p-4 rounded-2xl bg-background",
  "shadow-[var(--shadow-neumorphic-inset-light)] dark:shadow-[var(--shadow-neumorphic-inset-dark)]"
);

interface AssetTileProps {
  asset: StellarAssetBalance;
  caption: string;
}

function AssetTile({ asset, caption }: AssetTileProps): React.JSX.Element {
  return (
    <div className={TILE_STYLES}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
        {asset.code}
      </p>
      <p className="text-lg font-bold text-text-primary tabular-nums break-all">
        {formatAssetAmount(asset.balance)}
      </p>
      <p className="text-xs text-text-secondary mt-1">
        {asset.hasTrustline ? caption : `No ${asset.code} trustline yet`}
      </p>
    </div>
  );
}

function BalancesSkeleton(): React.JSX.Element {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading on-chain balances</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse" aria-hidden="true">
        <div className={cn(TILE_STYLES, "h-[86px]")} />
        <div className={cn(TILE_STYLES, "h-[86px]")} />
      </div>
    </div>
  );
}

/**
 * XLM and USDC held by a connected external (non-custodial) wallet, read live
 * from Horizon. Rendered inside `BalanceCard` for `WalletType.EXTERNAL` wallets;
 * custodial balances keep using the platform ledger figures above it.
 */
export function WalletAssetBalances({
  address,
  balances,
  isLoading,
  isRefreshing,
  error,
  isUnfunded,
  onRefresh,
  className,
}: WalletAssetBalancesProps): React.JSX.Element {
  const accountId = useId();

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Connected wallet assets</h3>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
            <span id={accountId} className="font-mono text-text-secondary">
              {truncateAddress(address)}
            </span>
            <span>•</span>
            <span>{STELLAR_NETWORK === "public" ? "Stellar mainnet" : "Stellar testnet"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={buildAccountExplorerUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold",
              "bg-background shadow-[var(--shadow-neumorphic-inset-light)] dark:shadow-[var(--shadow-neumorphic-inset-dark)] text-text-secondary hover:text-primary transition-colors",
              "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
            )}
          >
            <Icon path={ICON_PATHS.externalLink} size="sm" />
            Explorer
          </a>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh on-chain balances"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold",
              "bg-white dark:bg-slate-900 text-text-primary",
              "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
              "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
              "disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer",
              "transition-all duration-200"
            )}
          >
            <Icon
              path={ICON_PATHS.refresh}
              size="sm"
              className={cn(isRefreshing && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? <BalancesSkeleton /> : null}

      {!isLoading && error !== null ? (
        <div
          role="alert"
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl",
            "bg-error/10 border border-error/20"
          )}
        >
          <p className="flex items-start gap-2 text-sm text-error">
            <Icon path={ICON_PATHS.alertCircle} size="sm" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-text-primary",
              "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)] active:shadow-[var(--shadow-neumorphic-inset-light)]",
              "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none cursor-pointer"
            )}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && error === null && balances !== null ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-live="polite">
            <AssetTile asset={balances.xlm} caption="Native Stellar balance" />
            <AssetTile asset={balances.usdc} caption="Stablecoin balance" />
          </div>
          {isUnfunded ? (
            <p role="status" className="flex items-start gap-2 text-xs text-text-secondary">
              <Icon path={ICON_PATHS.infoCircle} size="sm" className="mt-0.5 shrink-0" />
              <span>
                This account is not funded on {STELLAR_NETWORK === "public" ? "mainnet" : "testnet"}{" "}
                yet. Balances appear once it receives its first payment.
              </span>
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
