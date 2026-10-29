"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing";
import { EscrowsTable } from "@/components/stats/EscrowsTable";
import { ValidationRuns } from "@/components/stats/ValidationRuns";
import { WalletsTable } from "@/components/stats/WalletsTable";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { usePlatformStats } from "@/hooks/use-platform-stats";
import { usePublicValidationResults } from "@/hooks/use-public-validation-results";

export default function PlatformStatsPage(): React.JSX.Element {
  const [walletsLimit, setWalletsLimit] = useState(5);
  const [escrowsLimit, setEscrowsLimit] = useState(5);
  const stats = usePlatformStats(walletsLimit, escrowsLimit);
  const validationResults = usePublicValidationResults();
  const formattedFetchedAt = stats.fetchedAt
    ? new Date(stats.fetchedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header (FAQ Page Style) */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 animate-fade-in-up">
              Platform Stats
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto text-base animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Real-time insights and transparent key metrics showcasing user registration, secure wallet generation, and transaction volume.
            </p>
          </div>

          <div className="mb-10">
            <ValidationRuns
              data={validationResults.data}
              error={validationResults.error}
              fetchedAt={validationResults.fetchedAt}
              isLoading={validationResults.isLoading}
              onRetry={validationResults.refresh}
            />
          </div>

          {stats.isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <LoadingSpinner size="lg" className="text-primary" />
              <p className="text-sm text-text-secondary animate-pulse">Syncing platform metrics...</p>
            </div>
          ) : stats.error && !stats.data ? (
            <div className="p-8 rounded-3xl bg-white text-center shadow-[var(--shadow-neumorphic-light)] max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                <Icon path={ICON_PATHS.alertCircle} size="md" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Error Syncing Metrics</h3>
              <p className="text-sm text-text-secondary mb-6">{stats.error}</p>
              <button
                onClick={() => void stats.refresh()}
                className="px-6 py-2.5 rounded-xl font-medium bg-primary text-white shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all duration-200 cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : stats.data ? (
            <div className="space-y-10">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-secondary">
                <p aria-live="polite">
                  {formattedFetchedAt ? `Last updated ${formattedFetchedAt}` : ""}
                  {stats.isRefreshing && " · Refreshing metrics..."}
                </p>
                {stats.error && (
                  <p role="status" className="text-warning">
                    Refresh failed: {stats.error}. Showing the last loaded metrics.
                  </p>
                )}
              </div>

              {/* Metrics Grid using standard project design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users card */}
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.users} size="lg" />
                  </div>
                  <span className="text-3xl font-bold text-text-primary tracking-tight">
                    {stats.data.summary.users.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Registered Users
                  </span>
                </div>

                {/* Wallets card */}
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.creditCard} size="lg" />
                  </div>
                  <span className="text-3xl font-bold text-text-primary tracking-tight">
                    {stats.data.summary.wallets.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Stellar Wallets
                  </span>
                </div>

                {/* Escrows card */}
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.lock} size="lg" />
                  </div>
                  <span className="text-3xl font-bold text-text-primary tracking-tight">
                    {stats.data.summary.escrows.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Escrows Created
                  </span>
                </div>

                {/* Transactions card */}
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.refresh} size="lg" />
                  </div>
                  <span className="text-3xl font-bold text-text-primary tracking-tight">
                    {stats.data.summary.transactions.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    On-chain Transactions
                  </span>
                </div>
              </div>

              <WalletsTable
                wallets={stats.data.recentWallets}
                totalWallets={stats.data.summary.wallets}
                isLoadingMore={stats.isLoadingMore}
                onShowMore={() => setWalletsLimit((previous) => previous + 10)}
              />

              <EscrowsTable
                escrows={stats.data.recentEscrows}
                totalEscrows={stats.data.summary.escrows}
                isLoadingMore={stats.isLoadingMore}
                onShowMore={() => setEscrowsLimit((previous) => previous + 10)}
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
