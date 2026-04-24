"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProfileViewsCard } from "@/components/analytics/ProfileViewsCard";
import { ProfileCompleteness } from "@/components/profile/ProfileCompleteness";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { FreelancerDashboard } from "@/components/freelancer-dashboard/FreelancerDashboard";
import { WalletAddress } from "@/components/ui/WalletAddress";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export default function FreelancerDashboardPage(): React.JSX.Element {
  const { user, token } = useAuthStore();
  const { setMode } = useModeStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<{ totalEarnings: number; totalOrders: number } | null>(null);
  const [activities, setActivities] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    setMode("freelancer");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only fetch data after component is mounted on client
    if (!mounted) return;

    if (token) {
      // Fetch stats - placeholder for now
      setTimeout(() => {
        setStats({ totalEarnings: 0, totalOrders: 0 });
        setIsLoadingStats(false);
      }, 1000);

      // Fetch activities - placeholder for now
      setTimeout(() => {
        setActivities([]);
        setIsLoadingActivities(false);
      }, 1000);
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
          href="/app/freelancer/services"
          iconPath={ICON_PATHS.briefcase}
          iconColor="bg-secondary/90 shadow-lg shadow-secondary/20"
          title="My Services"
          description="Manage your services"
        />
      </div>

      <FreelancerDashboard />
    </div>
  );
}

interface QuickActionProps {
  href: string;
  iconPath: string;
  iconColor: string;
  title: string;
  description: string;
}

function QuickAction({ href, iconPath, iconColor, title, description }: QuickActionProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
        "bg-gradient-to-br from-white to-gray-50",
        "shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]",
        "hover:shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff]",
        "border border-gray-100"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", iconColor)}>
          <Icon path={iconPath} size="md" className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}