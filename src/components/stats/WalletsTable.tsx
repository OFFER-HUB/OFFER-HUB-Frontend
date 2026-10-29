"use client";

import { useState } from "react";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { RecentWallet } from "@/lib/api/stats";

interface WalletsTableProps {
  wallets: RecentWallet[];
  totalWallets: number;
  isLoadingMore: boolean;
  onShowMore: () => void;
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
  onShowMore,
}: WalletsTableProps): React.JSX.Element {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(publicKey: string, id: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy wallet address:", error);
    }
  }

  return (
    <section className="space-y-6 rounded-3xl bg-white p-8 shadow-[var(--shadow-neumorphic-light)]">
      <div className="border-b border-border-light pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
          <Icon path={ICON_PATHS.link} size="md" className="text-primary" />
          Recent Generated Stellar Wallets
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Decentralized accounts dynamically compiled on-chain to handle secure payments,
          milestones, and dispute resolution.
        </p>
      </div>

      {wallets.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border-light bg-background py-12 text-center">
          <p className="text-sm text-text-secondary">No Stellar wallets have been initialized yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-border-light">
            <table className="w-full border-collapse bg-white text-left">
              <thead>
                <tr className="border-b border-border-light bg-background text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-4">Wallet Address</th>
                  <th className="px-6 py-4">Date Created</th>
                  <th className="px-6 py-4 text-right">Blockchain Explorer</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => {
                  const truncatedKey = `${wallet.publicKey.slice(0, 10)}…${wallet.publicKey.slice(-10)}`;
                  const isCopied = copiedId === wallet.id;

                  return (
                    <tr
                      key={wallet.id}
                      className="border-b border-border-light transition-colors last:border-0 hover:bg-background/20"
                    >
                      <td className="select-all px-6 py-4 font-mono text-sm text-text-primary">
                        <div className="flex items-center gap-2">
                          <span>{truncatedKey}</span>
                          <button
                            type="button"
                            onClick={() => void handleCopy(wallet.publicKey, wallet.id)}
                            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-primary active:scale-95"
                            title="Copy full address"
                            aria-label="Copy full wallet address"
                          >
                            <Icon
                              path={isCopied ? ICON_PATHS.check : ICON_PATHS.copy}
                              size="sm"
                              className={isCopied ? "text-success" : ""}
                            />
                          </button>
                          {isCopied && (
                            <span
                              role="status"
                              className="animate-fade-in rounded border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success"
                            >
                              Copied!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-text-secondary">
                        {formatDate(wallet.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-background px-4 py-2 text-xs font-bold text-primary shadow-[var(--shadow-neumorphic-light)] transition-all duration-200 hover:shadow-[var(--shadow-neumorphic-inset-light)] active:scale-95"
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
                onClick={onShowMore}
                disabled={isLoadingMore}
                className="cursor-pointer rounded-xl border border-border-light bg-background px-6 py-2.5 font-semibold text-primary shadow-[var(--shadow-neumorphic-light)] transition-all duration-200 hover:shadow-[var(--shadow-neumorphic-inset-light)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
