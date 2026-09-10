export function TransactionHistorySkeleton(): React.JSX.Element {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse" aria-hidden>
      <div className="h-28 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
      <div className="h-56 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
      <div className="space-y-4">
        <div className="h-10 w-52 rounded-xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
        <div className="h-72 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]" />
      </div>
    </div>
  );
}