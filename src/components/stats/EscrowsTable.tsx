"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { RecentEscrow } from "@/types/stats.types";

interface EscrowsTableProps {
  escrows: RecentEscrow[];
  totalEscrows: number;
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

function getEscrowStatusBadge(status: string): string {
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
}

export function EscrowsTable({
  escrows,
  totalEscrows,
  isLoadingMore,
  onShowMore,
}: EscrowsTableProps): React.JSX.Element {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(contractId: string, id: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(contractId);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy escrow contract ID:", error);
    }
  }

  return (
    <section className="space-y-6 rounded-3xl bg-white p-8 shadow-[var(--shadow-neumorphic-light)]">
      <div className="border-b border-border-light pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
          <Icon path={ICON_PATHS.lock} size="md" className="text-primary" />
          Recent Generated Escrows
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Smart contract-backed escrow accounts holding project funds securely on the Stellar
          blockchain.
        </p>
      </div>

      {escrows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border-light bg-background py-12 text-center">
          <p className="text-sm text-text-secondary">
            No escrow accounts have been initialized yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-border-light">
            <table className="w-full border-collapse bg-white text-left">
              <thead>
                <tr className="border-b border-border-light bg-background text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-4">Contract / Escrow ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Created</th>
                  <th className="px-6 py-4 text-right">Blockchain Explorer</th>
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
                      className="border-b border-border-light transition-colors last:border-0 hover:bg-background/20"
                    >
                      <td className="select-all px-6 py-4 font-mono text-sm text-text-primary">
                        <div className="flex flex-col items-start justify-start gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-text-secondary">Escrow:</span>
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
                                className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-primary active:scale-95"
                                title="Copy contract ID"
                                aria-label="Copy escrow contract ID"
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
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                        ${Number.parseFloat(escrow.amount).toFixed(2)} USDC
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-xs font-bold",
                            getEscrowStatusBadge(escrow.status)
                          )}
                        >
                          {escrow.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-text-secondary">
                        {formatDate(escrow.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {contractId ? (
                          <a
                            href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-background px-4 py-2 text-xs font-bold text-primary shadow-[var(--shadow-neumorphic-light)] transition-all duration-200 hover:shadow-[var(--shadow-neumorphic-inset-light)] active:scale-95"
                          >
                            <span>View Ledger</span>
                            <Icon path={ICON_PATHS.externalLink} size="sm" />
                          </a>
                        ) : (
                          <span className="text-xs italic text-text-secondary">Pending Contract</span>
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
