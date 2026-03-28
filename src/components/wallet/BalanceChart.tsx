"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import type { WalletChartPoint } from "@/lib/api/wallet";

const BalanceChartInner = dynamic(
  () => import("./BalanceChartInner").then((m) => m.BalanceChartInner),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn(
          "h-64 sm:h-72 rounded-2xl animate-pulse",
          "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      />
    ),
  }
);

interface BalanceChartProps {
  data: WalletChartPoint[];
  className?: string;
}

export function BalanceChart({ data, className }: BalanceChartProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
        className
      )}
    >
      <h2 className="text-lg font-bold text-text-primary mb-1">Cash flow</h2>
      <p className="text-sm text-text-secondary mb-4">Earnings and spending by period</p>
      <BalanceChartInner data={data} />
    </div>
  );
}
