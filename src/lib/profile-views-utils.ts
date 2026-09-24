import { ICON_PATHS } from "@/components/ui/Icon";
import type { ProfileViewsAnalytics, ProfileViewsSummary } from "@/types/profile-views.types";

export interface ChangeTone {
  label: string;
  icon: string;
  className: string;
}

export interface ProfileViewsSummaryCard {
  label: string;
  value: number;
  previous: number;
}

/** The 7-day, 30-day and all-time totals, in display order. */
export function getProfileViewsSummaryCards(
  analytics: ProfileViewsAnalytics
): ProfileViewsSummaryCard[] {
  return [
    {
      label: "Last 7 days",
      value: analytics.week.current,
      previous: analytics.week.previous,
    },
    {
      label: "Last 30 days",
      value: analytics.month.current,
      previous: analytics.month.previous,
    },
    {
      label: "All time",
      value: analytics.allTime.current,
      previous: analytics.allTime.previous,
    },
  ];
}

/**
 * Rounded percentage change from the previous period. A previous value of zero
 * reads as +100% when there are views now and 0% when there are none.
 */
export function getChangePercentage(summary: ProfileViewsSummary): number {
  if (summary.previous === 0) {
    return summary.current > 0 ? 100 : 0;
  }

  return Math.round(((summary.current - summary.previous) / summary.previous) * 100);
}

/** Label, icon and text colour for a percentage change. */
export function getChangeTone(change: number): ChangeTone {
  if (change > 0) {
    return {
      label: `Up ${change}%`,
      icon: ICON_PATHS.arrowUp,
      className: "text-success",
    };
  }

  if (change < 0) {
    return {
      label: `Down ${Math.abs(change)}%`,
      icon: ICON_PATHS.arrowDown,
      className: "text-warning",
    };
  }

  return {
    label: "No change",
    icon: ICON_PATHS.infoCircle,
    className: "text-text-secondary",
  };
}
