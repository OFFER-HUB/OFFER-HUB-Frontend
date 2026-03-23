"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WalletChartPoint } from "@/lib/api/wallet";

interface BalanceChartInnerProps {
  data: WalletChartPoint[];
}

/**
 * Earnings vs spending chart (client-only — loaded via dynamic import).
 */
export function BalanceChartInner({ data }: BalanceChartInnerProps): React.JSX.Element {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="walletEarn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="walletSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light, #e5e7eb)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} width={40} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "4px 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === "earnings" ? "Earnings" : "Spending",
            ]}
          />
          <Area
            type="monotone"
            dataKey="earnings"
            stroke="var(--color-primary)"
            fill="url(#walletEarn)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="spending"
            stroke="#d97706"
            fill="url(#walletSpend)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
