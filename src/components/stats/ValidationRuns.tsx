"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { explorerUrl } from "@/lib/explorer";
import type {
  PublicValidationResults,
  PublicValidationRun,
  ValidationReceipt,
  ValidationStep,
} from "@/types/stats.types";

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

function humanizeStep(name: string): string {
  return name.replace(/_/g, " ");
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))} ms`;
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

/**
 * A run with no payout step stops at the escrow release and never reaches BlindPay, so its
 * corridor is only a label for the program, not a bank payout.
 */
function isEscrowOnly(run: PublicValidationRun): boolean {
  return !run.steps.some((step) => step.name === "payout_transfer");
}

/**
 * A run that refused to start (the test wallet needs funds, say) moved nothing and tested nothing:
 * it is not a failure of the platform, so it is shown quietly instead of as an alarm.
 */
function neverStarted(run: PublicValidationRun): boolean {
  const first = run.steps[0];
  return first?.name === "preflight" && first.status === "failed";
}

function statusLabel(run: PublicValidationRun): string {
  if (run.status === "passed") return "passed";
  return neverStarted(run) ? "not started" : "did not pass";
}

/** Corridors with a passed run whose disbursement BlindPay itself confirmed. */
function verifiedCorridors(runs: PublicValidationRun[]): string[] {
  return [...new Set(runs.filter((r) => r.status === "passed" && r.receipt).map((r) => r.corridor))].sort();
}

function getSafeExternalUrl(value: string | null | undefined, hostname: string): string | null {
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

interface StepRow {
  step: ValidationStep;
  links: Array<{ label: string; url: string }>;
}

/** Every step with the Stellar Expert links of its own transactions (the API lists the URLs in step order). */
function stepRows(run: PublicValidationRun): StepRow[] {
  let next = 0;
  return run.steps.map((step) => {
    const links = step.txHashes.flatMap((_, i) => {
      const url = getSafeExternalUrl(run.stellarExpertUrls[next++], "stellar.expert");
      const label = step.txHashes.length > 1 ? `${humanizeStep(step.name)} ${i + 1}` : humanizeStep(step.name);
      return url ? [{ label, url }] : [];
    });
    return { step, links };
  });
}

const linkButtonClass =
  "inline-flex items-center gap-1.5 rounded-xl bg-background px-3 py-1.5 text-sm font-semibold text-primary " +
  "shadow-[var(--shadow-neumorphic-light)] transition-colors hover:text-primary-hover " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function ExternalIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
    </svg>
  );
}

function StatusIcon({ status }: { status: "passed" | "failed" | "skipped" | "idle" }): React.JSX.Element {
  const tone =
    status === "passed"
      ? "bg-success/10 text-success"
      : status === "failed"
        ? "bg-warning/10 text-warning"
        : "bg-background text-text-secondary";
  const path =
    status === "passed" ? "M5 13l4 4L19 7" : status === "failed" ? "M12 8v5m0 3.5h.01" : status === "idle" ? "M10 8v8M14 8v8" : "M6 12h12";
  return (
    <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </span>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  wide,
}: {
  label: string;
  value: string;
  hint?: string;
  wide?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={
        "rounded-xl bg-background p-4 shadow-[var(--shadow-neumorphic-inset-light)]" +
        (wide ? " col-span-2 sm:col-span-1" : "")
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}

function RunCard({ run, defaultOpen }: { run: PublicValidationRun; defaultOpen: boolean }): React.JSX.Element {
  const rows = stepRows(run);
  const contractUrl = getSafeExternalUrl(run.stellarExpertContractUrl, "stellar.expert");
  const failedStep = run.steps.find((step) => step.status === "failed");
  const escrowOnly = isEscrowOnly(run);
  const receipt = run.receipt;
  const receiptTxUrl =
    receipt?.stellarTxHash && /^[0-9a-f]{64}$/.test(receipt.stellarTxHash)
      ? explorerUrl("tx", receipt.stellarTxHash, run.network === "mainnet" ? "public" : "testnet")
      : null;
  const passed = run.status === "passed";
  const idle = neverStarted(run);
  const title = `${escrowOnly ? "Escrow flow" : `${run.corridor} corridor`} · ${run.network}`;

  return (
    <article className="rounded-2xl border border-border-light bg-white">
      <details open={defaultOpen} className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-start gap-x-4 gap-y-2 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-5 [&::-webkit-details-marker]:hidden">
          <StatusIcon status={passed ? "passed" : idle ? "idle" : "failed"} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-semibold text-text-primary">{title}</h3>
              <span
                className={
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                  (passed ? "bg-success/10 text-success" : idle ? "bg-background text-text-secondary" : "bg-warning/10 text-warning")
                }
              >
                {statusLabel(run)}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">
              <time dateTime={run.finishedAt}>{formatTimestamp(run.finishedAt)}</time> · {formatDuration(run.durationMs)} ·{" "}
              {run.trigger === "schedule" ? "Scheduled" : "Manual"}
            </p>
            {failedStep && (
              <span
                className={
                  "mt-2 block rounded-xl px-3 py-2 text-sm text-text-secondary " + (idle ? "bg-background" : "bg-warning/10")
                }
              >
                {idle ? "Not started" : `Failed at ${humanizeStep(failedStep.name)}`}
                {failedStep.error ? `: ${failedStep.error}` : ""}
              </span>
            )}
          </div>
          <svg
            aria-hidden="true"
            className="mt-1 h-5 w-5 shrink-0 text-text-secondary transition-transform group-open:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>

        <div className="flex flex-col gap-5 border-t border-border-light p-4 sm:p-5">
          <ol className="flex flex-col">
            {rows.map(({ step, links }, index) => (
              <li key={`${step.name}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                {index < rows.length - 1 && (
                  <span aria-hidden="true" className="absolute left-3.5 top-8 h-[calc(100%-1.75rem)] w-px bg-border-light" />
                )}
                <StatusIcon status={step.status} />
                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{capitalize(humanizeStep(step.name))}</p>
                    <p className="text-xs text-text-secondary">
                      {step.status === "skipped" ? "Skipped" : formatDuration(step.durationMs)}
                    </p>
                  </div>
                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.label}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary underline-offset-4 hover:text-primary-hover hover:underline"
                        >
                          {links.length > 1 ? `Tx ${links.indexOf(link) + 1}` : "Transaction"}
                          <ExternalIcon />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {receipt ? (
            <div className="rounded-xl bg-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Bank payout verified by BlindPay</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{formatFiat(receipt)}</p>
              <p className="mt-1 text-sm text-text-secondary">
                BlindPay payout <span className="font-mono">{receipt.blindpayPayoutId}</span> completed
                {receipt.paymentProvider && <> via {receipt.paymentProvider}</>} on{" "}
                <time dateTime={receipt.completedAt}>{formatTimestamp(receipt.completedAt)}</time>
              </p>
            </div>
          ) : (
            run.blindpayPayoutId && (
              <p className="text-sm text-text-secondary">
                BlindPay payout <span className="font-mono">{run.blindpayPayoutId}</span>: not verified
              </p>
            )
          )}

          {(contractUrl || receiptTxUrl) && (
            <div className="flex flex-wrap gap-3">
              {contractUrl && (
                <a href={contractUrl} target="_blank" rel="noopener noreferrer" className={linkButtonClass}>
                  Escrow contract
                  <ExternalIcon />
                </a>
              )}
              {receiptTxUrl && (
                <a href={receiptTxUrl} target="_blank" rel="noopener noreferrer" className={linkButtonClass}>
                  BlindPay deposit tx
                  <ExternalIcon />
                </a>
              )}
            </div>
          )}
        </div>
      </details>
    </article>
  );
}

export function ValidationRuns({
  data,
  error,
  fetchedAt,
  isLoading,
  onRetry,
}: ValidationRunsProps): React.JSX.Element {
  const runs = data?.runs ?? [];
  const startedRuns = runs.filter((run) => !neverStarted(run));
  const passedCount = startedRuns.filter((run) => run.status === "passed").length;
  const latest = runs[0];
  const hasEscrowOnly = runs.some(isEscrowOnly);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[var(--shadow-neumorphic-light)] sm:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-border-light pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Published validation results</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Recent platform validation runs with links to their on-chain and payout receipts.
            </p>
          </div>
          {latest && (
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold capitalize text-text-primary shadow-[var(--shadow-neumorphic-inset-light)]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
              {latest.network}
            </span>
          )}
        </div>

        {data && latest && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryTile label="Runs published" value={String(data.total)} />
            <SummaryTile label="Passed" value={`${passedCount} of ${startedRuns.length}`} hint="Among the runs that started" />
            <SummaryTile
              wide
              label="Latest run"
              value={latest.status === "passed" ? "Passed" : neverStarted(latest) ? "Not started" : "Did not pass"}
              hint={`${formatTimestamp(latest.finishedAt)} · ${formatDuration(latest.durationMs)}`}
            />
          </div>
        )}

        {data && (
          <p className="text-xs text-text-secondary">
            {data.runs[0] ? <>Last published {formatTimestamp(data.runs[0].publishedAt)}</> : <>No runs published yet</>}
            {fetchedAt && <> · Last refreshed {formatTimestamp(fetchedAt)}</>}
            {data.total > data.runs.length && <> · Showing {data.runs.length} of {data.total}</>}
          </p>
        )}
        {data && verifiedCorridors(data.runs).length > 0 && (
          <p className="text-sm font-semibold text-text-primary">
            Verified fiat corridors: {verifiedCorridors(data.runs).join(", ")}
          </p>
        )}
        {hasEscrowOnly && (
          <p className="rounded-xl bg-background px-4 py-3 text-sm text-text-secondary">
            An escrow flow run covers OfferHub&apos;s own flow: wallet sign-in, order, escrow create, fund and release,
            with every transaction confirmed through Stellar RPC. The bank payout is not part of these runs.
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
          <div className="flex flex-col gap-4">
            {data.runs.map((run, index) => (
              <RunCard key={run.id} run={run} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
