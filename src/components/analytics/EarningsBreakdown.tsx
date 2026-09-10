"use client";

import { Card } from "@/components/ui/Card";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { EarningsCategoryRow, EarningsClientRow } from "@/types/earnings.types";

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
  iconPath: string;
  rows: { id: string; label: string; earnings: number; orderCount: number }[];
  maxEarnings: number;
  currency: string;
}

function BreakdownList({
  title,
  subtitle,
  iconPath,
  rows,
  maxEarnings,
  currency,
}: BreakdownListProps): React.JSX.Element {
  return (
    <Card variant="neumorphic" padding="md">
      <div className="flex items-center gap-2 mb-1">
        <Icon path={iconPath} size="sm" className="text-primary" />
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      </div>
      <p className="text-xs text-text-secondary mb-4">{subtitle}</p>

      {rows.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center rounded-2xl bg-background shadow-[var(--shadow-neumorphic-inset-light)] p-6">
          <Icon path={iconPath} size="lg" className="text-text-secondary/50 mb-2" />
          <p className="text-sm font-semibold text-text-primary">No data in this range</p>
          <p className="text-xs text-text-secondary mt-1">Breakdown will display here when orders settle.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row, index) => {
            const pct = maxEarnings > 0 ? Math.round((row.earnings / maxEarnings) * 100) : 0;
            return (
              <li key={row.id} className="group">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] text-[10px] font-bold text-text-secondary flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-sm text-text-primary truncate">
                      {row.label}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-primary tabular-nums">
                      {formatMoney(row.earnings, currency)}
                    </span>
                  </div>
                </div>

                <div className="h-2.5 rounded-full overflow-hidden bg-background shadow-[var(--shadow-neumorphic-inset-light)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-alt transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-secondary mt-1 px-0.5">
                  <span>
                    {row.orderCount} {row.orderCount === 1 ? "order" : "orders"}
                  </span>
                  {maxEarnings > 0 ? <span>{pct}% of top</span> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
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
        title="Top Clients"
        subtitle="Where your revenue is concentrated"
        iconPath={ICON_PATHS.users}
        rows={clientRows}
        maxEarnings={maxClient}
        currency={currency}
      />
      <BreakdownList
        title="By Service Category"
        subtitle="Mix of work delivered in the selected period"
        iconPath={ICON_PATHS.grid}
        rows={categoryRows}
        maxEarnings={maxCat}
        currency={currency}
      />
    </div>
  );
}
