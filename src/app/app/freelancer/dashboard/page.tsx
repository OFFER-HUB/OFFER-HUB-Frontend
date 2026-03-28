"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProfileViewsCard } from "@/components/analytics/ProfileViewsCard";
import { ProfileCompleteness } from "@/components/profile/ProfileCompleteness";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_BUTTON, NEUMORPHIC_INSET, ICON_CONTAINER } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { WalletAddress } from "@/components/ui/WalletAddress";
import {
  getFreelancerStats,
  getFreelancerActivities,
  type FreelancerStats,
  type FreelancerActivity,
} from "@/lib/api/freelancer";

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

interface ActivityItemProps {
  activity: FreelancerActivity;
}

function ActivityItem({ activity }: ActivityItemProps): React.JSX.Element {
  // Map activity types to icon paths
  const getIconPath = (type: FreelancerActivity["type"]): string => {
    switch (type) {
      case "order_created":
      case "order_completed":
        return ICON_PATHS.briefcase;
      case "payment_received":
        return ICON_PATHS.currency;
      case "withdrawal_completed":
        return ICON_PATHS.document;
      case "topup_completed":
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
          console.error("Failed to fetch stats:", error);
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
          console.error("Failed to fetch activities:", error);
        })
        .finally(() => {
          setIsLoadingActivities(false);
        });
    } else {
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
    }
  }, [mounted, token]);

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <div className="space-y-8 pb-10">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
          Welcome back, <span className="text-primary">{user?.username || "Freelancer"}</span>!
        </h1>
        <p className="text-text-secondary mt-2 text-lg">
          Manage your services and grow your freelance business
        </p>
        {mounted && user?.wallet?.publicKey && (
          <div className="mt-4 inline-block">
            <WalletAddress address={user.wallet.publicKey} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-2 animate-fade-in-up">
        <QuickAction
          href="/app/freelancer/services/new"
          iconPath={ICON_PATHS.plus}
          iconColor="bg-primary/90 shadow-lg shadow-primary/20"
          title="Create Service"
          description="Offer a new service to clients"
        />
        <QuickAction
          href="/app/profile"
          iconPath={ICON_PATHS.user}
          iconColor="bg-secondary/90 shadow-lg shadow-secondary/20"
          title="View Profile"
          description="Update your profile"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-3 animate-fade-in-up">
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
            <div
              className={cn(
                NEUMORPHIC_CARD,
                "group transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff]"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    ICON_CONTAINER,
                    "bg-primary group-hover:scale-110 transition-transform duration-500"
                  )}
                >
                  <Icon path={ICON_PATHS.briefcase} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats?.activeServices ?? 0}
                  </p>
                  <p className="text-sm text-text-secondary">Active Services</p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                NEUMORPHIC_CARD,
                "group transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff]"
              )}
              data-tour="balance-card"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    ICON_CONTAINER,
                    "bg-success group-hover:scale-110 transition-transform duration-500"
                  )}
                >
                  <Icon path={ICON_PATHS.currency} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-text-primary">
                    {stats?.totalEarnings ?? "$0.00"}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-secondary">Total Balance</p>
                    {stats?.balanceSynced === false && (
                      <span
                        className="text-xs text-warning"
                        title="Balance may not be synced with Stellar"
                      >
                        ⚠️
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={cn(
                NEUMORPHIC_CARD,
                "group transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff]"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    ICON_CONTAINER,
                    "bg-secondary group-hover:scale-110 transition-transform duration-500"
                  )}
                >
                  <Icon path={ICON_PATHS.document} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats?.pendingProposals ?? 0}
                  </p>
                  <p className="text-sm text-text-secondary">Pending Proposals</p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                NEUMORPHIC_CARD,
                "group transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff]"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    ICON_CONTAINER,
                    "bg-accent group-hover:scale-110 transition-transform duration-500"
                  )}
                >
                  <Icon path={ICON_PATHS.chat} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats?.unreadMessages ?? 0}
                  </p>
                  <p className="text-sm text-text-secondary">Unread Messages</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="stagger-3 animate-fade-in-up">
        <ProfileCompleteness />
      </div>

      <ProfileViewsCard token={token} />

      <div className={cn(NEUMORPHIC_CARD, "stagger-4 animate-fade-in-up border border-white/40")}>
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
                className={cn("animate-fade-in")}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
