import { cn } from "@/lib/cn";

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 h-10">
      {total < 2 ? null : Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              active && "bg-primary text-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              done && "bg-primary/20 text-primary",
              !active && !done && "bg-[#F3F4F6] text-text-secondary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            )}>
              {done ? "✓" : step}
            </div>
            {step < total && <div className={cn("w-8 h-0.5 rounded-full", done ? "bg-primary/40" : "bg-gray-200")} />}
          </div>
        );
      })}
    </div>
  );
}
