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
          "bg-background shadow-[var(--shadow-neumorphic-inset-light)] dark:shadow-[var(--shadow-neumorphic-inset-dark)]"
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
        "p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900",
        "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
        "border-none min-w-0 overflow-hidden transition-all duration-300",
        className
      )}
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text-primary">Earnings vs Withdrawals</h2>
        <p className="text-xs text-text-secondary mt-0.5">Earnings and withdrawals comparison over time</p>
      </div>
      <div className="min-w-0 overflow-hidden">
        <BalanceChartInner data={data} />
      </div>
    </div>
  );
}
