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
                "transition-colors duration-200",
                isCurrent && "bg-primary text-white",
                isDone && "bg-primary/10 text-primary",
                !isDone && !isCurrent && "bg-background text-text-secondary"
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
