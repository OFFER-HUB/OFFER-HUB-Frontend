"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import type { PublicValidationResults } from "@/types/stats.types";

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
            Published {formatTimestamp(data.publishedAt)}
            {fetchedAt && <> · Last refreshed {formatTimestamp(fetchedAt)}</>}
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
              const stellarUrl = getSafeExternalUrl(run.stellarExpertUrl, "stellar.expert");
              const blindPayUrl = getSafeExternalUrl(run.blindPayReceiptUrl, "app.blindpay.com");

              return (
                <article
                  key={run.id}
                  className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text-primary">{run.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                      <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                        {run.status}
                      </span>
                      <time dateTime={run.completedAt}>{formatTimestamp(run.completedAt)}</time>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {stellarUrl && (
                      <a
                        href={stellarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl px-2 py-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
                      >
                        Stellar Expert
                      </a>
                    )}
                    {blindPayUrl && (
                      <a
                        href={blindPayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl px-2 py-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary-hover"
                      >
                        BlindPay receipt
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
