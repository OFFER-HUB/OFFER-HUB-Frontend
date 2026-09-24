"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { getProfileCompleteness, type ProfileCompletenessData } from "@/lib/api/profile";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileCompleteness(): React.JSX.Element | null {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<ProfileCompletenessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    let active = true;
    getProfileCompleteness(token)
      .then((d) => { if (active) setData(d); })
      .catch(() => {})
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [token]);

  if (isLoading) {
    return (
      <div className={cn(NEUMORPHIC_CARD, "flex items-center justify-center py-8")}>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!data || data.isComplete || data.percentage >= 100) return null;

  const percentageColor =
    data.percentage >= 75 ? "text-success" : data.percentage >= 50 ? "text-warning" : "text-error";

  return (
    <div className={cn(NEUMORPHIC_CARD, "animate-fade-in-up")}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">Profile Completeness</h2>
        <span className={cn("text-2xl font-extrabold", percentageColor)}>{data.percentage}%</span>
      </div>

      <div className={cn(NEUMORPHIC_INSET, "w-full h-3 rounded-full mb-5 overflow-hidden")}>
        <div
          className="h-3 rounded-full bg-primary transition-all duration-700"
          style={{ width: `${data.percentage}%` }}
        />
      </div>

      <div className="space-y-3">
        {(data.missingFields ?? []).slice(0, 3).map((item) => (
          <div key={item.field} className={cn("flex items-center justify-between p-3 rounded-xl", NEUMORPHIC_INSET)}>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
              <p className="text-sm text-text-primary">{item.label}</p>
            </div>
            <Link href={item.href} className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors">
              Add +
            </Link>
          </div>
        ))}
      </div>

      {(data.missingFields?.length ?? 0) > 3 && (
        <p className="text-xs text-text-secondary text-center mt-3 font-medium">
          And {(data.missingFields?.length ?? 0) - 3} more{" "}
          {(data.missingFields?.length ?? 0) - 3 === 1 ? "item" : "items"}
        </p>
      )}
    </div>
  );
}
