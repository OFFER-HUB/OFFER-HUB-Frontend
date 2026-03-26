"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { getEmptyProfileViewsAnalytics } from "@/data/profile-views.data";
import { cn } from "@/lib/cn";
import { getProfileViewsAnalytics } from "@/lib/api/analytics";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import type { ProfileViewsAnalytics, ProfileViewsSummary } from "@/types/profile-views.types";
import { ViewsChart } from "@/components/analytics/ViewsChart";

interface ProfileViewsCardProps {
  token: string | null;
}

function getChangePercentage(summary: ProfileViewsSummary): number {
  if (summary.previous === 0) {
    return summary.current > 0 ? 100 : 0;
  }

  return Math.round(((summary.current - summary.previous) / summary.previous) * 100);
}

function getChangeTone(change: number): {
  label: string;
  icon: string;
  className: string;
} {
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

function ProfileViewsSkeleton(): React.JSX.Element {
  return (
    <div className={cn(NEUMORPHIC_CARD, "animate-pulse space-y-6")}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-44 rounded bg-gray-200" />
          <div className="h-4 w-60 rounded bg-gray-200" />
        </div>
        <div className="h-12 w-32 rounded-2xl bg-gray-200" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-gray-200 p-5 h-28" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="h-72 rounded-2xl bg-gray-200" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileViewsCard({ token }: ProfileViewsCardProps): React.JSX.Element {
  const [analytics, setAnalytics] = useState<ProfileViewsAnalytics>(
    getEmptyProfileViewsAnalytics()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics(): Promise<void> {
      if (!token) {
        if (isMounted) {
          setAnalytics(getEmptyProfileViewsAnalytics());
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getProfileViewsAnalytics(token);
        if (isMounted) {
          setAnalytics(data);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const summaryCards = useMemo(
    () => [
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
    ],
    [analytics]
  );

  if (isLoading) {
    return <ProfileViewsSkeleton />;
  }

  if (analytics.points.length === 0) {
    return (
      <div className={NEUMORPHIC_CARD}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary">Profile views</h2>
          <p className="mt-1 text-sm text-text-secondary">
            See how often clients are discovering your profile over time.
          </p>
        </div>
        <EmptyState
          variant="card"
          icon={ICON_PATHS.users}
          title="No profile views yet"
          message="Once clients start discovering your profile, trends and source breakdowns will show up here."
        />
      </div>
    );
  }

  const overallTrend = getChangeTone(analytics.trendPercentage);

  return (
    <section className={cn(NEUMORPHIC_CARD, "space-y-6 stagger-4 animate-fade-in-up")}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon path={ICON_PATHS.users} size="md" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Profile views</h2>
              <p className="text-sm text-text-secondary">
                Track visibility, compare performance, and spot what is driving discovery.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-primary/8 px-4 py-3">
          <div
            className={cn("flex items-center gap-2 text-sm font-semibold", overallTrend.className)}
          >
            <Icon path={overallTrend.icon} size="sm" />
            <span>{overallTrend.label}</span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">{analytics.comparisonLabel}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => {
          const changeTone = getChangeTone(
            getChangePercentage({ current: card.value, previous: card.previous })
          );

          return (
            <div key={card.label} className={cn("rounded-2xl p-5", NEUMORPHIC_INSET)}>
              <p className="text-sm text-text-secondary">{card.label}</p>
              <p className="mt-3 text-3xl font-bold text-text-primary">
                {card.value.toLocaleString()}
              </p>
              <div
                className={cn(
                  "mt-3 flex items-center gap-2 text-sm font-medium",
                  changeTone.className
                )}
              >
                <Icon path={changeTone.icon} size="sm" />
                <span>{changeTone.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="rounded-3xl border border-white/40 bg-white/70 p-4 shadow-[inset_1px_1px_0_rgba(255,255,255,0.45)]">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Last 30 days</h3>
              <p className="text-sm text-text-secondary">
                Bars show current views and the line shows the previous period.
              </p>
            </div>
          </div>
          <ViewsChart data={analytics.points} />
        </div>

        <div className="space-y-4">
          <div className={cn("rounded-2xl p-5", NEUMORPHIC_INSET)}>
            <h3 className="font-semibold text-text-primary">Where views come from</h3>
            <div className="mt-4 space-y-3">
              {analytics.sources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">{source.source}</span>
                    <span className="text-text-secondary">
                      {source.views.toLocaleString()} views
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(source.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {source.percentage}% of total traffic
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("rounded-2xl p-5", NEUMORPHIC_INSET)}>
            <h3 className="font-semibold text-text-primary">Insight</h3>
            <p className="mt-3 text-sm text-text-secondary">{analytics.insight}</p>
            <div className="mt-4 rounded-2xl bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">Tip</p>
              <p className="mt-2 text-sm text-text-primary">{analytics.tip}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
