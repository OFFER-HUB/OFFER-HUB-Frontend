"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProfileViewsPoint } from "@/types/profile-views.types";

interface ViewsChartProps {
  data: ProfileViewsPoint[];
}

export function ViewsChart({ data }: ViewsChartProps): React.JSX.Element {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light, #e5e7eb)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
            minTickGap={20}
          />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} width={42} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "none",
              boxShadow: "4px 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} views`,
              name === "views" ? "Current period" : "Previous period",
            ]}
            labelFormatter={(label: string) => `Day: ${label}`}
          />
          <Bar dataKey="views" fill="var(--color-primary)" radius={[8, 8, 0, 0]} maxBarSize={20} />
          <Line
            type="monotone"
            dataKey="previousViews"
            stroke="var(--color-secondary)"
            strokeWidth={2.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
