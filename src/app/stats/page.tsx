"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { getPlatformStats, type PlatformStatsResponse } from "@/lib/api/stats";
import { cn } from "@/lib/cn";

export default function PlatformStatsPage(): React.JSX.Element {
  const [data, setData] = useState<PlatformStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [walletsLimit, setWalletsLimit] = useState(5);
  const [escrowsLimit, setEscrowsLimit] = useState(5);

  useEffect(() => {
    async function loadStats() {
      if (data) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      try {
        const stats = await getPlatformStats(walletsLimit, escrowsLimit);
        setData(stats);
      } catch (err) {
        console.error("Failed to load platform stats:", err);
        setError(err instanceof Error ? err.message : "Failed to load platform stats.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
    loadStats();
  }, [walletsLimit, escrowsLimit]);

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

  const getEscrowStatusBadge = (status: string) => {
    switch (status) {
      case "CREATING":
        return "bg-warning/10 text-warning border-warning/20";
      case "FUNDED":
        return "bg-primary/10 text-primary border-primary/20";
      case "RELEASED":
        return "bg-success/10 text-success border-success/20";
      case "REFUNDED":
        return "bg-error/10 text-error border-error/20";
      default:
        return "bg-text-secondary/10 text-text-secondary border-text-secondary/20";
    }
  };

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

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <LoadingSpinner size="lg" className="text-primary" />
              <p className="text-sm text-text-secondary animate-pulse">Syncing platform metrics...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-white text-center shadow-[var(--shadow-neumorphic-light)] max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                <Icon path={ICON_PATHS.alertCircle} size="md" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Error Syncing Metrics</h3>
              <p className="text-sm text-text-secondary mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl font-medium bg-primary text-white shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all duration-200 cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : data ? (
            <div className="space-y-10">
              {/* Metrics Grid using standard project design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users card */}
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

                {/* Wallets card */}
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

                {/* Escrows card */}
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

                {/* Transactions card */}
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

              {/* Recent Stellar Wallets Section (spacious container layout) */}
              <div className="bg-white p-8 rounded-3xl shadow-[var(--shadow-neumorphic-light)] space-y-6">
                <div className="border-b border-border-light pb-4">
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Icon path={ICON_PATHS.link} size="md" className="text-primary" />
                    Recent Generated Stellar Wallets
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Decentralized accounts dynamically compiled on-chain to handle secure payments, milestones, and dispute resolution.
                  </p>
                </div>

                {data.recentWallets.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-border-light rounded-2xl bg-background">
                    <p className="text-sm text-text-secondary">No Stellar wallets have been initialized yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-2xl border border-border-light">
                      <table className="w-full text-left border-collapse bg-white">
                        <thead>
                          <tr className="bg-background border-b border-border-light text-text-secondary text-xs uppercase tracking-wider font-semibold">
                            <th className="py-4 px-6">Wallet Address</th>
                            <th className="py-4 px-6">Date Created</th>
                            <th className="py-4 px-6 text-right">Blockchain Explorer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.recentWallets.map((wallet) => {
                            const truncatedKey = `${wallet.publicKey.slice(0, 10)}…${wallet.publicKey.slice(-10)}`;
                            const isCopied = copiedId === wallet.id;
                            return (
                              <tr key={wallet.id} className="border-b border-border-light hover:bg-background/20 transition-colors last:border-0">
                                <td className="py-4 px-6 font-mono text-sm text-text-primary select-all">
                                  <div className="flex items-center gap-2">
                                    <span>{truncatedKey}</span>
                                    <button
                                      onClick={() => handleCopy(wallet.publicKey, wallet.id)}
                                      className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-background transition-colors active:scale-95"
                                      title="Copy full address"
                                    >
                                      <Icon path={isCopied ? ICON_PATHS.check : ICON_PATHS.copy} size="sm" className={isCopied ? "text-success" : ""} />
                                    </button>
                                    {isCopied && (
                                      <span className="text-xs text-success font-semibold px-2 py-0.5 rounded bg-success/10 border border-success/20 animate-fade-in">
                                        Copied!
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-text-secondary font-medium">
                                  {formatDate(wallet.createdAt)}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <a
                                    href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-background text-primary border border-border-light shadow-[var(--shadow-neumorphic-light)] hover:shadow-[var(--shadow-neumorphic-inset-light)] active:scale-95 transition-all duration-200"
                                  >
                                    <span>View Ledger</span>
                                    <Icon path={ICON_PATHS.externalLink} size="sm" />
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {data.recentWallets.length < data.summary.wallets && (
                      <div className="flex justify-center pt-2">
                        <button
                          onClick={() => setWalletsLimit((prev) => prev + 10)}
                          disabled={isLoadingMore}
                          className="px-6 py-2.5 rounded-xl font-semibold bg-background text-primary border border-border-light shadow-[var(--shadow-neumorphic-light)] hover:shadow-[var(--shadow-neumorphic-inset-light)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                        >
                          {isLoadingMore ? "Loading..." : "Show More"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Generated Escrows Section */}
              <div className="bg-white p-8 rounded-3xl shadow-[var(--shadow-neumorphic-light)] space-y-6">
                <div className="border-b border-border-light pb-4">
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Icon path={ICON_PATHS.lock} size="md" className="text-primary" />
                    Recent Generated Escrows
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Smart contract-backed escrow accounts holding project funds securely on the Stellar blockchain.
                  </p>
                </div>

                {!data.recentEscrows || data.recentEscrows.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-border-light rounded-2xl bg-background">
                    <p className="text-sm text-text-secondary">No escrow accounts have been initialized yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-2xl border border-border-light">
                      <table className="w-full text-left border-collapse bg-white">
                        <thead>
                          <tr className="bg-background border-b border-border-light text-text-secondary text-xs uppercase tracking-wider font-semibold">
                            <th className="py-4 px-6">Contract / Escrow ID</th>
                            <th className="py-4 px-6">Amount</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6">Date Created</th>
                            <th className="py-4 px-6 text-right">Blockchain Explorer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.recentEscrows.map((escrow) => {
                            const contractId = escrow.trustlessContractId;
                            const isCopied = copiedId === escrow.id;
                            const truncatedContract = contractId
                              ? `${contractId.slice(0, 10)}…${contractId.slice(-10)}`
                              : `Creating...`;
                            const displayId = escrow.id;
                            const truncatedEscrowId = `${displayId.slice(0, 10)}…${displayId.slice(-10)}`;
                            
                            return (
                              <tr key={escrow.id} className="border-b border-border-light hover:bg-background/20 transition-colors last:border-0">
                                <td className="py-4 px-6 font-mono text-sm text-text-primary select-all">
                                  <div className="flex flex-col gap-1 justify-start items-start">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-text-secondary">Escrow:</span>
                                      <span>{truncatedEscrowId}</span>
                                    </div>
                                    {contractId && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-text-secondary">Contract:</span>
                                        <span className="text-xs">{truncatedContract}</span>
                                        <button
                                          onClick={() => handleCopy(contractId, escrow.id)}
                                          className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-background transition-colors active:scale-95"
                                          title="Copy contract ID"
                                        >
                                          <Icon path={isCopied ? ICON_PATHS.check : ICON_PATHS.copy} size="sm" className={isCopied ? "text-success" : ""} />
                                        </button>
                                        {isCopied && (
                                          <span className="text-xs text-success font-semibold px-2 py-0.5 rounded bg-success/10 border border-success/20 animate-fade-in">
                                            Copied!
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm font-semibold text-text-primary">
                                  ${parseFloat(escrow.amount).toFixed(2)} USDC
                                </td>
                                <td className="py-4 px-6 text-sm">
                                  <span className={cn("px-2.5 py-1 text-xs font-bold rounded-lg border", getEscrowStatusBadge(escrow.status))}>
                                    {escrow.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-text-secondary font-medium">
                                  {formatDate(escrow.createdAt)}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  {contractId ? (
                                    <a
                                      href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-background text-primary border border-border-light shadow-[var(--shadow-neumorphic-light)] hover:shadow-[var(--shadow-neumorphic-inset-light)] active:scale-95 transition-all duration-200"
                                    >
                                      <span>View Ledger</span>
                                      <Icon path={ICON_PATHS.externalLink} size="sm" />
                                    </a>
                                  ) : (
                                    <span className="text-xs text-text-secondary italic">Pending Contract</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {data.recentEscrows.length < data.summary.escrows && (
                      <div className="flex justify-center pt-2">
                        <button
                          onClick={() => setEscrowsLimit((prev) => prev + 10)}
                          disabled={isLoadingMore}
                          className="px-6 py-2.5 rounded-xl font-semibold bg-background text-primary border border-border-light shadow-[var(--shadow-neumorphic-light)] hover:shadow-[var(--shadow-neumorphic-inset-light)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                        >
                          {isLoadingMore ? "Loading..." : "Show More"}
                        </button>
                      </div>
                    )}
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
