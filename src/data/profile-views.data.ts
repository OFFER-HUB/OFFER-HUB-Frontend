import type { ProfileViewsAnalytics } from "@/types/profile-views.types";

export function getEmptyProfileViewsAnalytics(): ProfileViewsAnalytics {
  return {
    week: { current: 0, previous: 0 },
    month: { current: 0, previous: 0 },
    allTime: { current: 0, previous: 0 },
    trendPercentage: 0,
    comparisonLabel: "vs previous 30 days",
    points: [],
    sources: [],
    insight: "No profile traffic yet.",
    tip: "Complete your profile and publish services to start collecting view insights.",
  };
}
