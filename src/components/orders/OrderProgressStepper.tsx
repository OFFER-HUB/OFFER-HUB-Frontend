import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ORDER_PROGRESS_MILESTONES } from "@/constants/order-steps";

interface OrderProgressStepperProps {
  /** Position on the internal step scale, from `resolveOrderStep(status).step`. */
  currentStep: number;
}

/**
 * Four-milestone track of the order lifecycle.
 *
 * A milestone reads as done (check, raised circle, filled connector), current
 * (dot) or pending (number, sunken circle) purely from `currentStep`, so the
 * component never has to know about order statuses.
 */
export function OrderProgressStepper({
  currentStep,
}: OrderProgressStepperProps): React.JSX.Element {
  const lastIndex = ORDER_PROGRESS_MILESTONES.length - 1;

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7")}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-[#111827]">Order Lifecycle Progress</h2>
        <span className="text-xs font-semibold text-text-secondary">
          Step {Math.min(ORDER_PROGRESS_MILESTONES.findIndex((m) => m.step >= currentStep) + 1 || 1, 4)} of 4
        </span>
      </div>
      <div className="relative px-2 sm:px-6">
        <div className="relative grid grid-cols-4 gap-2">
          {ORDER_PROGRESS_MILESTONES.map((milestone, index) => {
            const isPassed = currentStep > milestone.step;
            const isCurrent = currentStep === milestone.step;
            const isPending = currentStep < milestone.step;
            const stepNumber = index + 1;

            return (
              <div key={milestone.step} className="flex flex-col items-center relative group">
                <div
                  className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm mb-3 transition-all relative z-10",
                    isPassed && "bg-primary text-white shadow-[3px_3px_8px_#cbd5e1]",
                    isCurrent && "bg-background text-primary ring-2 ring-primary shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff]",
                    isPending && "bg-background text-text-secondary/70 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                  )}
                >
                  {isPassed ? (
                    <Icon path={ICON_PATHS.check} size="sm" className="text-white" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {index < lastIndex && (
                  <div className="absolute top-5 sm:top-6 left-1/2 w-full h-1 -z-0">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        isPassed
                          ? "bg-primary"
                          : "bg-border-light shadow-[inset_1px_1px_2px_#d1d5db]"
                      )}
                    />
                  </div>
                )}

                <span
                  className={cn(
                    "text-xs text-center transition-colors",
                    isCurrent ? "font-bold text-[#111827]" : isPassed ? "font-semibold text-text-primary" : "text-text-secondary"
                  )}
                >
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
