"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { RoundPhase } from "../sub-rosa.types";
import { ActionButton, Panel, PanelHeader } from "./ui";

type PendingAction = "deadline" | "reveal" | "select" | null;

interface RoundControlsProps {
  phase: RoundPhase;
  revealedCount: number;
  totalCount: number;
  pendingAction: PendingAction;
  onReachDeadline: () => void;
  onReveal: () => void;
  onReset: () => void;
}

interface NextStep {
  title: string;
  hint: string;
}

const NEXT_STEP: Record<RoundPhase, NextStep> = {
  collecting: {
    title: "Proposals are sealed",
    hint: "Fast-forward to the shared deadline to stop accepting submissions.",
  },
  deadline_reached: {
    title: "Deadline reached",
    hint: "Every proposal can now be opened at the same time.",
  },
  revealed: {
    title: "All proposals revealed",
    hint: "Compare them below and pick the provider for the job.",
  },
  provider_selected: {
    title: "Round complete",
    hint: "A provider was selected. Reset to walk through it again.",
  },
};

/**
 * Operator controls that stand in for what the protocol would do on its own.
 *
 * Only the step that is possible right now is offered, as a single primary
 * action. The previous version showed every step at once and greyed out the
 * ones that did not apply, which left most of the panel looking disabled.
 */
export function RoundControls({
  phase,
  revealedCount,
  totalCount,
  pendingAction,
  onReachDeadline,
  onReveal,
  onReset,
}: RoundControlsProps): React.JSX.Element {
  const isBusy = pendingAction !== null;
  const step = NEXT_STEP[phase];
  const revealPercent = totalCount === 0 ? 0 : (revealedCount / totalCount) * 100;

  return (
    <Panel as="aside" aria-label="Round operations">
      <PanelHeader
        iconPath={ICON_PATHS.settings}
        title="Round operations"
        description="Stand-ins for what the protocol does on its own in a live round."
      />

      <div className="rounded-xl bg-background p-4 shadow-[var(--shadow-neumorphic-inset-light)]">
        <p className="text-sm font-bold text-text-primary" aria-live="polite">
          {step.title}
        </p>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">{step.hint}</p>

        <div className="mt-4">
          {phase === "collecting" ? (
            <ActionButton
              fullWidth
              iconPath={ICON_PATHS.clock}
              isLoading={pendingAction === "deadline"}
              disabled={isBusy}
              onClick={onReachDeadline}
            >
              Simulate deadline
            </ActionButton>
          ) : phase === "deadline_reached" ? (
            <ActionButton
              fullWidth
              iconPath={ICON_PATHS.eye}
              isLoading={pendingAction === "reveal"}
              disabled={isBusy}
              onClick={onReveal}
            >
              Reveal all proposals
            </ActionButton>
          ) : phase === "revealed" ? (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Icon path={ICON_PATHS.arrowDown} size="sm" />
              Choose a provider below
            </p>
          ) : (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
              <Icon path={ICON_PATHS.checkCircle} size="sm" />
              Provider selected
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-text-secondary">Visible proposals</span>
          <span className="font-bold text-text-primary tabular-nums">
            {revealedCount}/{totalCount}
          </span>
        </div>
        <div
          className="mt-2 h-2 rounded-full bg-background shadow-[var(--shadow-neumorphic-inset-light)] overflow-hidden"
          role="progressbar"
          aria-label="Visible proposals"
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-valuenow={revealedCount}
        >
          <div
            className={cn(
              "h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            )}
            style={{ width: `${revealPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-auto pt-5">
        <ActionButton
          variant="quiet"
          size="sm"
          fullWidth
          iconPath={ICON_PATHS.refresh}
          disabled={isBusy}
          onClick={onReset}
        >
          Reset workspace
        </ActionButton>
      </div>
    </Panel>
  );
}
