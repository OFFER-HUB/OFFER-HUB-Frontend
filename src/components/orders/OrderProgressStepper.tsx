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
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-8">Order Progress</h2>
      <div className="relative px-4">
        <div className="relative grid grid-cols-4 gap-2">
          {ORDER_PROGRESS_MILESTONES.map((milestone, index) => {
            const isReached = currentStep >= milestone.step;
            const isPassed = currentStep > milestone.step;
            const isCurrent = currentStep === milestone.step;

            return (
              <div key={milestone.step} className="flex flex-col items-center relative">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm mb-3 transition-all relative z-10 bg-background",
                    isReached
                      ? "text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
                      : "text-text-secondary shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                  )}
                >
                  {isPassed ? (
                    <Icon path={ICON_PATHS.check} size="sm" className="text-primary" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  ) : (
                    milestone.step
                  )}
                </div>

                {index < lastIndex && (
                  <div className="absolute top-6 left-1/2 w-full h-0.5 -z-0">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        isPassed
                          ? "bg-primary"
                          : "bg-border-light shadow-[inset_1px_1px_2px_#d1d5db]"
                      )}
                    />
                  </div>
                )}

                <span className="text-xs font-medium text-text-secondary text-center">
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
