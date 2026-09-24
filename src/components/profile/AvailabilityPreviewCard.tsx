"use client";

import { cn } from "@/lib/cn";
import type { FreelancerAvailability } from "@/lib/api/availability";

function availabilityBadgeLabel(a: FreelancerAvailability): { text: string; className: string } {
  if (a.vacationMode) {
    return { text: "Vacation", className: "bg-amber-500/15 text-amber-800 border border-amber-500/30" };
  }
  if (a.availableForWork) {
    return { text: "Available", className: "bg-success/10 text-success border border-success/25" };
  }
  return { text: "Unavailable", className: "bg-gray-200/80 text-text-secondary border border-gray-300" };
}

export interface AvailabilityPreviewCardProps {
  availability: FreelancerAvailability;
  displayName: string;
  avatarUrl?: string | null;
}

export function AvailabilityPreviewCard({
  availability,
  displayName,
  avatarUrl,
}: AvailabilityPreviewCardProps): React.JSX.Element {
  const badge = availabilityBadgeLabel(availability);
  const initials = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">Profile preview</p>
      <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:text-left sm:items-start">
        <div className="relative flex-shrink-0">
          {avatarUrl && !avatarUrl.startsWith("blob:") ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                "bg-primary/10 text-primary text-xl font-bold border-2 border-white shadow-md"
              )}
            >
              {initials}
            </div>
          )}
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white",
              availability.availableForWork && !availability.vacationMode ? "bg-green-500" : "bg-gray-400"
            )}
            title={badge.text}
          />
        </div>
        <div className="min-w-0 flex-1 w-full">
          <h3 className="font-bold text-text-primary truncate">{displayName}</h3>
          <span
            className={cn(
              "inline-flex mt-2 px-2.5 py-0.5 rounded-lg text-xs font-semibold",
              badge.className
            )}
          >
            {badge.text}
          </span>
          <dl className="mt-3 space-y-1.5 text-xs text-text-secondary">
            <div className="flex justify-between gap-2">
              <dt>Hours / week</dt>
              <dd className="font-medium text-text-primary">{availability.hoursPerWeek}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Timezone</dt>
              <dd className="font-medium text-text-primary truncate max-w-[60%]" title={availability.timezone}>
                {availability.timezone}
              </dd>
            </div>
            {availability.availableFromDate && (
              <div className="flex justify-between gap-2">
                <dt>Available from</dt>
                <dd className="font-medium text-text-primary">{availability.availableFromDate}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
