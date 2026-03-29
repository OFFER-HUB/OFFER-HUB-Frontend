import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { User } from "@/stores/auth-store";
import type { DashboardStats } from "@/types/freelancer-dashboard.types";

interface CompletenessItem {
  label: string;
  completed: boolean;
  href: string;
}

interface ProfileCompletenessProps {
  user: User | null;
  stats: DashboardStats | null;
  isLoading?: boolean;
}

function getItems(user: User | null, stats: DashboardStats | null): CompletenessItem[] {
  return [
    {
      label: "Add a profile photo",
      completed: !!user?.avatarUrl,
      href: "/app/profile",
    },
    {
      label: "Connect your wallet",
      completed: !!user?.wallet,
      href: "/app/wallet",
    },
    {
      label: "Create your first service",
      completed: (stats?.activeApplications ?? 0) > 0,
      href: "/app/freelancer/services/new",
    },
    {
      label: "Complete your first order",
      completed: (stats?.totalEarnings ?? "$0.00") !== "$0.00",
      href: "/app/freelancer/activities",
    },
  ];
}

export function ProfileCompleteness({
  user,
  stats,
  isLoading,
}: ProfileCompletenessProps): React.JSX.Element {
  const items = getItems(user, stats);
  const completedCount = items.filter((i) => i.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);
  const incompleteItems = items.filter((i) => !i.completed).slice(0, 3);
  const isComplete = percentage === 100;

  const percentageColor =
    percentage >= 75 ? "text-success" : percentage >= 50 ? "text-warning" : "text-error";

  if (isLoading) {
    return (
      <div className={cn(NEUMORPHIC_CARD, "animate-pulse")}>
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-3 bg-gray-200 rounded-full w-full mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(NEUMORPHIC_CARD, "animate-fade-in-up")}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">Profile Completeness</h2>
        <span className={cn("text-2xl font-extrabold", percentageColor)}>{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className={cn(NEUMORPHIC_INSET, "w-full h-3 rounded-full mb-5 overflow-hidden")}>
        <div
          className="h-3 rounded-full bg-primary transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Complete state */}
      {isComplete ? (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
            <Icon path={ICON_PATHS.check} size="sm" className="text-success" />
          </div>
          <p className="text-sm font-semibold text-success">Your profile is complete!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incompleteItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
              <Link
                href={item.href}
                className="text-sm text-primary hover:underline"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
