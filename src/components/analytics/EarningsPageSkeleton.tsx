"use client";

import { cn } from "@/lib/cn";

function SkeletonBlock({ className }: { className?: string }): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl animate-pulse bg-background",
        "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
        className
      )}
    />
  );
}

export function EarningsPageSkeleton(): React.JSX.Element {
  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SkeletonBlock className="h-16 w-full max-w-md" />
        <SkeletonBlock className="h-12 w-full sm:w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>
      <SkeletonBlock className="h-96" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
      </div>
    </div>
  );
}
