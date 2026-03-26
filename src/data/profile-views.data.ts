import type {
  ProfileViewsAnalytics,
  ProfileViewsPoint,
  ProfileViewsSource,
} from "@/types/profile-views.types";

const CURRENT_PERIOD_VIEWS = [
  18, 20, 22, 19, 24, 27, 25, 29, 31, 30, 34, 36, 33, 37, 40, 39, 42, 45, 44, 48, 50, 52, 49, 55,
  58, 56, 60, 63, 61, 66,
];

const PREVIOUS_PERIOD_VIEWS = [
  12, 14, 13, 15, 16, 18, 17, 19, 21, 20, 22, 24, 23, 25, 26, 27, 29, 28, 30, 31, 33, 34, 32, 35,
  37, 36, 38, 39, 40, 42,
];

function getChartPoints(): ProfileViewsPoint[] {
  const endDate = new Date("2026-03-26T12:00:00.000Z");

  return CURRENT_PERIOD_VIEWS.map((views, index) => {
    const pointDate = new Date(endDate);
    pointDate.setUTCDate(endDate.getUTCDate() - (CURRENT_PERIOD_VIEWS.length - 1 - index));

    return {
      date: pointDate.toISOString(),
      label: pointDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      views,
      previousViews: PREVIOUS_PERIOD_VIEWS[index],
    };
  });
}

function getSources(totalViews: number): ProfileViewsSource[] {
  const sources = [
    { source: "Search", ratio: 0.48 },
    { source: "Direct", ratio: 0.24 },
    { source: "Referrals", ratio: 0.17 },
    { source: "Social", ratio: 0.11 },
  ];

  return sources.map((source) => {
    const views = Math.round(totalViews * source.ratio);

    return {
      source: source.source,
      views,
      percentage: Math.round((views / totalViews) * 100),
    };
  });
}

export function getMockProfileViewsAnalytics(): ProfileViewsAnalytics {
  const points = getChartPoints();
  const currentMonth = CURRENT_PERIOD_VIEWS.reduce((total, value) => total + value, 0);
  const previousMonth = PREVIOUS_PERIOD_VIEWS.reduce((total, value) => total + value, 0);
  const currentWeek = CURRENT_PERIOD_VIEWS.slice(-7).reduce((total, value) => total + value, 0);
  const previousWeek = PREVIOUS_PERIOD_VIEWS.slice(-7).reduce((total, value) => total + value, 0);
  const allTimeCurrent = 4820;
  const allTimePrevious = 4310;

  return {
    week: {
      current: currentWeek,
      previous: previousWeek,
    },
    month: {
      current: currentMonth,
      previous: previousMonth,
    },
    allTime: {
      current: allTimeCurrent,
      previous: allTimePrevious,
    },
    trendPercentage: Math.round(((currentMonth - previousMonth) / previousMonth) * 100),
    comparisonLabel: "vs previous 30 days",
    points,
    sources: getSources(currentMonth),
    insight: "Profile views climbed after your most recent service update and portfolio refresh.",
    tip: "Freelancers who keep services fresh tend to convert more search impressions into profile visits.",
  };
}

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
