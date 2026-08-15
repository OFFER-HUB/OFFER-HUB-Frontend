"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ProposalCard } from "./ProposalCard";
import type { RoundPhase, SealedProposal } from "../sub-rosa.types";

interface SealedProposalListProps {
  proposals: SealedProposal[];
  phase: RoundPhase;
  selectedProposalId: string | null;
  isBusy: boolean;
  onSelect: (proposalId: string) => void;
}

function ListHeader({ phase, count }: { phase: RoundPhase; count: number }): React.JSX.Element {
  const isSealed = phase === "collecting" || phase === "deadline_reached";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <h2 className="text-lg font-bold text-text-primary">Proposals</h2>
      <p className="inline-flex items-center gap-2 text-xs text-text-secondary">
        <Icon path={isSealed ? ICON_PATHS.lock : ICON_PATHS.eye} size="sm" className="w-3.5 h-3.5" />
        {isSealed
          ? `${count} sealed — only the count is public before the deadline`
          : `${count} revealed together at the shared deadline`}
      </p>
    </div>
  );
}

export function SealedProposalList({
  proposals,
  phase,
  selectedProposalId,
  isBusy,
  onSelect,
}: SealedProposalListProps): React.JSX.Element {
  if (proposals.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center text-center py-12 px-6 rounded-2xl",
          "bg-background shadow-[var(--shadow-neumorphic-inset-light)]"
        )}
      >
        <Icon path={ICON_PATHS.document} size="xl" className="text-text-secondary mb-3" />
        <p className="text-sm font-medium text-text-primary">No proposals yet</p>
        <p className="text-sm text-text-secondary mt-1">
          Sealed proposals appear here as providers commit them.
        </p>
      </div>
    );
  }

  // Selection is a business decision the client makes after comparing the full
  // set, so it only unlocks once every proposal is on the table.
  const canSelect = phase === "revealed";

  return (
    <section>
      <ListHeader phase={phase} count={proposals.length} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            isSelected={proposal.id === selectedProposalId}
            canSelect={canSelect}
            isBusy={isBusy}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
