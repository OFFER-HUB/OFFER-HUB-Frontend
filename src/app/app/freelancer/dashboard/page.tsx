"use client";

import { useEffect, useState } from "react";
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
import { ACTIVITY_ICONS } from "@/data/freelancer-dashboard.data";
import type { FreelancerActivity as FreelancerActivityType } from "@/types/freelancer-dashboard.types";
import { getFreelancerStats, getFreelancerActivities, type FreelancerStats, type FreelancerActivity } from "@/lib/api/freelancer";

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
  activity: FreelancerActivity;
}

function ActivityItem({ activity }: ActivityItemProps): React.JSX.Element {
  // Map activity types to icon paths
  const getIconPath = (type: FreelancerActivity['type']): string => {
    switch (type) {
      case 'order_created':
      case 'order_completed':
        return ICON_PATHS.briefcase;
      case 'payment_received':
        return ICON_PATHS.currency;
      case 'withdrawal_completed':
        return ICON_PATHS.document;
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

export default function FreelancerDashboardPage(): React.JSX.Element {
  const { setMode } = useModeStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [activities, setActivities] = useState<FreelancerActivity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Always call hooks - but only use values after mounted
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    setMode("freelancer");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only fetch data after component is mounted on client
    if (!mounted) return;

    if (token) {
      // Fetch stats
      getFreelancerStats(token)
        .then((data) => {
          setStats(data);
        })
        .catch((error) => {
          console.error('Failed to fetch stats:', error);
        })
        .finally(() => {
          setIsLoadingStats(false);
        });

      // Fetch activities
      getFreelancerActivities(token)
        .then((data) => {
          setActivities(data);
        })
        .catch((error) => {
          console.error('Failed to fetch activities:', error);
        })
        .finally(() => {
          setIsLoadingActivities(false);
        });
    } else {
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
    }
  }, [mounted, token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.username || "Freelancer"}!
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your services and grow your freelance business
        </p>
        {mounted && user?.wallet?.publicKey && (
          <div className="mt-3">
            <WalletAddress address={user.wallet.publicKey} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickAction
          href="/app/freelancer/services/new"
          iconPath={ICON_PATHS.plus}
          iconColor="bg-primary"
          title="Create Service"
          description="Offer a new service to clients"
        />
        <QuickAction
          href="/app/freelancer/profile"
          iconPath={ICON_PATHS.user}
          iconColor="bg-secondary"
          title="View Profile"
          description="Update your freelancer profile"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          // Loading skeleton
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
              label="Active Services"
              value={stats?.activeServices ?? 0}
              iconPath={ICON_PATHS.briefcase}
              color="bg-primary"
            />
            <div className={NEUMORPHIC_CARD}>
              <div className="flex items-center gap-4">
                <div className={cn(ICON_CONTAINER, "bg-success")}>
                  <Icon path={ICON_PATHS.currency} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-text-primary">{stats?.totalEarnings ?? "$0.00"}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-secondary">Total Balance</p>
                    {stats?.balanceSynced === false && (
                      <span className="text-xs text-warning" title="Balance may not be synced with Stellar">
                        ⚠️
                      </span>
                    )}
                  </div>
                  {stats?.stellarBalance && stats.stellarBalance !== 'Unknown' && (
                    <p className="text-xs text-text-secondary mt-1">
                      Stellar: {stats.stellarBalance}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <StatCard
              label="Pending Proposals"
              value={stats?.pendingProposals ?? 0}
              iconPath={ICON_PATHS.document}
              color="bg-secondary"
            />
            <StatCard
              label="Unread Messages"
              value={stats?.unreadMessages ?? 0}
              iconPath={ICON_PATHS.chat}
              color="bg-accent"
            />
          </>
        )}
      </div>

      <div className={NEUMORPHIC_CARD}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
          <Link
            href="/app/freelancer/activities"
            className="text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            View all
          </Link>
        </div>

        <div className="space-y-4">
          {isLoadingActivities ? (
            // Loading skeleton
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