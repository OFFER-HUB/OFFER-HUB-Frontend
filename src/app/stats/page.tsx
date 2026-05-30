"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { getPlatformStats, type PlatformStatsResponse } from "@/lib/api/stats";
import { cn } from "@/lib/cn";

export default function PlatformStatsPage(): React.JSX.Element {
  const [data, setData] = useState<PlatformStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      setError(null);
      try {
        const stats = await getPlatformStats();
        setData(stats);
      } catch (err) {
        console.error("Failed to load platform stats:", err);
        setError(err instanceof Error ? err.message : "Failed to load platform statistics.");
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleCopy = (publicKey: string, id: string) => {
    navigator.clipboard.writeText(publicKey).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className={cn(
                "text-3xl sm:text-4xl font-bold text-text-primary mb-4 animate-fade-in-up"
              )}
            >
              Platform Statistics
            </h1>
            <p
              className={cn(
                "text-text-secondary max-w-2xl mx-auto animate-fade-in-up"
              )}
              style={{ animationDelay: "0.1s" }}
            >
              Live metrics showcasing platform growth, wallets generated with links, generated escrows, and on-chain transactions.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <LoadingSpinner size="xl" className="text-primary animate-spin" />
              <p className="text-sm text-text-secondary">Fetching real-time statistics...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-white text-center shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                <Icon path={ICON_PATHS.alertCircle} size="xl" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Error Loading Stats</h3>
              <p className="text-sm text-text-secondary mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:bg-primary-hover active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15)] transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          ) : data ? (
            <div className="space-y-12">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users card */}
                <div className="bg-white p-6 rounded-3xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.users} size="lg" />
                  </div>
                  <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {data.summary.users.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Registered Users
                  </span>
                </div>

                {/* Wallets card */}
                <div className="bg-white p-6 rounded-3xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.creditCard} size="lg" />
                  </div>
                  <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {data.summary.wallets.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Generated Stellar Wallets
                  </span>
                </div>

                {/* Escrows card */}
                <div className="bg-white p-6 rounded-3xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.lock} size="lg" />
                  </div>
                  <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {data.summary.escrows.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Escrows Created
                  </span>
                </div>

                {/* Transactions card */}
                <div className="bg-white p-6 rounded-3xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-info/10 text-primary flex items-center justify-center mb-4">
                    <Icon path={ICON_PATHS.refresh} size="lg" />
                  </div>
                  <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {data.summary.transactions.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-text-secondary mt-1">
                    Transactions Processed
                  </span>
                </div>
              </div>

              {/* Recent Stellar Wallets Section */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
                <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Icon path={ICON_PATHS.link} size="md" className="text-primary" />
                  Recent Generated Stellar Wallets
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Stellar accounts dynamically initialized on the blockchain network for secure platform payments.
                </p>

                {data.recentWallets.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-border-light rounded-2xl">
                    <p className="text-sm text-text-secondary">No wallets have been generated yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-light text-text-secondary text-sm font-semibold">
                          <th className="py-4 px-4">Wallet Public Key</th>
                          <th className="py-4 px-4">Generated At</th>
                          <th className="py-4 px-4 text-right">Blockchain Links</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentWallets.map((wallet) => {
                          const truncatedKey = `${wallet.publicKey.slice(0, 8)}…${wallet.publicKey.slice(-8)}`;
                          const isCopied = copiedId === wallet.id;
                          return (
                            <tr key={wallet.id} className="border-b border-border-light hover:bg-background/20 transition-colors">
                              <td className="py-4 px-4 font-mono text-sm text-text-primary select-all">
                                <div className="flex items-center gap-2">
                                  <span>{truncatedKey}</span>
                                  <button
                                    onClick={() => handleCopy(wallet.publicKey, wallet.id)}
                                    className="p-1 rounded text-text-secondary hover:text-primary hover:bg-background transition-colors"
                                    title="Copy full key"
                                  >
                                    <Icon path={isCopied ? ICON_PATHS.check : ICON_PATHS.copy} size="sm" className={isCopied ? "text-success" : ""} />
                                  </button>
                                  {isCopied && <span className="text-xs text-success font-semibold font-sans animate-fade-in">Copied!</span>}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-text-secondary">
                                {formatDate(wallet.createdAt)}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <a
                                  href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-background text-primary shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] transition-all duration-200"
                                >
                                  <span>Stellar Expert</span>
                                  <Icon path={ICON_PATHS.externalLink} size="sm" />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
