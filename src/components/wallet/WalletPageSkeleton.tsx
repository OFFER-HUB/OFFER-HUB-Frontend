"use client";

/**
 * Loading placeholders for the wallet dashboard.
 */
export function WalletPageSkeleton(): React.JSX.Element {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse" aria-hidden>
      {/* Header skeleton */}
      <div className="flex justify-between items-center h-16 mb-2">
        <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex gap-2">
          <div className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Master Balance Card */}
      <div className="h-56 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="h-36 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
        <div className="h-36 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
        <div className="h-36 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
      </div>

      {/* Chart & Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-84 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
        <div className="h-84 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
      </div>
    </div>
  );
}
