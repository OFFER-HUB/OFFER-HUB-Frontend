"use client";

import { useState } from "react";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ProposalCard } from "./ProposalCard";
import { Badge } from "./ui";
import type { RoundPhase, SealedProposal } from "../sub-rosa.types";

interface SealedProposalListProps {
  proposals: SealedProposal[];
  phase: RoundPhase;
  selectedProposalId: string | null;
  isBusy: boolean;
  isSelecting: boolean;
  onSelect: (proposalId: string) => void;
}

function ListHeader({ phase, count }: { phase: RoundPhase; count: number }): React.JSX.Element {
  const isSealed = phase === "collecting" || phase === "deadline_reached";

  return (
    <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Proposals</h2>
        <p className="text-sm text-text-secondary mt-1">
          {isSealed
            ? "Only the number of proposals is public before the deadline."
            : "Every proposal was opened at the same moment."}
        </p>
      </div>
      <Badge
        tone={isSealed ? "neutral" : "primary"}
        iconPath={isSealed ? ICON_PATHS.lock : ICON_PATHS.eye}
        className="self-start sm:self-auto"
      >
        {count} {isSealed ? "sealed" : "revealed"}
      </Badge>
    </div>
  );
}

export function SealedProposalList({
  proposals,
  phase,
  selectedProposalId,
  isBusy,
  isSelecting,
  onSelect,
}: SealedProposalListProps): React.JSX.Element {
  // Which card triggered the in-flight selection, so only that one spins.
  const [clickedId, setClickedId] = useState<string | null>(null);

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12 px-6 rounded-2xl bg-background shadow-[var(--shadow-neumorphic-inset-light)]">
        <Icon path={ICON_PATHS.document} size="xl" className="text-text-secondary mb-3" />
        <p className="text-sm font-semibold text-text-primary">No proposals yet</p>
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
    <section aria-label="Proposals">
      <ListHeader phase={phase} count={proposals.length} />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            isSelected={proposal.id === selectedProposalId}
            isPassedOver={selectedProposalId !== null && proposal.id !== selectedProposalId}
            canSelect={canSelect}
            isBusy={isBusy}
            isSelecting={isSelecting && clickedId === proposal.id}
            onSelect={(id) => {
              setClickedId(id);
              onSelect(id);
            }}
          />
        ))}
      </div>
    </section>
  );
}
