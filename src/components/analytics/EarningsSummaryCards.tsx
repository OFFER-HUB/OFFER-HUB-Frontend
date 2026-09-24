"use client";

import { Card } from "@/components/ui/Card";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { parseMoney, pctChange, formatPct } from "@/lib/earnings-utils";
import type { FreelancerEarningsAnalytics } from "@/types/earnings.types";
import { cn } from "@/lib/cn";

interface EarningsSummaryCardsProps {
  data: FreelancerEarningsAnalytics;
}

export function EarningsSummaryCards({ data }: EarningsSummaryCardsProps): React.JSX.Element {
  const curTotal = parseMoney(data.currentPeriod.totalEarnings);
  const prevTotal = parseMoney(data.previousPeriod.totalEarnings);
  const totalDelta = pctChange(curTotal, prevTotal);

  const curAov = parseMoney(data.currentPeriod.averageOrderValue);
  const prevAov = parseMoney(data.previousPeriod.averageOrderValue);
  const aovDelta = pctChange(curAov, prevAov);

  const goal = data.monthlyGoal ? parseMoney(data.monthlyGoal) : 0;
  const thisMonthNum = parseMoney(data.totals.thisMonth);
  const goalPct = goal > 0 ? Math.min(100, Math.round((thisMonthNum / goal) * 100)) : null;

  const fmt = (amount: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency,
    }).format(parseMoney(amount));

  const hasPriorPeriodComparison = totalDelta !== null && prevTotal > 0;

  return (
    <div className="space-y-6 mb-6">
      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: This Month */}
        <Card variant="neumorphic" padding="md" className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-secondary">This Month</span>
            <div className="w-10 h-10 rounded-xl bg-background shadow-[var(--shadow-neumorphic-inset-light)] flex items-center justify-center text-primary">
              <Icon path={ICON_PATHS.calendar} size="sm" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums tracking-tight">
            {fmt(data.totals.thisMonth)}
          </p>
          <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
            <span>Settled in current month</span>
          </p>
        </Card>

        {/* Card 2: This Year */}
        <Card variant="neumorphic" padding="md" className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-secondary">This Year</span>
            <div className="w-10 h-10 rounded-xl bg-background shadow-[var(--shadow-neumorphic-inset-light)] flex items-center justify-center text-primary">
              <Icon path={ICON_PATHS.trendingUp} size="sm" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums tracking-tight">
            {fmt(data.totals.thisYear)}
          </p>
          <p className="text-xs text-text-secondary mt-2">Year-to-date total</p>
        </Card>

        {/* Card 3: All Time */}
        <Card variant="neumorphic" padding="md" className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-secondary">All Time</span>
            <div className="w-10 h-10 rounded-xl bg-background shadow-[var(--shadow-neumorphic-inset-light)] flex items-center justify-center text-primary">
              <Icon path={ICON_PATHS.star} size="sm" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums tracking-tight">
            {fmt(data.totals.allTime)}
          </p>
          <p className="text-xs text-text-secondary mt-2">Lifetime earnings</p>
        </Card>

        {/* Card 4: Avg Order Value */}
        <Card variant="neumorphic" padding="md" className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-secondary">Avg. Order Value</span>
            <div className="w-10 h-10 rounded-xl bg-background shadow-[var(--shadow-neumorphic-inset-light)] flex items-center justify-center text-primary">
              <Icon path={ICON_PATHS.creditCard} size="sm" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums tracking-tight">
            {fmt(data.currentPeriod.averageOrderValue)}
          </p>
          <p className="text-xs text-text-secondary mt-2">Selected date range</p>
        </Card>
      </div>

      {/* Selected Range Hero Card */}
      <Card variant="neumorphic" padding="md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-primary bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] mb-3">
              <Icon path={ICON_PATHS.filter} size="sm" /> Active Date Range
            </span>
            <p className="text-sm font-medium text-text-secondary">Selected Range Revenue</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-primary tabular-nums mt-1 tracking-tight">
              {fmt(data.currentPeriod.totalEarnings)}
            </p>
            <p className="text-sm text-text-secondary mt-2 flex items-center gap-2">
              <span className="font-semibold text-text-primary">
                {data.currentPeriod.orderCount}{" "}
                {data.currentPeriod.orderCount === 1 ? "order completed" : "orders completed"}
              </span>
              <span>·</span>
              <span>
                {data.currentPeriod.start} to {data.currentPeriod.end}
              </span>
            </p>
          </div>

          <Card variant="neumorphic-inset" padding="sm" className="min-w-[240px] space-y-2">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              vs Previous Period
            </p>
            {hasPriorPeriodComparison ? (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xl font-bold tabular-nums",
                      totalDelta >= 0 ? "text-success" : "text-error"
                    )}
                  >
                    {formatPct(totalDelta)}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">Revenue change</span>
                </div>

                {aovDelta !== null ? (
                  <p className={cn("text-xs font-semibold", aovDelta >= 0 ? "text-success" : "text-error")}>
                    AOV {formatPct(aovDelta)}
                  </p>
                ) : null}

                <p className="text-[11px] text-text-secondary pt-1 border-t border-border-light/40">
                  Prior period ({data.previousPeriod.start} – {data.previousPeriod.end}):{" "}
                  <span className="font-medium text-text-primary">{fmt(data.previousPeriod.totalEarnings)}</span>
                </p>
              </>
            ) : (
              <p className="text-xs text-text-secondary mt-1">No prior period data to compare</p>
            )}
          </Card>
        </div>
      </Card>

      {/* Monthly Goal Progress Banner */}
      {goal > 0 ? (
        <Card variant="neumorphic" padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Icon path={ICON_PATHS.checkCircle} size="sm" className="text-primary" />
                <p className="text-sm font-bold text-text-primary">Monthly Revenue Goal</p>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Target: <span className="font-semibold text-text-primary">{fmt(data.monthlyGoal!)}</span> · Progress:{" "}
                <span className="font-semibold text-text-primary">{fmt(data.totals.thisMonth)}</span>
              </p>
            </div>

            {goalPct !== null ? (
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-xs font-semibold text-text-secondary mb-1.5">
                  <span>Goal Completion</span>
                  <span className="text-primary font-bold">{goalPct}%</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-background shadow-[var(--shadow-neumorphic-inset-light)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
