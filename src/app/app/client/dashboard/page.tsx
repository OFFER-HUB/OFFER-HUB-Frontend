"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { cn } from "@/lib/cn";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_BUTTON,
  NEUMORPHIC_INSET,
  ICON_CONTAINER,
} from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { getClientStats, getClientActivities, type ClientStats, type ClientActivity } from "@/lib/api/client";

interface QuickActionProps {
  href: string;
  iconPath: string;
  iconColor: string;
  title: string;
  description: string;
}

function QuickAction({
  href,
  iconPath,
  iconColor,
  title,
  description,
}: QuickActionProps): React.JSX.Element {
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

interface StatCardProps {
  label: string;
  value: string | number;
  iconPath: string;
  color: string;
}

function StatCard({ label, value, iconPath, color }: StatCardProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <div className="flex items-center gap-4">
        <div className={cn(ICON_CONTAINER, color)}>
          <Icon path={iconPath} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: ClientActivity;
}

function ActivityItem({ activity }: ActivityItemProps): React.JSX.Element {
  const getIconPath = (type: ClientActivity['type']): string => {
    switch (type) {
      case 'order_created':
      case 'order_completed':
        return ICON_PATHS.briefcase;
      case 'topup_completed':
        return ICON_PATHS.plus;
      default:
        return ICON_PATHS.check;
    }
  };

  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-xl", NEUMORPHIC_INSET)}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon path={getIconPath(activity.type)} size="md" className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{activity.title}</p>
        <p className="text-sm text-text-secondary truncate">{activity.description}</p>
      </div>
      <span className="text-xs text-text-secondary whitespace-nowrap">{activity.time}</span>
    </div>
  );
}

export default function ClientDashboardPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const [mounted, setMounted] = useState(false);
  const lastFetchRef = useRef<number>(0);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const fetchData = useCallback(async (force = false) => {
    if (!token) {
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
      return;
    }

    // Debounce: skip if fetched less than 2 seconds ago (unless forced)
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 2000) {
      return;
    }
    lastFetchRef.current = now;

    setIsLoadingStats(true);
    setIsLoadingActivities(true);

    try {
      const [statsData, activitiesData] = await Promise.all([
        getClientStats(token),
        getClientActivities(token),
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
    }
  }, [token]);

  useEffect(() => {
    setMode("client");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (!mounted) return;
    fetchData(true);
  }, [mounted, fetchData]);

  // Refetch data when user navigates back to this page (visibility change)
  useEffect(() => {
    if (!mounted) return;

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    }

    function handleFocus() {
      fetchData();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [mounted, fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.username || "Client"}!
        </h1>
        <p className="text-text-secondary mt-1">
          Find talented freelancers and manage your projects
        </p>
        {mounted && user?.wallet?.publicKey && (
          <div className="mt-3">
            <WalletAddress address={user.wallet.publicKey} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickAction
          href="/app/client/offers/new"
          iconPath={ICON_PATHS.plus}
          iconColor="bg-primary"
          title="Create Offer"
          description="Post a new job opportunity"
        />
        <QuickAction
          href="/app/client/offers"
          iconPath={ICON_PATHS.briefcase}
          iconColor="bg-secondary"
          title="View Offers"
          description="Manage your posted offers"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(NEUMORPHIC_CARD, "animate-pulse")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
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
            />
          </>
        )}
      </div>

      <div className={NEUMORPHIC_CARD}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
          <Link
            href="/app/client/activities"
            className="text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            View all
          </Link>
        </div>

        <div className="space-y-4">
          {isLoadingActivities ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("flex items-start gap-4 p-4 rounded-xl animate-pulse", NEUMORPHIC_INSET)}>
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded mb-2 w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          ) : (
            <div className="text-center text-text-secondary py-8">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
