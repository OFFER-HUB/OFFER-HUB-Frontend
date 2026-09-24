"use client";

export function FreelancerDashboardSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]" />
        ))}
      </div>
      {/* Profile completeness + secondary card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-48 rounded-2xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
        <div className="h-48 rounded-2xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
      </div>
      {/* Activities */}
      <div className="h-64 rounded-2xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
    </div>
  );
}
