import { cn } from "@/lib/cn";

interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex h-10 items-center justify-center gap-2">
      {total < 2
        ? null
        : Array.from({ length: total }, (_, index) => {
            const step = index + 1;
            const isDone = step < current;
            const isActive = step === current;

            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                    isActive &&
                      "bg-primary text-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                    isDone && "bg-primary/20 text-primary",
                    !isActive &&
                      !isDone &&
                      "bg-[#F3F4F6] text-text-secondary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  )}
                >
                  {isDone ? (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < total && (
                  <div
                    className={cn(
                      "h-0.5 w-8 rounded-full transition-all duration-300",
                      isDone ? "bg-primary/40" : "bg-gray-200",
                    )}
                  />
                )}
              </div>
            );
          })}
    </div>
  );
}
