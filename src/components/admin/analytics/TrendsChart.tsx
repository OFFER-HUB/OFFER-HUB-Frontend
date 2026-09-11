"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TrendsDataPoint } from "@/types/admin-analytics.types";

interface TrendsChartProps {
  data: TrendsDataPoint[];
  period: { from: string; to: string };
}

interface ChartDataPoint extends TrendsDataPoint {
  formattedDate: string;
}

// The backend period is UTC-bounded; render it in UTC too or the "from" day
// shows as the previous evening anywhere west of Greenwich.
function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

interface TooltipEntry {
  color: string;
  name: string;
  dataKey: string;
  value: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-text-primary">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {
              entry.dataKey === 'volume'
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(entry.value)
                : new Intl.NumberFormat('en-US').format(entry.value)
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendsChart({ data, period }: TrendsChartProps): React.JSX.Element {
  // Bucket labels are "YYYY-MM-DD"; pin them to UTC so they don't shift a day in western timezones.
  const chartData: ChartDataPoint[] = data.map((point) => ({
    ...point,
    formattedDate: new Date(`${point.label}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Trends Over Time</h3>
        <div className="text-sm text-text-secondary">
          {formatDay(period.from)} – {formatDay(period.to)}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="formattedDate"
              className="text-text-secondary"
              fontSize={12}
            />
            <YAxis
              className="text-text-secondary"
              fontSize={12}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="#3b82f6"
              strokeWidth={2}
              name="New users"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
              name="Orders"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Volume"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}