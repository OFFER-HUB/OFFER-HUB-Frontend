"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { WalletTransactionRow } from "@/lib/api/wallet";

interface RecentTransactionsProps {
  transactions: WalletTransactionRow[];
  className?: string;
}

const TYPE_STYLES = {
  credit: {
    icon: ICON_PATHS.plus,
    amountClass: "text-success",
    badgeClass: "bg-success/15 text-success",
    prefix: "+",
  },
  debit: {
    icon: ICON_PATHS.shoppingCart,
    amountClass: "text-text-primary",
    badgeClass: "bg-warning/15 text-warning",
    prefix: "−",
  },
  reserve: {
    icon: ICON_PATHS.clock,
    amountClass: "text-warning",
    badgeClass: "bg-warning/15 text-warning",
    prefix: "−",
  },
} as const;

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
        "p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900",
        "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
        "border-none transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Recent Transactions</h2>
          <p className="text-xs text-text-secondary mt-0.5">Latest account credits, debits & escrow</p>
        </div>
        <Link
          href="/app/wallet/transactions"
          className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline inline-flex items-center gap-1"
        >
          View all
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center text-sm text-text-secondary">
          <p>No transactions recorded yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => {
            const typeStyle = TYPE_STYLES[tx.type];
            return (
              <li
                key={tx.id}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl",
                  "bg-background",
                  "shadow-[var(--shadow-neumorphic-inset-light)] dark:shadow-[var(--shadow-neumorphic-inset-dark)]",
                  "hover:scale-[1.01] transition-transform duration-200"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    typeStyle.badgeClass
                  )}
                >
                  <Icon path={typeStyle.icon} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">{tx.description}</p>
                  <p className="text-xs text-text-secondary">{formatTime(tx.createdAt)}</p>
                </div>
                <span
                  className={cn(
                    "font-bold text-sm tabular-nums shrink-0",
                    typeStyle.amountClass
                  )}
                >
                  {typeStyle.prefix}
                  {formatMoney(tx.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
