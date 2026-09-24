/**
 * Admin Analytics Types
 *
 * `PlatformAnalytics` mirrors the backend's `GET /admin/analytics` document
 * field for field; `AdminAnalyticsData` is the view model the dashboard
 * renders, built from it by `toAdminAnalyticsData()` in lib/api/admin-analytics.
 */

// ─── Backend payload (apps/api admin-analytics.service.ts PlatformAnalytics) ──

export type AnalyticsGranularity = "day" | "week" | "month";

export interface ComparisonStat {
  current: number;
  previous: number;
  changePercent: number;
}

export interface ComparisonVolume {
  /** Decimal string, e.g. "155.00" */
  current: string;
  previous: string;
  changePercent: number;
}

export interface TimeSeriesPoint {
  /** Bucket start, "YYYY-MM-DD" */
  label: string;
  orders: number;
  newUsers: number;
  /** Decimal string of released/closed order volume in the bucket */
  volume: string;
}

export interface PlatformAnalytics {
  period: { from: string; to: string }; // ISO 8601
  users: {
    total: number;
    active: number;
    newThisPeriod: number;
    growthRate: number;
  };
  orders: {
    total: number;
    completed: number;
    inProgress: number;
    canceled: number;
    totalVolume: string;
    averageValue: string;
  };
  disputes: {
    total: number;
    open: number;
    resolved: number;
    /** Percentage of orders that were disputed */
    rate: number;
  };
  withdrawals: {
    total: number;
    totalVolume: string;
  };
  services: {
    total: number;
    byCategory: Record<string, number>;
  };
  comparison: {
    users: ComparisonStat;
    orders: ComparisonStat;
    volume: ComparisonVolume;
  };
  timeSeries: TimeSeriesPoint[];
}

// ─── View model ───────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  /** New users this period vs the previous period of equal length */
  newUsersChangePercent: number;
  totalOrders: number;
  completedOrders: number;
  ordersChangePercent: number;
  transactionVolume: number;
  volumeChangePercent: number;
  averageOrderValue: number;
  openDisputes: number;
  disputeRate: number;
  withdrawalsVolume: number;
}

export interface TrendsDataPoint {
  label: string;
  newUsers: number;
  orders: number;
  volume: number;
}

export interface CategoryBreakdown {
  category: string;
  services: number;
  /** Share of all active services, 0–100 */
  percentage: number;
}

export interface AdminAnalyticsData {
  period: { from: string; to: string };
  stats: PlatformStats;
  trends: TrendsDataPoint[];
  categories: CategoryBreakdown[];
}

// ─── Date Range (UI) ──────────────────────────────────────────────────────────

export interface DateRange {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
}
