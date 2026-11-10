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

/**
 * Five equal columns joined by a progress rail. Equal widths keep the stepper
 * on one line from phone to desktop instead of wrapping into ragged rows.
 */
export function RoundTimeline({ phase }: RoundTimelineProps): React.JSX.Element {
  const currentIndex = PHASE_STEP_INDEX[phase];
  const lastIndex = ROUND_STEPS.length - 1;
  const progress = (currentIndex / lastIndex) * 100;

  return (
    <div className="relative">
      {/* Rail behind the markers: track plus filled portion. */}
      <div
        aria-hidden
        className="absolute top-4 h-1 rounded-full bg-background shadow-[var(--shadow-neumorphic-inset-light)]"
        style={{ left: "10%", right: "10%" }}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="relative grid grid-cols-5 gap-1" aria-label="Round progress">
        {ROUND_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step}
              className="flex flex-col items-center text-center min-w-0"
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-full",
                  "text-xs font-bold tabular-nums transition-all duration-300",
                  isDone && "bg-primary text-white",
                  isCurrent &&
                    "bg-white text-primary ring-2 ring-primary shadow-[var(--shadow-neumorphic-light)]",
                  !isDone &&
                    !isCurrent &&
                    "bg-background text-text-secondary shadow-[var(--shadow-neumorphic-inset-light)]"
                )}
              >
                {isDone ? <Icon path={ICON_PATHS.check} size="sm" /> : index + 1}
              </span>
              <span
                className={cn(
                  "mt-2 text-[11px] leading-tight sm:text-xs",
                  isCurrent ? "font-bold text-text-primary" : "font-medium text-text-secondary"
                )}
              >
                {step}
              </span>
              <span className="sr-only">
                {isDone ? "(completed)" : isCurrent ? "(current step)" : "(upcoming)"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
