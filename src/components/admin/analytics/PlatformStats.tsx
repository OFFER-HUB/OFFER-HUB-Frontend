"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, ICON_CONTAINER } from "@/lib/styles";
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
  color: string;
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

function StatCard({
  title,
  value,
  change,
  icon,
  color,
  format = "number",
}: StatCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        NEUMORPHIC_CARD,
        "group transition-all duration-300 hover:-translate-y-1",
        "hover:shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff] dark:hover:shadow-[10px_10px_20px_#0a0f1a,-10px_-10px_20px_#1e2a4a]"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1 truncate">
            {formatValue(value, format)}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold",
                  "shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] dark:shadow-[inset_1px_1px_2px_#0a0f1a,inset_-1px_-1px_2px_#1e2a4a]",
                  change >= 0 ? "text-success" : "text-error"
                )}
              >
                <Icon
                  path={change >= 0 ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown}
                  size="sm"
                  className={change >= 0 ? "text-success" : "text-error"}
                />
                <span>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </span>
              <span className="text-[11px] text-text-secondary truncate">vs previous</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            ICON_CONTAINER,
            color,
            "flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-md"
          )}
        >
          <Icon path={ICON_PATHS[icon]} className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function PlatformStats({ stats }: PlatformStatsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon="users"
        color="bg-primary/90 shadow-primary/20"
      />
      <StatCard
        title="New Users"
        value={stats.newUsers}
        change={stats.newUsersChangePercent}
        icon="user"
        color="bg-secondary/90 shadow-secondary/20"
      />
      <StatCard
        title="Active Users"
        value={stats.activeUsers}
        icon="user"
        color="bg-emerald-600/90 shadow-emerald-500/20"
      />
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        change={stats.ordersChangePercent}
        icon="shoppingCart"
        color="bg-primary/90 shadow-primary/20"
      />
      <StatCard
        title="Completed Orders"
        value={stats.completedOrders}
        icon="checkCircle"
        color="bg-teal-600/90 shadow-teal-500/20"
      />
      <StatCard
        title="Transaction Volume"
        value={stats.transactionVolume}
        change={stats.volumeChangePercent}
        format="currency"
        icon="currency"
        color="bg-emerald-700/90 shadow-emerald-600/20"
      />
      <StatCard
        title="Avg. Order Value"
        value={stats.averageOrderValue}
        format="currency"
        icon="chartBar"
        color="bg-indigo-600/90 shadow-indigo-500/20"
      />
      <StatCard
        title="Open Disputes"
        value={stats.openDisputes}
        icon="flag"
        color="bg-amber-600/90 shadow-amber-500/20"
      />
    </div>
  );
}

