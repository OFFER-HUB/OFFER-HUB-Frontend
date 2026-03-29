export interface FreelancerStatCard {
  label: string;
  value: string | number;
  iconPath: string;
  color: string;
}

export interface DashboardStats {
  activeApplications: number;
  activeOrders: number;
  totalEarnings: string;
  rating: number | null;
  ratingCount: number;
  // Trend vs previous period (percentage). null = not available
  activeApplicationsTrend: number | null;
  activeOrdersTrend: number | null;
  earningsTrend: number | null;
  ratingTrend: number | null;
}
