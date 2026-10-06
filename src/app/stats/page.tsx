"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/landing";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EscrowsTable } from "@/components/stats/EscrowsTable";
import { WalletsTable } from "@/components/stats/WalletsTable";
import { getPlatformStats, type PlatformStatsResponse } from "@/lib/api/stats";

export default function PlatformStatsPage(): React.JSX.Element {
  const [data, setData] = useState<PlatformStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletsLimit, setWalletsLimit] = useState(5);
  const [escrowsLimit, setEscrowsLimit] = useState(5);
  const hasLoaded = useRef(false);

  useEffect(() => {
    let active = true;
    setIsLoading(!hasLoaded.current);
    setIsLoadingMore(hasLoaded.current);
    setError(null);

    async function loadStats(): Promise<void> {
      try {
        const stats = await getPlatformStats(walletsLimit, escrowsLimit);
        if (active) {
          setData(stats);
          hasLoaded.current = true;
        }
      } catch (loadError) {
        if (active) {
          console.error("Failed to load platform stats:", loadError);
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load platform stats."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    void loadStats();
    return () => {
      active = false;
    };
  }, [walletsLimit, escrowsLimit]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 animate-fade-in-up">
              Platform Stats
            </h1>
            <p
              className="text-text-secondary max-w-2xl mx-auto text-base animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              Real-time insights and transparent key metrics showcasing user registration, secure
              wallet generation, and transaction volume.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <LoadingSpinner size="lg" className="text-primary" />
              <p className="text-sm text-text-secondary animate-pulse">
                Syncing platform metrics...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-white text-center shadow-[var(--shadow-neumorphic-light)] max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                <Icon path={ICON_PATHS.alertCircle} size="md" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Error Syncing Metrics</h3>
              <p className="text-sm text-text-secondary mb-6">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl font-medium bg-primary text-white shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all duration-200 cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : data ? (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.users} size="lg" />
                  </div>
                  <span className="text-3xl font-bold text-text-primary tracking-tight">
                    {data.summary.users.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Registered Users
                  </span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.creditCard} size="lg" />
                  </div>
                  <span className="text-3xl font-bold text-text-primary tracking-tight">
                    {data.summary.wallets.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Stellar Wallets
                  </span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.lock} size="lg" />
                  </div>
                  <span className="text-3xl font-bold text-text-primary tracking-tight">
                    {data.summary.escrows.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Escrows Created
                  </span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.refresh} size="lg" />
                  </div>
                  <span className="text-3xl font-bold text-text-primary tracking-tight">
                    {data.summary.transactions.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    On-chain Transactions
                  </span>
                </div>
              </div>

              <WalletsTable
                wallets={data.recentWallets}
                totalWallets={data.summary.wallets}
                isLoadingMore={isLoadingMore}
                onLoadMore={() => setWalletsLimit((limit) => limit + 10)}
              />
              <EscrowsTable
                escrows={data.recentEscrows ?? []}
                totalEscrows={data.summary.escrows}
                isLoadingMore={isLoadingMore}
                onLoadMore={() => setEscrowsLimit((limit) => limit + 10)}
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
