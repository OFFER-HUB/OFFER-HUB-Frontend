"use client";

import { Navbar } from "@/components/landing";
import { EscrowsTable } from "@/components/stats/EscrowsTable";
import { PlatformStatsMetrics } from "@/components/stats/PlatformStatsMetrics";
import { WalletsTable } from "@/components/stats/WalletsTable";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { usePlatformStats } from "@/hooks/usePlatformStats";

export default function PlatformStatsPage(): React.JSX.Element {
  const {
    data,
    error,
    isLoading,
    isLoadingMore,
    refresh,
    showMoreEscrows,
    showMoreWallets,
  } = usePlatformStats();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-4 animate-fade-in-up text-3xl font-bold text-text-primary sm:text-4xl">
              Platform Stats
            </h1>
            <p className="mx-auto max-w-2xl animate-fade-in-up text-base text-text-secondary">
              Real-time insights and transparent key metrics showcasing user registration, secure
              wallet generation, and transaction volume.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <LoadingSpinner size="lg" className="text-primary" />
              <p className="animate-pulse text-sm text-text-secondary">
                Syncing platform metrics...
              </p>
            </div>
          ) : error && !data ? (
            <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-[var(--shadow-neumorphic-light)]">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-error/10 text-error">
                <Icon path={ICON_PATHS.alertCircle} size="md" />
              </div>
              <h2 className="mb-2 text-lg font-bold text-text-primary">Error Syncing Metrics</h2>
              <p className="mb-6 text-sm text-text-secondary">{error}</p>
              <button
                type="button"
                onClick={refresh}
                className="cursor-pointer rounded-xl bg-primary px-6 py-2.5 font-medium text-white shadow-[var(--shadow-neumorphic-light)] transition-all duration-200 hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)]"
              >
                Retry Connection
              </button>
            </div>
          ) : data ? (
            <div className="space-y-10">
              {error && (
                <p role="status" className="text-center text-sm text-warning">
                  Refresh failed: {error}. Showing the last loaded metrics.
                </p>
              )}
              <PlatformStatsMetrics summary={data.summary} />
              <WalletsTable
                wallets={data.recentWallets}
                totalWallets={data.summary.wallets}
                isLoadingMore={isLoadingMore}
                onShowMore={showMoreWallets}
              />
              <EscrowsTable
                escrows={data.recentEscrows}
                totalEscrows={data.summary.escrows}
                isLoadingMore={isLoadingMore}
                onShowMore={showMoreEscrows}
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
