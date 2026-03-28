"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";
import { getProfileCompleteness, type ProfileCompletenessData } from "@/lib/api/profile";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileCompleteness(): React.JSX.Element | null {
  const { token } = useAuthStore();
  const [data, setData] = useState<ProfileCompletenessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function fetchCompleteness() {
      try {
        const result = await getProfileCompleteness(token!);
        if (isMounted) {
          setData(result);
          if (result.percentage >= 100) {
            setIsCollapsed(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile completeness", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchCompleteness();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (data?.percentage !== undefined) {
      // Animate progress change
      const timeout = setTimeout(() => {
        setAnimatedPercentage(data.percentage);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [data?.percentage]);

  if (isLoading) {
    return (
      <div className={cn(NEUMORPHIC_CARD, "flex items-center justify-center py-8")}>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!data) return null;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  if (data.isComplete || data.percentage >= 100) {
    if (isCollapsed) {
      return (
        <div
          className={cn(
            NEUMORPHIC_CARD,
            "py-3 px-4 flex flex-row items-center justify-between cursor-pointer group"
          )}
          onClick={() => setIsCollapsed(false)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Icon path={ICON_PATHS.check} size="md" className="text-success" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Profile 100% Complete!</p>
              <p className="text-xs text-text-secondary">You have earned the All-Star badge.</p>
            </div>
          </div>
          <Icon
            path={ICON_PATHS.chevronDown}
            size="sm"
            className="text-text-secondary group-hover:text-primary transition-colors"
          />
        </div>
      );
    }

    return (
      <div className={cn(NEUMORPHIC_CARD, "relative overflow-hidden")}>
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
        >
          <Icon path={ICON_PATHS.arrowUp} size="sm" />
        </button>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mb-4 relative before:absolute before:inset-0 before:bg-success/20 before:animate-ping before:rounded-full before:-z-10 shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]">
            <Icon path={ICON_PATHS.shield} size="xl" className="text-success scale-125" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Congratulations! 🎉</h2>
          <p className="text-sm text-text-secondary max-w-[250px] mx-auto">
            Your profile is 100% complete. You now have the All-Star badge, which helps you stand
            out on the marketplace.
          </p>
          <Link
            href="/app/profile"
            className={cn(PRIMARY_BUTTON, "mt-6 text-sm px-6 py-2 rounded-xl")}
          >
            View Public Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={NEUMORPHIC_CARD}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Profile Completeness</h2>
        <span className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">
          {animatedPercentage}%
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0 w-32 h-32 flex items-center justify-center drop-shadow-md">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-gray-200 stroke-current drop-shadow-sm"
              strokeWidth="6"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              className="text-primary stroke-current transition-all duration-1000 ease-out"
              strokeWidth="6"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tracking-tighter text-text-primary">
              {animatedPercentage}%
            </span>
          </div>
        </div>

        {/* Missing Fields List */}
        <div className="flex-1 w-full">
          <p className="text-sm text-text-secondary mb-4">
            Complete the following sections to reach 100% and unlock the All-Star badge.
          </p>
          <div className="space-y-3">
            {data.missingFields.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all hover:bg-black/5",
                  NEUMORPHIC_INSET
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                    <Icon path={ICON_PATHS.edit} size="sm" className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-secondary capitalize">{item.field}</p>
                  </div>
                </div>
                <Link
                  href={item.href}
                  className="text-primary hover:text-primary/80 transition-colors p-2 text-sm font-semibold"
                >
                  Add +
                </Link>
              </div>
            ))}
          </div>
          {data.missingFields.length > 3 && (
            <p className="text-xs text-text-secondary text-center mt-3 font-medium">
              And {data.missingFields.length - 3} more{" "}
              {data.missingFields.length - 3 === 1 ? "item" : "items"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
