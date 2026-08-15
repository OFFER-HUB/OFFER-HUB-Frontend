import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ROUND_STEPS } from "../sub-rosa.constants";
import type { RoundPhase } from "../sub-rosa.types";

interface RoundTimelineProps {
  phase: RoundPhase;
}

/**
 * How far the round has advanced. "Job created" is always behind us, so the
 * phase maps onto the step index one past it.
 */
const PHASE_STEP_INDEX: Record<RoundPhase, number> = {
  collecting: 1,
  deadline_reached: 2,
  revealed: 3,
  provider_selected: 4,
};

export function RoundTimeline({ phase }: RoundTimelineProps): React.JSX.Element {
  const currentIndex = PHASE_STEP_INDEX[phase];

  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="Round progress">
      {ROUND_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium",
                "transition-all duration-200",
                // Raised for the step in progress, sunken for everything else:
                // the elevation carries the state as much as the colour does.
                isCurrent &&
                  "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                isDone &&
                  "bg-background text-primary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                !isDone &&
                  !isCurrent &&
                  "bg-background text-text-secondary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isDone ? (
                <Icon path={ICON_PATHS.check} size="sm" />
              ) : (
                <span className="w-4 text-center tabular-nums">{index + 1}</span>
              )}
              {step}
            </span>
            {index < ROUND_STEPS.length - 1 ? (
              <Icon
                path={ICON_PATHS.chevronRight}
                size="sm"
                className="text-text-secondary/50 hidden sm:block"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
