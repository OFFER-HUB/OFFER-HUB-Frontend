"use client";

export function ClientDashboardSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]" />
        ))}
      </div>
      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]" />
        ))}
      </div>
      {/* Offers + activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56 rounded-2xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
        <div className="h-56 rounded-2xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
      </div>
    </div>
  );
}
