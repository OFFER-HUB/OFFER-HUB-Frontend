"use client";

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
import { ActionButton, Badge } from "./ui";

const SKELETON_BLOCK = "rounded-2xl bg-white shadow-[var(--shadow-neumorphic-light)]";

function DemoSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      <div className={`h-24 ${SKELETON_BLOCK}`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`h-72 lg:col-span-2 ${SKELETON_BLOCK}`} />
        <div className={`h-72 ${SKELETON_BLOCK}`} />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className={`h-64 ${SKELETON_BLOCK}`} />
        ))}
      </div>
    </div>
  );
}

function DemoError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <Icon path={ICON_PATHS.alertCircle} size="xl" className="mx-auto text-text-secondary mb-4" />
      <h2 className="text-xl font-bold text-text-primary mb-2">Workspace unavailable</h2>
      <p className="text-text-secondary mb-6">{message}</p>
      <ActionButton variant="soft" iconPath={ICON_PATHS.refresh} onClick={onRetry}>
        Try again
      </ActionButton>
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
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="pb-2">
          <Badge tone="primary" iconPath={ICON_PATHS.lock}>
            Optional sealed proposals
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary mt-4 sm:text-4xl">
            Sub Rosa <span className="text-primary">on OFFER HUB</span>
          </h1>
          <p className="text-base text-text-secondary mt-3 max-w-3xl leading-relaxed">
            Freelancers submit privately, everything is revealed together at a shared deadline, and
            only then does the client compare and pick. Modelled on Sub Rosa&apos;s{" "}
            <span className="font-semibold text-text-primary">{SUBROSA_TEMPLATE}</span> template,
            which never takes custody of funds.
          </p>
        </header>

        <DemoBanner />

        {isLoading ? (
          <DemoSkeleton />
        ) : error !== null && round === null ? (
          <DemoError message={error} onRetry={reset} />
        ) : round === null ? null : (
          <>
            <section
              aria-label="Round progress"
              className="rounded-2xl bg-white px-4 py-5 sm:px-8 sm:py-6 shadow-[var(--shadow-neumorphic-light)]"
            >
              <RoundTimeline phase={round.phase} />
            </section>

            {error !== null ? (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl bg-error/10 px-4 py-3 text-sm font-medium text-error"
              >
                <Icon path={ICON_PATHS.alertTriangle} size="sm" className="shrink-0 mt-px" />
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 min-w-0">
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
                pendingAction={pendingAction}
                onReachDeadline={reachDeadline}
                onReveal={revealProposals}
                onReset={reset}
              />
            </div>

            <div className="pt-4">
              <SealedProposalList
                proposals={round.proposals}
                phase={round.phase}
                selectedProposalId={round.selectedProposalId}
                isBusy={isBusy}
                isSelecting={pendingAction === "select"}
                onSelect={selectProvider}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4 lg:grid-cols-3">
              <div className="lg:col-span-2 min-w-0">
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
