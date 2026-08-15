"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { SealedProposal } from "../sub-rosa.types";

interface ProposalCardProps {
  proposal: SealedProposal;
  isSelected: boolean;
  canSelect: boolean;
  isBusy: boolean;
  onSelect: (proposalId: string) => void;
}

/** The fields a provider fills in, listed by name while the content is sealed. */
const PRIVATE_FIELDS = [
  "Provider",
  "Proposed price",
  "Delivery time",
  "Approach",
  "Experience",
  "Milestones",
] as const;

interface DetailProps {
  label: string;
  children: React.ReactNode;
}

function Detail({ label, children }: DetailProps): React.JSX.Element {
  return (
    <div>
      <dt className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-text-primary mt-1 leading-relaxed">{children}</dd>
    </div>
  );
}

function SealedBody(): React.JSX.Element {
  return (
    <div
      className={cn(
        "mt-4 p-4 rounded-xl",
        "bg-background shadow-[var(--shadow-neumorphic-inset-light)]"
      )}
    >
      <p className="text-xs font-medium text-text-secondary mb-3">
        Hidden until the shared deadline
      </p>
      <ul className="flex flex-wrap gap-2">
        {PRIVATE_FIELDS.map((field) => (
          <li
            key={field}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-text-secondary",
              // Raised chips inside the sunken well — the locked fields read as
              // objects sitting in the recess rather than painted onto it.
              "bg-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
            )}
          >
            <Icon path={ICON_PATHS.lock} size="sm" className="w-3 h-3" />
            {field}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProposalCard({
  proposal,
  isSelected,
  canSelect,
  isBusy,
  onSelect,
}: ProposalCardProps): React.JSX.Element {
  const { content } = proposal;

  return (
    <Card
      padding="md"
      className={cn(
        "transition-shadow duration-200",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">
            {content ? content.providerName : proposal.label}
          </h3>
          {content ? (
            <p className="text-xs text-text-secondary mt-0.5">{proposal.label}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-xs font-medium",
            "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            proposal.isRevealed ? "text-primary" : "text-secondary"
          )}
        >
          <Icon
            path={proposal.isRevealed ? ICON_PATHS.eye : ICON_PATHS.lock}
            size="sm"
            className="w-3 h-3"
          />
          {proposal.isRevealed ? "Revealed" : "Sealed"}
        </span>
      </div>

      {content ? (
        <>
          <dl className="grid grid-cols-2 gap-4 mt-4">
            <Detail label="Price">{content.price}</Detail>
            <Detail label="Delivery">{content.timelineDays} days</Detail>
          </dl>
          <dl className="grid grid-cols-1 gap-4 mt-4">
            <Detail label="Approach">{content.approach}</Detail>
            <Detail label="Experience">{content.experience}</Detail>
            <Detail label="Milestones">{content.milestones}</Detail>
          </dl>
        </>
      ) : (
        <SealedBody />
      )}

      <div className="mt-5">
        {isSelected ? (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Icon path={ICON_PATHS.check} size="sm" />
            Selected provider
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!canSelect || isBusy}
            onClick={() => onSelect(proposal.id)}
          >
            {proposal.isRevealed ? "Select provider" : "Select provider (after reveal)"}
          </Button>
        )}
      </div>
    </Card>
  );
}
