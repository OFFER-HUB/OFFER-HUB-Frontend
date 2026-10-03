"use client";

import { useState } from "react";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { RecentWallet } from "@/lib/api/stats";

interface WalletsTableProps {
  wallets: RecentWallet[];
  totalWallets: number;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WalletsTable({
  wallets,
  totalWallets,
  isLoadingMore,
  onLoadMore,
}: WalletsTableProps): React.JSX.Element {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(publicKey: string, id: string): Promise<void> {
    await navigator.clipboard.writeText(publicKey);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <section className="bg-white p-8 rounded-3xl shadow-[var(--shadow-neumorphic-light)] space-y-6">
      <header className="border-b border-border-light pb-4">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Icon path={ICON_PATHS.link} size="md" className="text-primary" />
          Recent Generated Stellar Wallets
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Decentralized accounts dynamically compiled on-chain to handle secure payments,
          milestones, and dispute resolution.
        </p>
      </header>

      {wallets.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-border-light rounded-2xl bg-background">
          <p className="text-sm text-text-secondary">
            No Stellar wallets have been initialized yet.
          </p>
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
                {wallets.map((wallet) => {
                  const truncatedKey = `${wallet.publicKey.slice(0, 10)}…${wallet.publicKey.slice(-10)}`;
                  const isCopied = copiedId === wallet.id;
                  return (
                    <tr
                      key={wallet.id}
                      className="border-b border-border-light hover:bg-background/20 transition-colors last:border-0"
                    >
                      <td className="py-4 px-6 font-mono text-sm text-text-primary select-all">
                        <div className="flex items-center gap-2">
                          <span>{truncatedKey}</span>
                          <button
                            type="button"
                            onClick={() => void handleCopy(wallet.publicKey, wallet.id)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-background transition-colors active:scale-95"
                            title="Copy full address"
                          >
                            <Icon
                              path={isCopied ? ICON_PATHS.check : ICON_PATHS.copy}
                              size="sm"
                              className={isCopied ? "text-success" : ""}
                            />
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
          {wallets.length < totalWallets && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-xl font-semibold bg-background text-primary border border-border-light shadow-[var(--shadow-neumorphic-light)] hover:shadow-[var(--shadow-neumorphic-inset-light)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {isLoadingMore ? "Loading..." : "Show More"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
