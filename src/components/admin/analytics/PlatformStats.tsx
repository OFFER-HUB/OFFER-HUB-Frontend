"use client";

import { Card } from "@/components/ui/Card";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { PlatformStats as PlatformStatsType } from "@/types/admin-analytics.types";

interface PlatformStatsProps {
  stats: PlatformStatsType;
}

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: keyof typeof ICON_PATHS;
  format?: "number" | "currency" | "percent";
}

function formatValue(value: number, format: StatCardProps["format"]): string {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (format === "percent") {
    return `${value.toFixed(1)}%`;
  }
  return new Intl.NumberFormat("en-US").format(value);
}

function StatCard({ title, value, change, icon, format = "number" }: StatCardProps): React.JSX.Element {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{formatValue(value, format)}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <Icon
                path={change >= 0 ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown}
                className={`w-4 h-4 mr-1 ${change >= 0 ? "text-success" : "text-error"}`}
              />
              <span className={`text-sm font-medium ${change >= 0 ? "text-success" : "text-error"}`}>
                {change >= 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              <span className="text-sm text-text-secondary ml-1">vs previous period</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon path={ICON_PATHS[icon]} className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}

export function PlatformStats({ stats }: PlatformStatsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard title="Total Users" value={stats.totalUsers} icon="users" />
      <StatCard title="New Users" value={stats.newUsers} change={stats.newUsersChangePercent} icon="user" />
      <StatCard title="Active Users" value={stats.activeUsers} icon="user" />
      <StatCard title="Total Orders" value={stats.totalOrders} change={stats.ordersChangePercent} icon="shoppingCart" />
      <StatCard title="Completed Orders" value={stats.completedOrders} icon="checkCircle" />
      <StatCard
        title="Transaction Volume"
        value={stats.transactionVolume}
        change={stats.volumeChangePercent}
        format="currency"
        icon="currency"
      />
      <StatCard title="Avg. Order Value" value={stats.averageOrderValue} format="currency" icon="chartBar" />
      <StatCard title="Open Disputes" value={stats.openDisputes} icon="flag" />
    </div>
  );
}
