import { API_URL } from "@/config/api";
import { MOCK_ADMIN_ANALYTICS, simulateAnalyticsDelay } from "@/data/admin-analytics.data";
import type { ApiResponse } from "@/types/api-response.types";
import type {
  AdminAnalyticsData,
  DateRange,
  ExportFormat,
  TrendsChartData,
} from "@/types/admin-analytics.types";

const API_BASE_URL = API_URL;

/**
 * Set to false when real admin analytics API endpoints are available on the backend.
 * When true, all functions resolve against the local mock dataset.
 */
const USE_MOCK = true;

/**
 * Fetch platform-wide analytics data for the admin dashboard.
 *
 * Falls back to mock data when the endpoint is unavailable so the dashboard
 * remains reviewable during frontend development.
 */
export async function getAdminAnalytics(
  token: string,
  dateRange?: DateRange
): Promise<AdminAnalyticsData> {
  if (USE_MOCK) {
    await simulateAnalyticsDelay();
    return MOCK_ADMIN_ANALYTICS;
  }

  const params = dateRange
    ? `?start=${dateRange.start}&end=${dateRange.end}`
    : '';

  const response = await fetch(`${API_BASE_URL}/admin/analytics${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admin analytics");
  }

  const result = (await response.json()) as ApiResponse<AdminAnalyticsData>;

  if (!result.data) {
    throw new Error("Admin analytics response was empty");
  }

  return result.data;
}

/**
 * Fetch trends data for a specific time period.
 */
export async function getAnalyticsTrends(
  token: string,
  period: TrendsChartData['period'],
  dateRange?: DateRange
): Promise<TrendsChartData> {
  if (USE_MOCK) {
    await simulateAnalyticsDelay(400);
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    return {
      period,
      data: MOCK_ADMIN_ANALYTICS.trends.data.slice(-days),
    };
  }

  const params = new URLSearchParams({ period });
  if (dateRange) {
    params.append('start', dateRange.start);
    params.append('end', dateRange.end);
  }

  const response = await fetch(`${API_BASE_URL}/admin/analytics/trends?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analytics trends");
  }

  const result = (await response.json()) as ApiResponse<TrendsChartData>;

  if (!result.data) {
    throw new Error("Analytics trends response was empty");
  }

  return result.data;
}

/**
 * Export analytics data in the specified format.
 */
export async function exportAnalyticsData(
  token: string,
  format: ExportFormat,
  dateRange?: DateRange,
  includeCharts: boolean = false
): Promise<Blob> {
  if (USE_MOCK) {
    await simulateAnalyticsDelay(2000); // Simulate longer delay for export
    // Return a mock blob
    return new Blob(['Mock exported data'], { type: 'text/plain' });
  }

  const params = new URLSearchParams({
    format,
    includeCharts: includeCharts.toString(),
  });

  if (dateRange) {
    params.append('start', dateRange.start);
    params.append('end', dateRange.end);
  }

  const response = await fetch(`${API_BASE_URL}/admin/analytics/export?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export analytics data");
  }

  return response.blob();
}