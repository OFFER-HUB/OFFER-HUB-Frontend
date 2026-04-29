/**
 * Admin Analytics Types
 *
 * Types for platform-wide analytics and metrics.
 */

// ─── Platform Statistics ──────────────────────────────────────────────────────

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalOrders: number;
  transactionVolume: number;
  revenue: number;
  growthRates: {
    users: number; // percentage
    orders: number; // percentage
    revenue: number; // percentage
  };
}

// ─── Trends Data ─────────────────────────────────────────────────────────────

export interface TrendsDataPoint {
  date: string; // ISO date
  users: number;
  orders: number;
  revenue: number;
}

export interface TrendsChartData {
  period: '7d' | '30d' | '90d' | '1y';
  data: TrendsDataPoint[];
}

// ─── Category Breakdown ──────────────────────────────────────────────────────

export interface CategoryBreakdown {
  category: string;
  orders: number;
  revenue: number;
  percentage: number;
}

// ─── Geographic Distribution ─────────────────────────────────────────────────

export interface GeographicData {
  country: string;
  users: number;
  orders: number;
  revenue: number;
}

// ─── Date Range ──────────────────────────────────────────────────────────────

export interface DateRange {
  start: string; // ISO date
  end: string; // ISO date
}

// ─── Admin Analytics Response ────────────────────────────────────────────────

export interface AdminAnalyticsData {
  stats: PlatformStats;
  trends: TrendsChartData;
  categories: CategoryBreakdown[];
  geography: GeographicData[];
  lastUpdated: string; // ISO timestamp
}

// ─── Export Options ──────────────────────────────────────────────────────────

export type ExportFormat = 'csv' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  dateRange: DateRange;
  includeCharts: boolean;
}