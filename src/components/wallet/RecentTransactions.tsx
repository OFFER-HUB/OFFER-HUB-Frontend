"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { WalletTransactionRow } from "@/lib/api/wallet";

interface RecentTransactionsProps {
  transactions: WalletTransactionRow[];
  className?: string;
}

function formatMoney(value: string): string {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/**
 * Compact list of the latest wallet movements.
 */
export function RecentTransactions({ transactions, className }: RecentTransactionsProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        className
      )}
    >
      <h2 className="text-lg font-bold text-text-primary mb-4">Recent transactions</h2>
      <ul className="space-y-3">
        {transactions.map((tx) => {
          const isCredit = tx.type === "credit";
          return (
            <li
              key={tx.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl",
                "bg-background",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  isCredit ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                )}
              >
                <Icon path={isCredit ? ICON_PATHS.plus : ICON_PATHS.shoppingCart} size="md" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{tx.description}</p>
                <p className="text-xs text-text-secondary">{formatTime(tx.createdAt)}</p>
              </div>
              <span
                className={cn(
                  "font-semibold tabular-nums shrink-0",
                  isCredit ? "text-success" : "text-text-primary"
                )}
              >
                {isCredit ? "+" : "−"}
                {formatMoney(tx.amount)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
