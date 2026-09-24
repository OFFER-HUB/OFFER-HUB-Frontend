"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useModeStore } from "@/stores/mode-store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ErrorState } from "@/components/ui/ErrorState";
import { useEarningsAnalytics } from "@/hooks/useEarningsAnalytics";
import {
  EarningsBreakdown,
  EarningsChart,
  EarningsDateRangePicker,
  EarningsPageSkeleton,
  EarningsSummaryCards,
  EarningsZeroState,
} from "@/components/analytics";
import { parseMoney } from "@/lib/earnings-utils";

export default function EarningsAnalyticsPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const {
    hasHydrated,
    token,
    startDate,
    endDate,
    activePreset,
    data,
    isLoading,
    isRefreshing,
    error,
    applyPreset,
    onCustomStart,
    onCustomEnd,
    refresh,
    exportCsv,
  } = useEarningsAnalytics();

  useEffect(() => {
    setMode("freelancer");
  }, [setMode]);

  // Auth Store Hydration Wall
  if (!hasHydrated) {
    return <EarningsPageSkeleton />;
  }

  // Signed-out User Wall
  if (!token) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-[var(--shadow-neumorphic-light)] flex items-center justify-center text-text-secondary">
          <Icon path={ICON_PATHS.lock} size="xl" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Earnings Analytics</h1>
        <p className="text-text-secondary mb-6">
          Sign in to your freelancer account to view live income analytics, trends, and client breakdowns.
        </p>
        <Link href="/login?redirect=/app/analytics/earnings">
          <Button variant="primary" size="md">
            Sign In to Continue
          </Button>
        </Link>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return <EarningsPageSkeleton />;
  }

  // Error State with Retry option
  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <ErrorState
          variant="card"
          title="Earnings Analytics Unavailable"
          message={error || "Could not retrieve earnings data from the backend server."}
          onRetry={refresh}
          retryLabel="Retry Connection"
        />
      </div>
    );
  }

  const currentTotalEarnings = parseMoney(data.currentPeriod.totalEarnings);
  const isZeroEarnings = currentTotalEarnings === 0 && data.currentPeriod.orderCount === 0;
  const hasChartData = data.monthly && data.monthly.length > 0;
  const hasBreakdownData = (data.byClient && data.byClient.length > 0) || (data.byCategory && data.byCategory.length > 0);

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 transition-all duration-300 ease-in-out">
      {/* Header Banner & Live API Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-bold text-primary uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-primary/10">
              Freelancer Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Earnings Analytics
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time settled revenue and order analytics directly from your ledger balance.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
              "bg-white text-text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            title="Refresh analytics data"
          >
            <Icon
              path={ICON_PATHS.refresh}
              size="sm"
              className={cn("text-text-secondary", isRefreshing && "animate-spin")}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
              "bg-background text-text-primary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "hover:text-primary active:scale-95"
            )}
            title="Export CSV report"
          >
            <Icon path={ICON_PATHS.document} size="sm" className="text-primary" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <EarningsDateRangePicker
        startDate={startDate}
        endDate={endDate}
        activePreset={activePreset}
        onPresetChange={applyPreset}
        onStartChange={onCustomStart}
        onEndChange={onCustomEnd}
      />

      {/* Top Summary Metric Cards */}
      <EarningsSummaryCards data={data} />

      {/* Zero State if 0 Earnings / Orders */}
      {isZeroEarnings ? (
        <EarningsZeroState startDate={startDate} endDate={endDate} />
      ) : null}

      {/* Monthly Interactive Revenue Chart (Rendered when chart data exists) */}
      {hasChartData ? (
        <div className={cn("mb-6 transition-opacity duration-200", isRefreshing && "opacity-60 pointer-events-none")}>
          <EarningsChart data={data.monthly} currency={data.currency} monthlyGoal={data.monthlyGoal} />
        </div>
      ) : null}

      {/* Breakdown Lists: Top Clients & Service Categories (Rendered when breakdown data exists) */}
      {hasBreakdownData ? (
        <EarningsBreakdown
          byClient={data.byClient}
          byCategory={data.byCategory}
          currency={data.currency}
          className="mb-6"
        />
      ) : null}

      {/* Footer Disclaimer */}
      <p className="text-xs text-text-secondary text-center pt-2">
        All amounts in {data.currency}. Data updated in real-time from your backend database ledger.
      </p>
    </div>
  );
}
