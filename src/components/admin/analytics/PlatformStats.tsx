"use client";

import { Card } from "@/components/ui/Card";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { PlatformStats as PlatformStatsType } from "@/types/admin-analytics.types";

interface PlatformStatsProps {
  stats: PlatformStatsType;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: keyof typeof ICON_PATHS;
  format?: 'number' | 'currency';
}

function StatCard({ title, value, change, icon, format = 'number' }: StatCardProps): React.JSX.Element {
  const formatValue = (val: string | number): string => {
    if (format === 'currency' && typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US').format(val);
    }
    return val.toString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <Icon
                path={change >= 0 ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown}
                className={`w-4 h-4 mr-1 ${
                  change >= 0 ? "text-success" : "text-error"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? "text-success" : "text-error"
                }`}
              >
                {change >= 0 ? "+" : ""}{change.toFixed(1)}%
              </span>
              <span className="text-sm text-text-secondary ml-1">vs last period</span>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        change={stats.growthRates.users}
        icon="users"
      />
      <StatCard
        title="Active Users"
        value={stats.activeUsers}
        icon="user"
      />
      <StatCard
        title="New Users"
        value={stats.newUsers}
        icon="user"
      />
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        change={stats.growthRates.orders}
        icon="shoppingCart"
      />
      <StatCard
        title="Transaction Volume"
        value={stats.transactionVolume}
        format="currency"
        icon="currency"
      />
      <StatCard
        title="Revenue"
        value={stats.revenue}
        change={stats.growthRates.revenue}
        format="currency"
        icon="chartBar"
      />
    </div>
  );
}