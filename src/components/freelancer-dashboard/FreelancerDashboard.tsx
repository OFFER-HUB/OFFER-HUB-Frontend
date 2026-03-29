"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProfileViewsCard } from "@/components/analytics/ProfileViewsCard";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_BUTTON, NEUMORPHIC_INSET, ICON_CONTAINER } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { WalletAddress } from "@/components/ui/WalletAddress";
import {
  getDashboardStats,
  getFreelancerStats,
  getFreelancerActivities,
  type FreelancerActivity,
} from "@/lib/api/freelancer";
import type { DashboardStats } from "@/types/freelancer-dashboard.types";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { StatsCard } from "./StatsCard";
import { ProfileCompleteness } from "./ProfileCompleteness";
import { RecommendedOffers } from "./RecommendedOffers";

// ── Sub-components ────────────────────────────────────────────────────────────

function QuickAction({
  href,
  iconPath,
  iconColor,
  title,
  description,
}: {
  href: string;
  iconPath: string;
  iconColor: string;
  title: string;
  description: string;
}): React.JSX.Element {
  return (
    <Link href={href} className={NEUMORPHIC_BUTTON}>
      <div className={cn(ICON_CONTAINER, iconColor)}>
        <Icon path={iconPath} className="text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </Link>
  );
}

function ActivityItem({ activity }: { activity: FreelancerActivity }): React.JSX.Element {
  const iconMap: Record<FreelancerActivity["type"], string> = {
    order_created: ICON_PATHS.briefcase,
    order_completed: ICON_PATHS.check,
    payment_received: ICON_PATHS.currency,
    withdrawal_completed: ICON_PATHS.document,
    topup_completed: ICON_PATHS.plus,
  };

  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-xl", NEUMORPHIC_INSET)}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon
          path={iconMap[activity.type] ?? ICON_PATHS.check}
          size="md"
          className="text-primary"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{activity.title}</p>
        <p className="text-sm text-text-secondary truncate">{activity.description}</p>
      </div>
      <span className="text-xs text-text-secondary whitespace-nowrap">{activity.time}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FreelancerDashboard(): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<FreelancerActivity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const fetchData = useCallback(
    async (force = false) => {
      if (!token) {
        setIsLoadingStats(false);
        setIsLoadingActivities(false);
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchRef.current < 2000) return;
      lastFetchRef.current = now;

      setIsLoadingStats(true);
      setIsLoadingActivities(true);

      try {
        // Try the richer endpoint first; fall back to existing stats endpoint
        const statsPromise = getDashboardStats(token).catch(async () => {
          const legacy = await getFreelancerStats(token);
          return {
            activeApplications: legacy.pendingProposals,
            activeOrders: 0,
            totalEarnings: legacy.totalEarnings,
            rating: null,
            ratingCount: 0,
            activeApplicationsTrend: null,
            activeOrdersTrend: null,
            earningsTrend: null,
            ratingTrend: null,
          } satisfies DashboardStats;
        });

        const [statsData, activitiesData] = await Promise.all([
          statsPromise,
          getFreelancerActivities(token),
        ]);

        setStats(statsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error("Failed to fetch freelancer dashboard data:", err);
      } finally {
        setIsLoadingStats(false);
        setIsLoadingActivities(false);
      }
    },
    [token]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(true);
    setIsRefreshing(false);
  }, [fetchData]);

  const { isPulling, pullDistance } = usePullToRefresh(handleRefresh);

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchData(true);
  }, [mounted, fetchData]);

  useEffect(() => {
    if (!mounted) return;
    const onVisible = () => document.visibilityState === "visible" && fetchData();
    const onFocus = () => fetchData();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [mounted, fetchData]);

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const ratingValue =
    stats?.rating != null
      ? `${stats.rating.toFixed(1)} ★`
      : "No ratings";

  return (
    <div className="space-y-8 pb-10">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex justify-center pt-2 transition-all duration-150"
          style={{ height: pullDistance / 2 }}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary",
              isPulling ? "animate-spin" : "opacity-50"
            )}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Welcome back, <span className="text-primary">{user?.username ?? "Freelancer"}</span>!
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Manage your services and grow your freelance business
          </p>
          {user?.wallet?.publicKey && (
            <div className="mt-4 inline-block">
              <WalletAddress address={user.wallet.publicKey} />
            </div>
          )}
        </div>

        {/* Manual refresh button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            "flex-shrink-0 p-2.5 rounded-xl mt-1",
            "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "transition-all duration-200",
            isRefreshing && "opacity-60 cursor-not-allowed"
          )}
          title="Refresh dashboard"
        >
          <Icon
            path={ICON_PATHS.refresh}
            size="md"
            className={cn("text-text-secondary", isRefreshing && "animate-spin")}
          />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-2 animate-fade-in-up">
        <QuickAction
          href="/app/freelancer/services/new"
          iconPath={ICON_PATHS.plus}
          iconColor="bg-primary/90 shadow-lg shadow-primary/20"
          title="Create Service"
          description="Offer a new service to clients"
        />
        <QuickAction
          href="/marketplace/offers"
          iconPath={ICON_PATHS.search}
          iconColor="bg-accent/90 shadow-lg shadow-accent/20"
          title="Browse Offers"
          description="Find new opportunities"
        />
        <QuickAction
          href="/app/freelancer/applications"
          iconPath={ICON_PATHS.document}
          iconColor="bg-secondary/90 shadow-lg shadow-secondary/20"
          title="My Applications"
          description="Track your proposals"
        />
        <QuickAction
          href="/app/orders"
          iconPath={ICON_PATHS.briefcase}
          iconColor="bg-success/90 shadow-lg shadow-success/20"
          title="My Orders"
          description="View active orders"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-3 animate-fade-in-up">
        <StatsCard
          label="Active Applications"
          value={stats?.activeApplications ?? 0}
          iconPath={ICON_PATHS.document}
          accentColor="bg-primary"
          trend={stats?.activeApplicationsTrend}
          isLoading={isLoadingStats}
        />
        <StatsCard
          label="Active Orders"
          value={stats?.activeOrders ?? 0}
          iconPath={ICON_PATHS.briefcase}
          accentColor="bg-secondary"
          trend={stats?.activeOrdersTrend}
          isLoading={isLoadingStats}
        />
        <StatsCard
          label="Total Earnings"
          value={stats?.totalEarnings ?? "$0.00"}
          iconPath={ICON_PATHS.currency}
          accentColor="bg-success"
          trend={stats?.earningsTrend}
          isLoading={isLoadingStats}
        />
        <StatsCard
          label="My Rating"
          value={ratingValue}
          iconPath={ICON_PATHS.star}
          accentColor="bg-accent"
          trend={stats?.ratingTrend}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Profile Views */}
      <ProfileViewsCard token={token} />

      {/* Activity + Profile Completeness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-4 animate-fade-in-up">
        {/* Recent Activity */}
        <div className={cn(NEUMORPHIC_CARD, "lg:col-span-2 border border-white/40")}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Recent Activity</h2>
              <p className="text-sm text-text-secondary mt-1">
                Stay updated with your latest transactions and jobs
              </p>
            </div>
            <Link
              href="/app/freelancer/activities"
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-background text-sm font-semibold text-primary shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              View all
              <Icon
                path={ICON_PATHS.chevronRight}
                size="sm"
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoadingActivities ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl animate-pulse",
                    NEUMORPHIC_INSET
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              ))
            ) : activities.length > 0 ? (
              activities.slice(0, 5).map((activity, idx) => (
                <div
                  key={activity.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.1 * idx}s` }}
                >
                  <ActivityItem activity={activity} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Icon
                    path={ICON_PATHS.calendar}
                    size="lg"
                    className="text-text-secondary/30"
                  />
                </div>
                <p className="text-text-secondary font-medium">No recent activity to show</p>
                <Link
                  href="/app/freelancer/services/new"
                  className="mt-4 text-sm text-primary font-semibold hover:underline"
                >
                  Create your first service →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="lg:col-span-1">
          <ProfileCompleteness
            user={user}
            stats={stats}
            isLoading={isLoadingStats}
          />
        </div>
      </div>

      {/* Recommended Offers */}
      <div className="stagger-5 animate-fade-in-up">
        <RecommendedOffers />
      </div>
    </div>
  );
}
