"use client";

import { cn } from "@/lib/cn";
import type { EarningsCategoryRow, EarningsClientRow } from "@/lib/api/earnings";

interface EarningsBreakdownProps {
  byClient: EarningsClientRow[];
  byCategory: EarningsCategoryRow[];
  currency?: string;
  className?: string;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface BreakdownListProps {
  title: string;
  subtitle: string;
  rows: { id: string; label: string; earnings: number; orderCount: number }[];
  maxEarnings: number;
  currency: string;
}

function BreakdownList({
  title,
  subtitle,
  rows,
  maxEarnings,
  currency,
}: BreakdownListProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      <h2 className="text-lg font-bold text-text-primary mb-1">{title}</h2>
      <p className="text-sm text-text-secondary mb-4">{subtitle}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary py-8 text-center">No data for this range.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => {
            const pct = maxEarnings > 0 ? Math.round((row.earnings / maxEarnings) * 100) : 0;
            return (
              <li key={row.id}>
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-medium text-text-primary truncate">{row.label}</span>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap tabular-nums">
                    {formatMoney(row.earnings, currency)}
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2 rounded-full overflow-hidden",
                    "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                  )}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {row.orderCount} {row.orderCount === 1 ? "order" : "orders"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function EarningsBreakdown({
  byClient,
  byCategory,
  currency = "USD",
  className,
}: EarningsBreakdownProps): React.JSX.Element {
  const clientRows = byClient.map((c) => ({
    id: c.clientId,
    label: c.clientName,
    earnings: c.earnings,
    orderCount: c.orderCount,
  }));
  const categoryRows = byCategory.map((c) => ({
    id: c.categoryId,
    label: c.categoryLabel,
    earnings: c.earnings,
    orderCount: c.orderCount,
  }));

  const maxClient = Math.max(0, ...clientRows.map((r) => r.earnings));
  const maxCat = Math.max(0, ...categoryRows.map((r) => r.earnings));

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      <BreakdownList
        title="Top clients"
        subtitle="Where your revenue is concentrated"
        rows={clientRows}
        maxEarnings={maxClient}
        currency={currency}
      />
      <BreakdownList
        title="By service category"
        subtitle="Mix of work in the selected period"
        rows={categoryRows}
        maxEarnings={maxCat}
        currency={currency}
      />
    </div>
  );
}
