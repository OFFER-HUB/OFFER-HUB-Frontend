"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_BUTTON, NEUMORPHIC_INSET, ICON_CONTAINER } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { WalletAddress } from "@/components/ui/WalletAddress";
import {
  getClientStats,
  getClientActivities,
  type ClientStats,
  type ClientActivity,
} from "@/lib/api/client";
import { getMyOffers, type Offer } from "@/lib/api/offers";
import { ApplicationsToReview } from "@/components/client-dashboard/ApplicationsToReview";
import { RecommendedFreelancers } from "@/components/client-dashboard/RecommendedFreelancers";
import { ProfileCompleteness } from "@/components/profile/ProfileCompleteness";

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

function StatCard({
  label,
  value,
  iconPath,
  color,
  isPositive,
}: {
  label: string;
  value: string | number;
  iconPath: string;
  color: string;
  isPositive?: boolean;
}): React.JSX.Element {
  const numericValue =
    typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;
  const hasValue = numericValue > 0;

  return (
    <div
      className={cn(
        NEUMORPHIC_CARD,
        "group transition-all duration-300 hover:-translate-y-1",
        "hover:shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff]"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            ICON_CONTAINER,
            color,
            "group-hover:scale-110 transition-transform duration-500"
          )}
        >
          <Icon path={iconPath} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-text-primary truncate">{value}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm text-text-secondary">{label}</p>
            {hasValue && (
              <span
                className={cn(
                  "text-[10px] font-semibold flex items-center gap-0.5",
                  isPositive === false ? "text-error" : "text-success"
                )}
              >
                <Icon
                  path={isPositive === false ? ICON_PATHS.arrowDown : ICON_PATHS.arrowUp}
                  size="sm"
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: ClientActivity }): React.JSX.Element {
  const iconMap: Record<ClientActivity["type"], string> = {
    order_created: ICON_PATHS.briefcase,
    order_completed: ICON_PATHS.check,
    topup_completed: ICON_PATHS.currency,
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

// ── Pull-to-refresh hook ──────────────────────────────────────────────────────

const PULL_THRESHOLD = 80;

function usePullToRefresh(onRefresh: () => void): {
  isPulling: boolean;
  pullDistance: number;
} {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);

  useEffect(() => {
    function onTouchStart(e: TouchEvent): void {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    }

    function onTouchMove(e: TouchEvent): void {
      if (startYRef.current === 0) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        setPullDistance(Math.min(delta, PULL_THRESHOLD * 1.5));
        setIsPulling(delta >= PULL_THRESHOLD);
      }
    }

    function onTouchEnd(): void {
      if (isPulling) onRefresh();
      setIsPulling(false);
      setPullDistance(0);
      startYRef.current = 0;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPulling, onRefresh]);

  return { isPulling, pullDistance };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientDashboardPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const [stats, setStats] = useState<ClientStats | null>(null);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const fetchData = useCallback(
    async (force = false) => {
      if (!token) {
        setIsLoadingStats(false);
        setIsLoadingActivities(false);
        setIsLoadingOffers(false);
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchRef.current < 2000) return;
      lastFetchRef.current = now;

      setIsLoadingStats(true);
      setIsLoadingActivities(true);
      setIsLoadingOffers(true);

      try {
        const [statsData, activitiesData, offersData] = await Promise.all([
          getClientStats(token),
          getClientActivities(token),
          getMyOffers(token),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setOffers(offersData);
      } catch (err) {
        console.error("Failed to fetch client dashboard data:", err);
      } finally {
        setIsLoadingStats(false);
        setIsLoadingActivities(false);
        setIsLoadingOffers(false);
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
    setMode("client");
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
            Welcome back, <span className="text-primary">{user?.username ?? "Client"}</span>!
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Find talented freelancers and manage your projects effectively
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

      {/* Quick Actions — 4 buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-2 animate-fade-in-up">
        <QuickAction
          href="/app/client/offers/new"
          iconPath={ICON_PATHS.plus}
          iconColor="bg-primary/90 shadow-lg shadow-primary/20"
          title="Post an Offer"
          description="Find the right freelancer"
        />
        <QuickAction
          href="/marketplace"
          iconPath={ICON_PATHS.search}
          iconColor="bg-accent/90 shadow-lg shadow-accent/20"
          title="Browse Talent"
          description="Explore services & freelancers"
        />
        <QuickAction
          href="/app/client/offers"
          iconPath={ICON_PATHS.briefcase}
          iconColor="bg-secondary/90 shadow-lg shadow-secondary/20"
          title="My Offers"
          description="Manage posted offers"
        />
        <QuickAction
          href="/app/orders"
          iconPath={ICON_PATHS.list}
          iconColor="bg-success/90 shadow-lg shadow-success/20"
          title="My Orders"
          description="Track active orders"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-3 animate-fade-in-up">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(NEUMORPHIC_CARD, "animate-pulse")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Active Offers"
              value={stats?.activeOffers ?? 0}
              iconPath={ICON_PATHS.document}
              color="bg-primary"
            />
            <StatCard
              label="Active Orders"
              value={stats?.activeOrders ?? 0}
              iconPath={ICON_PATHS.briefcase}
              color="bg-secondary"
            />
            <StatCard
              label="Services Purchased"
              value={stats?.servicesPurchased ?? 0}
              iconPath={ICON_PATHS.check}
              color="bg-accent"
            />
            <StatCard
              label="Budget Spent"
              value={stats?.budgetSpent ?? "$0.00"}
              iconPath={ICON_PATHS.currency}
              color="bg-success"
              isPositive={false}
            />
          </>
        )}
      </div>

      <div className="stagger-3 animate-fade-in-up">
        <ProfileCompleteness />
      </div>

      {/* Applications Awaiting Review — shown only when there are applicants */}
      <ApplicationsToReview offers={offers} isLoading={isLoadingOffers} />

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
