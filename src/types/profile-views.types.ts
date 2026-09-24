export interface ProfileViewsPoint {
  date: string;
  label: string;
  views: number;
  previousViews: number;
}

export interface ProfileViewsSource {
  source: string;
  views: number;
  percentage: number;
}

export interface ProfileViewsSummary {
  current: number;
  previous: number;
}

export interface ProfileViewsAnalytics {
  week: ProfileViewsSummary;
  month: ProfileViewsSummary;
  allTime: ProfileViewsSummary;
  trendPercentage: number;
  comparisonLabel: string;
  points: ProfileViewsPoint[];
  sources: ProfileViewsSource[];
  insight: string;
  tip: string;
}
