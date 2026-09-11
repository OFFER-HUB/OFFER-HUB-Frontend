"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { PlatformStats } from "@/components/admin/analytics/PlatformStats";
import { TrendsChart } from "@/components/admin/analytics/TrendsChart";
import { AnalyticsFilters } from "@/components/admin/analytics/AnalyticsFilters";
import { CategoryBreakdown } from "@/components/admin/analytics/CategoryBreakdown";
import { ExportControls } from "@/components/admin/analytics/ExportControls";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

function PageHeader({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics Dashboard</h1>
        <p className="text-text-secondary mt-1">Platform-wide metrics and insights for business monitoring</p>
      </div>
      {children}
    </div>
  );
}

export default function AdminAnalyticsPage(): React.JSX.Element {
  const isAuthorized = useAdminGuard();
  const analytics = useAdminAnalytics(isAuthorized);

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <ExportControls dateRange={analytics.dateRange} />
      </PageHeader>

      <AnalyticsFilters
        dateRange={analytics.dateRange}
        onDateRangeChange={analytics.setDateRange}
        onRefresh={analytics.refetch}
      />

      {analytics.isLoading ? (
        <LoadingState message="Loading analytics data..." />
      ) : analytics.error ? (
        <ErrorState title="Failed to Load Analytics" message={analytics.error} onRetry={analytics.refetch} />
      ) : !analytics.data ? (
        <ErrorState title="No Data Available" message="Unable to load analytics data." />
      ) : (
        <>
          <PlatformStats stats={analytics.data.stats} />

          <Card className="p-6">
            <TrendsChart data={analytics.data.trends} period={analytics.data.period} />
          </Card>

          <CategoryBreakdown data={analytics.data.categories} />
        </>
      )}
    </div>
  );
}
