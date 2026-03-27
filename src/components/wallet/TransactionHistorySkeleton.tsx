export function TransactionHistorySkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      <div className="h-28 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
      <div className="h-56 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
      <div className="space-y-4">
        <div className="h-10 w-52 rounded-xl bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]" />
        <div className="h-72 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]" />
      </div>
    </div>
  );
}