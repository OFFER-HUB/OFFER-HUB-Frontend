export interface EarningsMonthlyPoint {
  /** Short label for charts, e.g. "Mar 2025" */
  label: string;
  /** ISO month start YYYY-MM-DD */
  monthStart: string;
  earnings: number;
  orderCount: number;
}

export interface EarningsClientRow {
  clientId: string;
  clientName: string;
  earnings: number;
  orderCount: number;
}

export interface EarningsCategoryRow {
  categoryId: string;
  categoryLabel: string;
  earnings: number;
  orderCount: number;
}

export interface EarningsPeriodMetrics {
  start: string;
  end: string;
  totalEarnings: string;
  orderCount: number;
  averageOrderValue: string;
}

export interface FreelancerEarningsAnalytics {
  currency: string;
  totals: {
    thisMonth: string;
    thisYear: string;
    allTime: string;
  };
  /** Selected range */
  currentPeriod: EarningsPeriodMetrics;
  /** Same length immediately before currentPeriod.start */
  previousPeriod: EarningsPeriodMetrics;
  /** Monthly buckets within the selected range (max 12 points) */
  monthly: EarningsMonthlyPoint[];
  byClient: EarningsClientRow[];
  byCategory: EarningsCategoryRow[];
  /** Optional monthly revenue goal (same currency) for progress / chart reference */
  monthlyGoal?: string;
}

export type PresetId = "custom" | "30d" | "90d" | "12m" | "ytd" | "all";

export interface EarningsAnalyticsParams {
  startDate: string;
  endDate: string;
}
