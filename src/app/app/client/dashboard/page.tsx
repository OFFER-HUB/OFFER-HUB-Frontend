"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore, type User } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { useClientDashboardData } from "@/hooks/useClientDashboardData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import type { ClientActivity } from "@/lib/api/client";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ActivityFeedItem, ActivityFeedItemSkeleton } from "@/components/ui/ActivityFeedItem";
import { DashboardWalletHeader } from "@/components/ui/DashboardWalletHeader";
import { QuickActionButton } from "@/components/ui/QuickActionButton";
import { ApplicationsToReview } from "@/components/client-dashboard/ApplicationsToReview";
import { ClientDashboardSkeleton } from "@/components/client-dashboard/ClientDashboardSkeleton";
import { ClientStatCard } from "@/components/client-dashboard/ClientStatCard";
import { RecommendedFreelancers } from "@/components/client-dashboard/RecommendedFreelancers";
import { ProfileCompleteness } from "@/components/profile/ProfileCompleteness";

const ACTIVITY_ICON_PATHS: Record<ClientActivity["type"], string> = {
  order_created: ICON_PATHS.briefcase,
  order_completed: ICON_PATHS.check,
  topup_completed: ICON_PATHS.currency,
};

const ACTIVITY_SKELETON_COUNT = 5;

/** Full name when the profile carries one, otherwise whatever identifies the user. */
function greetingName(user: User | null): string {
  if (!user) return "Client";
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  return user.firstName || user.username || "Client";
}

export default function ClientDashboardPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const user = useAuthStore((s) => s.user);

  const {
    stats,
    activities,
    offers,
    walletBalance,
    isLoading,
    isRefreshing,
    isMounted,
    refetch,
  } = useClientDashboardData();

  // Live on-chain USDC balance of the connected wallet (SCF D1.1), independent
  // of the platform-ledger `walletBalance` above.
  const onChainBalance = useWalletBalance();

  const { isPulling, pullDistance } = usePullToRefresh(refetch);

  useEffect(() => {
    setMode("client");
  }, [setMode]);

  if (!isMounted) return <ClientDashboardSkeleton />;

  return (
    <div className="space-y-8 pb-10">
      {/* Pull-to-refresh indicator (mobile) */}
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
            Welcome back, <span className="text-primary">{greetingName(user)}</span>!
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Find talented freelancers and manage your projects effectively
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

      {/* Quick Actions — 4 buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-2 animate-fade-in-up">
        <QuickActionButton
          href="/app/client/offers/new"
          iconPath={ICON_PATHS.plus}
          iconColor="bg-primary/90 shadow-lg shadow-primary/20"
          title="Post an Offer"
          description="Find the right freelancer"
        />
        <QuickActionButton
          href="/marketplace"
          iconPath={ICON_PATHS.search}
          iconColor="bg-accent/90 shadow-lg shadow-accent/20"
          title="Browse Talent"
          description="Explore services & freelancers"
        />
        <QuickActionButton
          href="/app/client/offers"
          iconPath={ICON_PATHS.briefcase}
          iconColor="bg-secondary/90 shadow-lg shadow-secondary/20"
          title="My Offers"
          description="Manage posted offers"
        />
        <QuickActionButton
          href="/app/orders"
          iconPath={ICON_PATHS.list}
          iconColor="bg-success/90 shadow-lg shadow-success/20"
          title="My Orders"
          description="Track active orders"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-3 animate-fade-in-up">
        <ClientStatCard
          label="Active Offers"
          value={stats?.activeOffers ?? 0}
          iconPath={ICON_PATHS.document}
          color="bg-primary"
          subtitle="Awaiting freelancers"
          isLoading={isLoading}
        />
        <ClientStatCard
          label="Active Orders"
          value={stats?.activeOrders ?? 0}
          iconPath={ICON_PATHS.briefcase}
          color="bg-secondary"
          subtitle="In progress"
          isLoading={isLoading}
        />
        <ClientStatCard
          label="Services Purchased"
          value={stats?.servicesPurchased ?? 0}
          iconPath={ICON_PATHS.check}
          color="bg-accent"
          subtitle="Unique services hired"
          isLoading={isLoading}
        />
        <ClientStatCard
          label="Budget Spent"
          value={stats?.budgetSpent ?? "$0.00"}
          iconPath={ICON_PATHS.currency}
          color="bg-success"
          isPositive={false}
          subtitle="All-time total orders"
          isLoading={isLoading}
        />
      </div>

      <div className="stagger-3 animate-fade-in-up">
        <ProfileCompleteness />
      </div>

      {/* Applications Awaiting Review — shown only when there are applicants */}
      <ApplicationsToReview offers={offers} isLoading={isLoading} />

      {/* Recent Activity */}
      <div className={cn(NEUMORPHIC_CARD, "stagger-4 animate-fade-in-up border border-white/40")}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Recent Activity</h2>
            <p className="text-sm text-text-secondary mt-1">
              Track your project status and hired services
            </p>
          </div>
          <Link
            href="/app/client/activities"
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
                <Icon path={ICON_PATHS.calendar} size="lg" className="text-text-secondary/30" />
              </div>
              <p className="text-text-secondary font-medium">No recent activity to show</p>
              <Link
                href="/app/client/offers/new"
                className="mt-4 text-sm text-primary font-semibold hover:underline"
              >
                Post your first offer →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Freelancers */}
      <RecommendedFreelancers />
    </div>
  );
}
