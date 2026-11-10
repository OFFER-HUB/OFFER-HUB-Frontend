"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { SealedProposal } from "../sub-rosa.types";
import { ActionButton, Badge } from "./ui";

interface ProposalCardProps {
  proposal: SealedProposal;
  isSelected: boolean;
  /** Another proposal already won the round. */
  isPassedOver: boolean;
  canSelect: boolean;
  isBusy: boolean;
  isSelecting: boolean;
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

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm text-text-primary mt-1 leading-relaxed break-words">{children}</dd>
    </div>
  );
}

function SealedBody(): React.JSX.Element {
  return (
    <div className="flex-1 rounded-xl bg-background p-4 shadow-[var(--shadow-neumorphic-inset-light)]">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
        Hidden until the shared deadline
      </p>
      <ul className="grid grid-cols-2 gap-2 mt-3">
        {PRIVATE_FIELDS.map((field) => (
          <li
            key={field}
            className="flex items-center gap-2 min-w-0 rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-text-secondary"
          >
            <Icon path={ICON_PATHS.lock} size="sm" className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{field}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadge({
  isRevealed,
  isSelected,
}: {
  isRevealed: boolean;
  isSelected: boolean;
}): React.JSX.Element {
  if (isSelected) {
    return (
      <Badge tone="success" iconPath={ICON_PATHS.checkCircle}>
        Selected
      </Badge>
    );
  }
  return isRevealed ? (
    <Badge tone="primary" iconPath={ICON_PATHS.eye}>
      Revealed
    </Badge>
  ) : (
    <Badge tone="neutral" iconPath={ICON_PATHS.lock}>
      Sealed
    </Badge>
  );
}

export function ProposalCard({
  proposal,
  isSelected,
  isPassedOver,
  canSelect,
  isBusy,
  isSelecting,
  onSelect,
}: ProposalCardProps): React.JSX.Element {
  const { content } = proposal;
  const title = content ? content.providerName : proposal.label;

  return (
    <article
      aria-label={title}
      className={cn(
        "flex flex-col h-full min-w-0 rounded-2xl bg-white p-5 sm:p-6",
        "shadow-[var(--shadow-neumorphic-light)] transition-[box-shadow,opacity] duration-300",
        isSelected && "ring-2 ring-success",
        isPassedOver && "opacity-70"
      )}
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-text-primary truncate">{title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {content ? proposal.label : "Contents encrypted"}
          </p>
        </div>
        <StatusBadge isRevealed={proposal.isRevealed} isSelected={isSelected} />
      </header>

      {content ? (
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-background px-4 py-3 shadow-[var(--shadow-neumorphic-inset-light)]">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Price
              </p>
              <p className="text-lg font-bold text-text-primary mt-0.5 tabular-nums">
                {content.price}
              </p>
            </div>
            <div className="rounded-xl bg-background px-4 py-3 shadow-[var(--shadow-neumorphic-inset-light)]">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Delivery
              </p>
              <p className="text-lg font-bold text-text-primary mt-0.5 tabular-nums">
                {content.timelineDays} days
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-4 mt-5">
            <Detail label="Approach">{content.approach}</Detail>
            <Detail label="Experience">{content.experience}</Detail>
            <Detail label="Milestones">{content.milestones}</Detail>
          </dl>
        </div>
      ) : (
        <SealedBody />
      )}

      <footer className="mt-5 pt-4 border-t border-border-light">
        {isSelected ? (
          <p className="flex items-center justify-center gap-2 h-11 text-sm font-semibold text-success">
            <Icon path={ICON_PATHS.checkCircle} size="sm" />
            Selected for this job
          </p>
        ) : canSelect ? (
          <ActionButton
            fullWidth
            iconPath={ICON_PATHS.check}
            isLoading={isSelecting}
            disabled={isBusy}
            onClick={() => onSelect(proposal.id)}
          >
            Select provider
          </ActionButton>
        ) : (
          <p className="flex items-center justify-center gap-2 h-11 text-sm font-medium text-text-secondary">
            <Icon
              path={isPassedOver ? ICON_PATHS.x : ICON_PATHS.lock}
              size="sm"
              className="w-3.5 h-3.5"
            />
            {isPassedOver ? "Not selected" : "Selectable after reveal"}
          </p>
        )}
      </footer>
    </article>
  );
}
