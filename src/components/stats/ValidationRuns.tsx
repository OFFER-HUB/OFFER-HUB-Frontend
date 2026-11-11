"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { explorerUrl } from "@/lib/explorer";
import type { PublicValidationResults, PublicValidationRun, ValidationReceipt } from "@/types/stats.types";

interface ValidationRunsProps {
  data: PublicValidationResults | null;
  error: string | null;
  fetchedAt: string | null;
  isLoading: boolean;
  onRetry: () => void;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unavailable"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const linkClass =
  "rounded-xl px-2 py-1 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary-hover";

function humanizeStep(name: string): string {
  return name.replace(/_/g, " ");
}

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

/** BlindPay amounts are minor units (2 decimals for every LATAM corridor currency). */
function formatFiat(receipt: ValidationReceipt): string {
  const amount = receipt.receiverAmountMinor / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: receipt.currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${receipt.currency}`;
  }
}

/** One link per transaction, labelled by the step that submitted it (same order as stellarExpertUrls). */
function transactionLinks(run: PublicValidationRun): Array<{ label: string; url: string }> {
  const labels = run.steps.flatMap((step) =>
    step.txHashes.map((_, i) => (step.txHashes.length > 1 ? `${humanizeStep(step.name)} ${i + 1}` : humanizeStep(step.name)))
  );
  return run.stellarExpertUrls.flatMap((value, i) => {
    const url = getSafeExternalUrl(value, "stellar.expert");
    return url ? [{ label: labels[i] ?? `transaction ${i + 1}`, url }] : [];
  });
}

/** Corridors with a passed run whose disbursement BlindPay itself confirmed. */
function verifiedCorridors(runs: PublicValidationRun[]): string[] {
  return [...new Set(runs.filter((r) => r.status === "passed" && r.receipt).map((r) => r.corridor))].sort();
}

function getSafeExternalUrl(value: string | null, hostname: string): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === hostname ? url.toString() : null;
  } catch {
    return null;
  }
}

export function ValidationRuns({
  data,
  error,
  fetchedAt,
  isLoading,
  onRetry,
}: ValidationRunsProps): React.JSX.Element {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[var(--shadow-neumorphic-light)] sm:p-8">
      <div className="mb-6 border-b border-border-light pb-4">
        <h2 className="text-xl font-bold text-text-primary">Published validation results</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Recent platform validation runs with links to their on-chain and payout receipts.
        </p>
        {data && (
          <p className="mt-3 text-xs text-text-secondary">
            {data.runs[0] ? <>Last published {formatTimestamp(data.runs[0].publishedAt)}</> : <>No runs published yet</>}
            {fetchedAt && <> · Last refreshed {formatTimestamp(fetchedAt)}</>}
            {data.total > data.runs.length && <> · Showing {data.runs.length} of {data.total}</>}
          </p>
        )}
        {data && verifiedCorridors(data.runs).length > 0 && (
          <p className="mt-2 text-sm font-semibold text-text-primary">
            Verified fiat corridors: {verifiedCorridors(data.runs).join(", ")}
          </p>
        )}
      </div>

      {isLoading && !data ? (
        <LoadingState variant="inline" message="Loading validation results..." />
      ) : error && !data ? (
        <ErrorState
          variant="inline"
          title="Unable to load validation results"
          message={error}
          onRetry={onRetry}
        />
      ) : data && data.runs.length === 0 ? (
        <EmptyState
          icon={ICON_PATHS.list}
          title="No validation runs published"
          message="Published validation runs will appear here."
        />
      ) : data ? (
        <div>
          {error && (
            <p role="status" className="mb-4 text-sm text-warning">
              Refresh failed: {error}. Showing the last published results.
            </p>
          )}
          <div className="divide-y divide-border-light">
            {data.runs.map((run) => {
              const txLinks = transactionLinks(run);
              const contractUrl = getSafeExternalUrl(run.stellarExpertContractUrl, "stellar.expert");
              const failedStep = run.steps.find((step) => step.status === "failed");
              const receipt = run.receipt;
              const receiptTxUrl =
                receipt?.stellarTxHash && /^[0-9a-f]{64}$/.test(receipt.stellarTxHash)
                  ? explorerUrl("tx", receipt.stellarTxHash, run.network === "mainnet" ? "public" : "testnet")
                  : null;

              return (
                <article key={run.id} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-text-primary">
                      {run.corridor} corridor · {run.network}
                    </h3>
                    <span
                      className={
                        "rounded-full bg-background px-3 py-1 text-xs font-semibold shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] " +
                        (run.status === "passed" ? "text-success" : "text-error")
                      }
                    >
                      {run.status}
                    </span>
                    <span className="text-sm text-text-secondary">
                      <time dateTime={run.finishedAt}>{formatTimestamp(run.finishedAt)}</time> · {formatDuration(run.durationMs)}
                    </span>
                  </div>

                  {failedStep && (
                    <p className="text-sm text-error">
                      Failed at {humanizeStep(failedStep.name)}
                      {failedStep.error ? `: ${failedStep.error}` : ""}
                    </p>
                  )}

                  {receipt ? (
                    <p className="text-sm text-text-secondary">
                      BlindPay payout <span className="font-mono">{receipt.blindpayPayoutId}</span> completed:{" "}
                      <span className="font-semibold text-text-primary">{formatFiat(receipt)}</span>
                      {receipt.paymentProvider && <> via {receipt.paymentProvider}</>} on{" "}
                      <time dateTime={receipt.completedAt}>{formatTimestamp(receipt.completedAt)}</time>
                    </p>
                  ) : (
                    run.blindpayPayoutId && (
                      <p className="text-sm text-text-secondary">
                        BlindPay payout <span className="font-mono">{run.blindpayPayoutId}</span>: not verified
                      </p>
                    )
                  )}

                  {(txLinks.length > 0 || contractUrl || receiptTxUrl) && (
                    <div className="flex flex-wrap gap-2">
                      {contractUrl && (
                        <a href={contractUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          Escrow contract
                        </a>
                      )}
                      {txLinks.map((tx) => (
                        <a key={tx.url} href={tx.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {tx.label}
                        </a>
                      ))}
                      {receiptTxUrl && (
                        <a href={receiptTxUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          BlindPay deposit tx
                        </a>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
