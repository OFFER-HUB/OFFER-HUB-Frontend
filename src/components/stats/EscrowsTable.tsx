"use client";

import { useState } from "react";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { RecentEscrow } from "@/lib/api/stats";

interface EscrowsTableProps {
  escrows: RecentEscrow[];
  totalEscrows: number;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  CREATING: "bg-warning/10 text-warning border-warning/20",
  FUNDED: "bg-primary/10 text-primary border-primary/20",
  RELEASED: "bg-success/10 text-success border-success/20",
  REFUNDED: "bg-error/10 text-error border-error/20",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EscrowsTable({
  escrows,
  totalEscrows,
  isLoadingMore,
  onLoadMore,
}: EscrowsTableProps): React.JSX.Element {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(contractId: string, id: string): Promise<void> {
    await navigator.clipboard.writeText(contractId);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <section className="bg-white p-8 rounded-3xl shadow-[var(--shadow-neumorphic-light)] space-y-6">
      <header className="border-b border-border-light pb-4">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Icon path={ICON_PATHS.lock} size="md" className="text-primary" />
          Recent Generated Escrows
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Smart contract-backed escrow accounts holding project funds securely on the Stellar
          blockchain.
        </p>
      </header>

      {escrows.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-border-light rounded-2xl bg-background">
          <p className="text-sm text-text-secondary">
            No escrow accounts have been initialized yet.
          </p>
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
                {escrows.map((escrow) => {
                  const contractId = escrow.trustlessContractId;
                  const isCopied = copiedId === escrow.id;
                  const truncatedContract = contractId
                    ? `${contractId.slice(0, 10)}…${contractId.slice(-10)}`
                    : "Creating...";
                  const truncatedEscrowId = `${escrow.id.slice(0, 10)}…${escrow.id.slice(-10)}`;

                  return (
                    <tr
                      key={escrow.id}
                      className="border-b border-border-light hover:bg-background/20 transition-colors last:border-0"
                    >
                      <td className="py-4 px-6 font-mono text-sm text-text-primary select-all">
                        <div className="flex flex-col gap-1 justify-start items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-text-secondary">
                              Escrow:
                            </span>
                            <span>{truncatedEscrowId}</span>
                          </div>
                          {contractId && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-text-secondary">
                                Contract:
                              </span>
                              <span className="text-xs">{truncatedContract}</span>
                              <button
                                type="button"
                                onClick={() => void handleCopy(contractId, escrow.id)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-background transition-colors active:scale-95"
                                title="Copy contract ID"
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
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-text-primary">
                        ${Number.parseFloat(escrow.amount).toFixed(2)} USDC
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${STATUS_STYLES[escrow.status] ?? "bg-text-secondary/10 text-text-secondary border-text-secondary/20"}`}
                        >
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
                          <span className="text-xs text-text-secondary italic">
                            Pending Contract
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {escrows.length < totalEscrows && (
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
