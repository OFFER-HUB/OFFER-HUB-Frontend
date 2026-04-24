import type {
  AdminAnalyticsData,
  PlatformStats,
  TrendsDataPoint,
  CategoryBreakdown,
  GeographicData,
} from "@/types/admin-analytics.types";

/**
 * Mock Admin Analytics Data
 *
 * Provides realistic sample data for the admin analytics dashboard.
 * Used during development when the backend API is not available.
 */

// Generate mock trends data for the last 30 days
function generateMockTrendsData(days: number = 30): TrendsDataPoint[] {
  const data: TrendsDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate realistic growth with some randomness
    const baseUsers = 1200 + (days - i) * 5;
    const baseOrders = 85 + (days - i) * 2;
    const baseRevenue = 2500 + (days - i) * 50;

    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.round(baseUsers * randomFactor),
      orders: Math.round(baseOrders * randomFactor),
      revenue: Math.round(baseRevenue * randomFactor),
    });
  }

  return data;
}

// Mock platform statistics
export const MOCK_PLATFORM_STATS: PlatformStats = {
  totalUsers: 15420,
  activeUsers: 8920,
  newUsers: 245,
  totalOrders: 12850,
  transactionVolume: 892000,
  revenue: 267600,
  growthRates: {
    users: 12.5,
    orders: 8.3,
    revenue: 15.7,
  },
};

// Mock category breakdown
export const MOCK_CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { category: "Web Development", orders: 3240, revenue: 81000, percentage: 25.2 },
  { category: "Mobile Development", orders: 2890, revenue: 72300, percentage: 22.5 },
  { category: "Design", orders: 2560, revenue: 51200, percentage: 19.9 },
  { category: "Writing", orders: 1980, revenue: 29700, percentage: 15.4 },
  { category: "Marketing", orders: 1650, revenue: 24750, percentage: 12.8 },
  { category: "Consulting", orders: 530, revenue: 10650, percentage: 4.2 },
];

// Mock geographic distribution
export const MOCK_GEOGRAPHIC_DATA: GeographicData[] = [
  { country: "United States", users: 4520, orders: 3890, revenue: 116700 },
  { country: "United Kingdom", users: 2180, orders: 1850, revenue: 55500 },
  { country: "Germany", users: 1890, orders: 1620, revenue: 48600 },
  { country: "Canada", users: 1450, orders: 1240, revenue: 37200 },
  { country: "Australia", users: 1230, orders: 1050, revenue: 31500 },
  { country: "France", users: 980, orders: 840, revenue: 25200 },
  { country: "Netherlands", users: 760, orders: 650, revenue: 19500 },
  { country: "Other", users: 3410, orders: 2710, revenue: 81300 },
];

// Mock complete analytics data
export const MOCK_ADMIN_ANALYTICS: AdminAnalyticsData = {
  stats: MOCK_PLATFORM_STATS,
  trends: {
    period: '30d',
    data: generateMockTrendsData(30),
  },
  categories: MOCK_CATEGORY_BREAKDOWN,
  geography: MOCK_GEOGRAPHIC_DATA,
  lastUpdated: new Date().toISOString(),
};

/**
 * Simulate API delay for mock data
 */
export function simulateAnalyticsDelay(ms: number = 800): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}