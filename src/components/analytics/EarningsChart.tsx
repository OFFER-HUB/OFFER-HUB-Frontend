"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { EarningsMonthlyPoint } from "@/types/earnings.types";

const EarningsChartInner = dynamic(
  () => import("./EarningsChartInner").then((m) => m.EarningsChartInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-80 rounded-2xl animate-pulse bg-background shadow-[var(--shadow-neumorphic-inset-light)]" />
    ),
  }
);

interface EarningsChartProps {
  data: EarningsMonthlyPoint[];
  currency?: string;
  monthlyGoal?: string;
  className?: string;
}

export function EarningsChart({
  data,
  currency = "USD",
  monthlyGoal,
  className,
}: EarningsChartProps): React.JSX.Element {
  const goalNum = monthlyGoal ? parseFloat(monthlyGoal) : undefined;
  const goalValue = goalNum !== undefined && !Number.isNaN(goalNum) ? goalNum : undefined;

  return (
    <Card variant="neumorphic" padding="md" className={className}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Icon path={ICON_PATHS.trendingUp} size="sm" className="text-primary" />
          Earnings by Month
        </h2>
        {data.length > 0 ? (
          <span className="text-xs font-semibold text-text-secondary px-2.5 py-1 rounded-full bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
            {data.length} {data.length === 1 ? "month" : "months"}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-text-secondary mb-4">
        Monthly earnings distribution in your selected range. Dashed line indicates monthly goal when set.
      </p>

      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-sm text-text-secondary rounded-2xl bg-background shadow-[var(--shadow-neumorphic-inset-light)] p-6 text-center">
          <Icon path={ICON_PATHS.chartBar} size="lg" className="text-text-secondary/60 mb-2" />
          <p className="font-semibold text-text-primary">No monthly data points yet</p>
          <p className="text-xs text-text-secondary mt-1">
            As soon as completed orders settle, month-by-month trends will render here.
          </p>
        </div>
      ) : (
        <EarningsChartInner data={data} goalValue={goalValue} currency={currency} />
      )}
    </Card>
  );
}
