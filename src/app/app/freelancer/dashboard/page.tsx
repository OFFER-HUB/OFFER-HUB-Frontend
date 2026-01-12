"use client";

import { useEffect } from "react";
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
import {
  FREELANCER_STATS,
  FREELANCER_ACTIVITY,
  ACTIVITY_ICONS,
} from "@/data/freelancer-dashboard.data";
import type {
  FreelancerStatCard,
  FreelancerActivity,
} from "@/types/freelancer-dashboard.types";

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
  stat: FreelancerStatCard;
}

function StatCard({ stat }: StatCardProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <div className="flex items-center gap-4">
        <div className={cn(ICON_CONTAINER, stat.color)}>
          <Icon path={stat.iconPath} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          <p className="text-sm text-text-secondary">{stat.label}</p>
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: FreelancerActivity;
}

function ActivityItem({ activity }: ActivityItemProps): React.JSX.Element {
  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-xl", NEUMORPHIC_INSET)}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon path={ACTIVITY_ICONS[activity.type]} size="md" className="text-primary" />
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
  const user = useAuthStore((state) => state.user);
  const { setMode } = useModeStore();

  useEffect(() => {
    setMode("freelancer");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.username || "Freelancer"}!
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your services and grow your freelance business
        </p>
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
        {FREELANCER_STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className={NEUMORPHIC_CARD}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
          <button className="text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer">
            View all
          </button>
        </div>

        <div className="space-y-4">
          {FREELANCER_ACTIVITY.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}