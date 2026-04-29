"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getAdminAnalytics } from "@/lib/api/admin-analytics";
import type { AdminAnalyticsData, DateRange } from "@/types/admin-analytics.types";
import { PlatformStats } from "@/components/admin/analytics/PlatformStats";
import { TrendsChart } from "@/components/admin/analytics/TrendsChart";
import { AnalyticsFilters } from "@/components/admin/analytics/AnalyticsFilters";
import { CategoryBreakdown } from "@/components/admin/analytics/CategoryBreakdown";
import { GeographicDistribution } from "@/components/admin/analytics/GeographicDistribution";
import { ExportControls } from "@/components/admin/analytics/ExportControls";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AdminAnalyticsPage(): React.JSX.Element {
  const { user, token } = useAuthStore();
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const isUnauthorized = !user || user.type !== "ADMIN";

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getAdminAnalytics(token, dateRange);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (!token || isUnauthorized) return;
    fetchAnalytics();
  }, [token, isUnauthorized, fetchAnalytics]);

  if (isUnauthorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorState
          title="Access Denied"
          message="You don't have permission to access this page."
        />
      </div>
    );
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Analytics Dashboard</h1>
        </div>
        <LoadingState message="Loading analytics data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Analytics Dashboard</h1>
        </div>
        <ErrorState
          title="Failed to Load Analytics"
          message={error}
          onRetry={fetchAnalytics}
        />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Analytics Dashboard</h1>
        </div>
        <ErrorState
          title="No Data Available"
          message="Unable to load analytics data."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Platform-wide metrics and insights for business monitoring
          </p>
        </div>
        <ExportControls data={analyticsData} dateRange={dateRange} />
      </div>

      {/* Filters */}
      <AnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchAnalytics}
      />

      {/* Platform Stats */}
      <PlatformStats stats={analyticsData.stats} />

      {/* Trends Chart */}
      <Card className="p-6">
        <TrendsChart data={analyticsData.trends} />
      </Card>

      {/* Category Breakdown and Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown data={analyticsData.categories} />
        <GeographicDistribution data={analyticsData.geography} />
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-text-secondary">
        Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}