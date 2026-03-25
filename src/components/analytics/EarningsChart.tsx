"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import type { EarningsMonthlyPoint } from "@/lib/api/earnings";

const EarningsChartInner = dynamic(
  () => import("./EarningsChartInner").then((m) => m.EarningsChartInner),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn(
          "h-64 sm:h-80 rounded-2xl animate-pulse",
          "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      />
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
    <div
      className={cn(
        "p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        className
      )}
    >
      <h2 className="text-lg font-bold text-text-primary mb-1">Earnings by month</h2>
      <p className="text-sm text-text-secondary mb-4">
        Up to the last 12 months in your selected range. Dashed line shows your monthly goal when set.
      </p>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-text-secondary rounded-2xl bg-background">
          No earnings in this period yet.
        </div>
      ) : (
        <EarningsChartInner data={data} goalValue={goalValue} currency={currency} />
      )}
    </div>
  );
}
