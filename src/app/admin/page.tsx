"use client";

import { useAuthStore, type User } from "@/stores/auth-store";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { PlatformStats } from "@/components/admin/analytics/PlatformStats";
import { QuickActionButton } from "@/components/ui/QuickActionButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ICON_PATHS } from "@/components/ui/Icon";

/** Full name when the profile carries one, otherwise whatever identifies the admin. */
function greetingName(user: User | null): string {
  if (!user) return "Admin";
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  return user.firstName || user.username || "Admin";
}

/**
 * Admin's own landing page — same dashboard shape as the buyer/seller
 * dashboards (greeting, stat cards, quick actions), populated with
 * platform-wide admin data instead of one user's activity. Before this,
 * logging in as an admin dropped you into the regular buyer dashboard with
 * nothing admin-specific until you happened to click a sidebar link.
 */
export default function AdminDashboardPage(): React.JSX.Element {
  const isAuthorized = useAdminGuard();
  const user = useAuthStore((s) => s.user);
  const analytics = useAdminAnalytics(isAuthorized);

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back, {greetingName(user)}</h1>
        <p className="text-text-secondary mt-1">Platform overview and admin tools</p>
      </div>

      {analytics.isLoading ? (
        <LoadingState message="Loading platform overview..." />
      ) : analytics.error ? (
        <ErrorState title="Failed to Load Overview" message={analytics.error} onRetry={analytics.refetch} />
      ) : analytics.data ? (
        <PlatformStats stats={analytics.data.stats} />
      ) : null}

      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionButton
            href="/admin/users"
            iconPath={ICON_PATHS.users}
            iconColor="bg-primary/90 shadow-lg shadow-primary/20"
            title="Users"
            description="Manage marketplace accounts"
          />
          <QuickActionButton
            href="/admin/disputes"
            iconPath={ICON_PATHS.flag}
            iconColor="bg-warning/90 shadow-lg shadow-warning/20"
            title="Disputes"
            description="Review and resolve open disputes"
          />
          <QuickActionButton
            href="/admin/analytics"
            iconPath={ICON_PATHS.chartBar}
            iconColor="bg-secondary/90 shadow-lg shadow-secondary/20"
            title="Analytics"
            description="Platform-wide metrics and trends"
          />
        </div>
      </div>
    </div>
  );
}
