"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { RoundPhase } from "../sub-rosa.types";

interface RoundControlsProps {
  phase: RoundPhase;
  revealedCount: number;
  totalCount: number;
  isBusy: boolean;
  onReachDeadline: () => void;
  onReveal: () => void;
  onReset: () => void;
}

/**
 * Operator controls that stand in for what the protocol would do on its own.
 * Labelled as simulations rather than actions so nobody reads a button click
 * as a real lifecycle call.
 */
export function RoundControls({
  phase,
  revealedCount,
  totalCount,
  isBusy,
  onReachDeadline,
  onReveal,
  onReset,
}: RoundControlsProps): React.JSX.Element {
  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon path={ICON_PATHS.settings} size="sm" className="text-text-secondary" />
        <h3 className="text-sm font-bold text-text-primary">Round operations</h3>
      </div>
      <p className="text-xs text-text-secondary mb-5">
        In a live round nobody presses these. The deadline arrives when the drand round publishes,
        and reveal is a permissionless lifecycle any participant can finish.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={onReachDeadline}
          disabled={isBusy || phase !== "collecting"}
          icon={<Icon path={ICON_PATHS.clock} size="sm" />}
          iconPosition="left"
        >
          Simulate deadline
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReveal}
          disabled={isBusy || phase !== "deadline_reached"}
          icon={<Icon path={ICON_PATHS.eye} size="sm" />}
          iconPosition="left"
        >
          Reveal proposals
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          disabled={isBusy}
          icon={<Icon path={ICON_PATHS.refresh} size="sm" />}
          iconPosition="left"
        >
          Reset workspace
        </Button>
      </div>

      <div
        className={cn(
          "flex items-center justify-between mt-5 px-4 py-3 rounded-xl",
          "bg-background shadow-[var(--shadow-neumorphic-inset-light)]"
        )}
      >
        <span className="text-xs font-medium text-text-secondary">Visible proposals</span>
        <span className="text-sm font-bold text-text-primary tabular-nums">
          {revealedCount}/{totalCount}
        </span>
      </div>
    </Card>
  );
}
