"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useFreelancerDashboardData } from "@/hooks/useFreelancerDashboardData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import type { FreelancerActivity } from "@/lib/api/freelancer";
import { ProfileViewsCard } from "@/components/analytics/ProfileViewsCard";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ActivityFeedItem, ActivityFeedItemSkeleton } from "@/components/ui/ActivityFeedItem";
import { DashboardWalletHeader } from "@/components/ui/DashboardWalletHeader";
import { QuickActionButton } from "@/components/ui/QuickActionButton";
import { StatsCard } from "./StatsCard";
import { ProfileCompleteness } from "./ProfileCompleteness";
import { RecommendedOffers } from "./RecommendedOffers";

const ACTIVITY_ICON_PATHS: Record<FreelancerActivity["type"], string> = {
  order_created: ICON_PATHS.briefcase,
  order_completed: ICON_PATHS.check,
  payment_received: ICON_PATHS.currency,
  withdrawal_completed: ICON_PATHS.document,
  topup_completed: ICON_PATHS.plus,
};

const ACTIVITY_SKELETON_COUNT = 5;

export function FreelancerDashboard(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const {
    stats,
    activities,
    walletBalance,
    isLoading,
    isRefreshing,
    isMounted,
    refetch,
  } = useFreelancerDashboardData();

  // Live on-chain USDC balance of the connected wallet (SCF D1.1), independent
  // of the platform-ledger `walletBalance` above.
  const onChainBalance = useWalletBalance();

  const { isPulling, pullDistance } = usePullToRefresh(refetch);

  if (!isMounted) return <div className="min-h-screen bg-background" />;

  const ratingValue = stats?.rating != null ? `${stats.rating.toFixed(1)} ★` : "No ratings";

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
          <DashboardWalletHeader
            walletAddress={user?.wallet?.publicKey}
            balance={walletBalance}
            onChainUsdc={
              onChainBalance.address === null
                ? null
                : { amount: onChainBalance.balances?.usdc.balance ?? "0", isLoading: onChainBalance.isLoading }
            }
          />
        </div>

        {/* Manual refresh button */}
        <button
          type="button"
          onClick={refetch}
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
        <QuickActionButton
          href="/app/freelancer/services/new"
          iconPath={ICON_PATHS.plus}
          iconColor="bg-primary/90 shadow-lg shadow-primary/20"
          title="Create Service"
          description="Offer a new service to clients"
        />
        <QuickActionButton
          href="/marketplace/offers"
          iconPath={ICON_PATHS.search}
          iconColor="bg-accent/90 shadow-lg shadow-accent/20"
          title="Browse Offers"
          description="Find new opportunities"
        />
        <QuickActionButton
          href="/app/freelancer/applications"
          iconPath={ICON_PATHS.document}
          iconColor="bg-secondary/90 shadow-lg shadow-secondary/20"
          title="My Applications"
          description="Track your proposals"
        />
        <QuickActionButton
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
          isLoading={isLoading}
          subtitle="Pending proposals sent"
        />
        <StatsCard
          label="Active Orders"
          value={stats?.activeOrders ?? 0}
          iconPath={ICON_PATHS.briefcase}
          accentColor="bg-secondary"
          trend={stats?.activeOrdersTrend}
          isLoading={isLoading}
          subtitle="In progress"
        />
        <StatsCard
          label="Total Earnings"
          value={stats?.totalEarnings ?? "$0.00"}
          iconPath={ICON_PATHS.currency}
          accentColor="bg-success"
          trend={stats?.earningsTrend}
          isLoading={isLoading}
          subtitle="From released orders"
        />
        <StatsCard
          label="My Rating"
          value={ratingValue}
          iconPath={ICON_PATHS.star}
          accentColor="bg-accent"
          trend={stats?.ratingTrend}
          isLoading={isLoading}
          subtitle="Avg. from reviews"
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
            {isLoading ? (
              Array.from({ length: ACTIVITY_SKELETON_COUNT }).map((_, i) => (
                <ActivityFeedItemSkeleton key={i} />
              ))
            ) : activities.length > 0 ? (
              activities.slice(0, 5).map((activity, idx) => (
                <div
                  key={activity.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.1 * idx}s` }}
                >
                  <ActivityFeedItem
                    type={activity.type}
                    title={activity.title}
                    subtitle={activity.description}
                    time={activity.time}
                    iconByType={ACTIVITY_ICON_PATHS}
                  />
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
          <ProfileCompleteness />
        </div>
      </div>

      {/* Recommended Offers */}
      <div className="stagger-5 animate-fade-in-up">
        <RecommendedOffers />
      </div>
    </div>
  );
}
