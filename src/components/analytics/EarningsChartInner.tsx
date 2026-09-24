"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EarningsMonthlyPoint } from "@/types/earnings.types";

type EarningsChartInnerProps = {
  data: EarningsMonthlyPoint[];
  goalValue?: number;
  currency?: string;
};

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function EarningsChartInner({
  data,
  goalValue,
  currency = "USD",
}: EarningsChartInnerProps): React.JSX.Element {
  const chartData = data.map((d) => ({
    label: d.label,
    earnings: d.earnings,
    orders: d.orderCount,
  }));

  const tiltLabels = data.length > 6;

  return (
    <div className="w-full h-64 sm:h-80 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="earnBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--color-primary-alt)" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light, #e5e7eb)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
            interval={0}
            angle={tiltLabels ? -35 : 0}
            textAnchor={tiltLabels ? "end" : "middle"}
            height={tiltLabels ? 56 : 32}
          />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} width={48} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid var(--color-border-light, #e1e4ed)",
              backgroundColor: "white",
              boxShadow: "var(--shadow-neumorphic-light)",
              padding: "10px 14px",
            }}
            labelStyle={{ fontWeight: "bold", color: "var(--color-text-primary)" }}
            formatter={(value: number, name: string) => {
              if (name === "earnings") return [formatMoney(value, currency), "Earnings"];
              return [value, "Orders"];
            }}
          />
          {goalValue !== undefined && goalValue > 0 ? (
            <ReferenceLine
              y={goalValue}
              stroke="var(--color-warning)"
              strokeDasharray="6 4"
              label={{
                value: "Monthly Goal",
                position: "insideTopRight",
                fill: "var(--color-text-secondary)",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          ) : null}
          <Bar dataKey="earnings" fill="url(#earnBarGrad)" radius={[8, 8, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
