"use client";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useSealedRound } from "../hooks/use-sealed-round";
import { SUBROSA_TEMPLATE } from "../sub-rosa.constants";
import { BoundaryPanel } from "./BoundaryPanel";
import { DemoBanner } from "./DemoBanner";
import { EvidencePanel } from "./EvidencePanel";
import { JobCard } from "./JobCard";
import { RoundControls } from "./RoundControls";
import { RoundTimeline } from "./RoundTimeline";
import { SealedProposalList } from "./SealedProposalList";

function DemoSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden>
      <div className="h-32 rounded-2xl bg-white shadow-[var(--shadow-neumorphic-light)]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-64 rounded-2xl bg-white shadow-[var(--shadow-neumorphic-light)] lg:col-span-2" />
        <div className="h-64 rounded-2xl bg-white shadow-[var(--shadow-neumorphic-light)]" />
      </div>
    </div>
  );
}

interface DemoErrorProps {
  message: string;
  onRetry: () => void;
}

function DemoError({ message, onRetry }: DemoErrorProps): React.JSX.Element {
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <Icon
        path={ICON_PATHS.alertCircle}
        size="xl"
        className="mx-auto text-text-secondary mb-4"
      />
      <h2 className="text-xl font-bold text-text-primary mb-2">Workspace unavailable</h2>
      <p className="text-text-secondary mb-6">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

/**
 * Root of the Sub Rosa sealed-proposal walkthrough.
 *
 * Everything under `src/features/sub-rosa` is self-contained: no store, no
 * service, no shared type of the product domain is touched, and the feature
 * adds no dependency to package.json.
 */
export function SubRosaDemo(): React.JSX.Element {
  const {
    round,
    isLoading,
    error,
    pendingAction,
    revealedCount,
    reachDeadline,
    revealProposals,
    selectProvider,
    reset,
  } = useSealedRound();

  const isBusy = pendingAction !== null;

  const selectedProviderName =
    round?.proposals.find((proposal) => proposal.id === round.selectedProposalId)?.content
      ?.providerName ?? null;

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
              "bg-background text-secondary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.lock} size="sm" className="w-3.5 h-3.5" />
            Optional sealed proposals
          </span>
          <h1 className="text-3xl font-bold text-text-primary mt-3">
            Sub Rosa on OFFER HUB
          </h1>
          <p className="text-text-secondary mt-2 max-w-3xl leading-relaxed">
            A walkthrough of what an optional sealed-proposal round would look like: freelancers
            submit privately, everything is revealed together at a shared deadline, and only then
            does the client compare and pick. Modelled on Sub Rosa&apos;s {SUBROSA_TEMPLATE}{" "}
            template, which never takes custody of funds.
          </p>
        </header>

        <DemoBanner />

        {isLoading ? (
          <DemoSkeleton />
        ) : error !== null && round === null ? (
          <DemoError message={error} onRetry={reset} />
        ) : round === null ? null : (
          <>
            <div
              className={cn(
                "p-4 mb-6 rounded-2xl bg-white overflow-x-auto",
                "shadow-[var(--shadow-neumorphic-light)]"
              )}
            >
              <RoundTimeline phase={round.phase} />
            </div>

            {error !== null ? (
              <div className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm" role="alert">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <JobCard
                  job={round.job}
                  phase={round.phase}
                  proposalCount={round.proposals.length}
                  selectedProviderName={selectedProviderName}
                />
              </div>
              <RoundControls
                phase={round.phase}
                revealedCount={revealedCount}
                totalCount={round.proposals.length}
                isBusy={isBusy}
                onReachDeadline={reachDeadline}
                onReveal={revealProposals}
                onReset={reset}
              />
            </div>

            <div className="mb-4">
              <SealedProposalList
                proposals={round.proposals}
                phase={round.phase}
                selectedProposalId={round.selectedProposalId}
                isBusy={isBusy}
                onSelect={selectProvider}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BoundaryPanel />
              </div>
              <EvidencePanel
                round={round}
                revealedCount={revealedCount}
                selectedProviderName={selectedProviderName}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
