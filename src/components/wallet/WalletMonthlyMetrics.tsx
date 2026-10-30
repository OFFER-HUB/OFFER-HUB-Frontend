import { formatPct, parseMoney, pctVsPrevious } from "@/lib/earnings-utils";
import { cn } from "@/lib/cn";
import type { WalletMonthlyStats, WalletWithdrawals } from "@/types/wallet.types";

interface WalletMonthlyMetricsProps {
  monthly: WalletMonthlyStats;
  withdrawals: WalletWithdrawals;
  currency: string;
}

function formatCurrency(value: string, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseMoney(value));
}

export function WalletMonthlyMetrics({
  monthly,
  withdrawals,
  currency,
}: WalletMonthlyMetricsProps): React.JSX.Element {
  const earningsPercentage = pctVsPrevious(
    monthly.currentMonthEarnings,
    monthly.previousMonthEarnings
  );
  const spendingPercentage = pctVsPrevious(
    monthly.currentMonthSpending,
    monthly.previousMonthSpending
  );

  return (
    <section className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-[var(--shadow-neumorphic-light)] transition-all duration-300 dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)]">
        <p className="text-sm font-medium text-text-secondary">Earned this month</p>
        <p className="mb-2 text-xs text-text-secondary">From completed orders</p>
        <p className="text-2xl font-bold text-text-primary sm:text-3xl">
          {formatCurrency(monthly.currentMonthEarnings, currency)}
        </p>
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            earningsPercentage === null && "text-text-secondary",
            earningsPercentage !== null &&
              (earningsPercentage >= 0 ? "text-success" : "text-error")
          )}
        >
          {earningsPercentage === null
            ? "No comparison last month"
            : `${formatPct(earningsPercentage)} vs last month`}
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-[var(--shadow-neumorphic-light)] transition-all duration-300 dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)]">
        <p className="text-sm font-medium text-text-secondary">Withdrawn this month</p>
        <p className="mb-2 text-xs text-text-secondary">Completed withdrawals</p>
        <p className="text-2xl font-bold text-text-primary sm:text-3xl">
          {formatCurrency(monthly.currentMonthSpending, currency)}
        </p>
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            spendingPercentage === null && "text-text-secondary",
            spendingPercentage !== null &&
              (spendingPercentage <= 0 ? "text-success" : "text-warning")
          )}
        >
          {spendingPercentage === null
            ? "No comparison last month"
            : `${formatPct(spendingPercentage)} vs last month`}
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-[var(--shadow-neumorphic-light)] transition-all duration-300 sm:col-span-2 lg:col-span-1 dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)]">
        <p className="text-sm font-medium text-text-secondary">Pending withdrawals</p>
        <p className="mb-2 text-xs text-text-secondary">
          {withdrawals.pendingCount} open {withdrawals.pendingCount === 1 ? "request" : "requests"}
        </p>
        <p className="text-2xl font-bold text-text-primary sm:text-3xl">
          {formatCurrency(withdrawals.pendingTotal, currency)}
        </p>
        <p className="mt-2 text-xs text-text-secondary">Currently in processing queue</p>
      </div>
    </section>
  );
}
