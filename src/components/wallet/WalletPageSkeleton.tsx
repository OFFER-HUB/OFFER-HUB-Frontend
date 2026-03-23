"use client";

/**
 * Loading placeholders for the wallet dashboard.
 */
export function WalletPageSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      <div className="h-44 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
        <div className="h-80 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
      </div>
      <div className="h-56 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
    </div>
  );
}
