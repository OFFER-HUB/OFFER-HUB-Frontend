"use client";

import { cn } from "@/lib/cn";

interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 h-10">
      {total < 2 ? null : Array.from({ length: total }, (_, i) => {
        const s = i + 1;
        const done = s < current;
        const active = s === current;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              active && "bg-primary text-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              done && "bg-primary/20 text-primary",
              !active && !done && "bg-[#F3F4F6] text-text-secondary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            )}>
              {done ? (
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : s}
            </div>
            {s < total && (
              <div className={cn("w-8 h-0.5 rounded-full transition-all duration-300", done ? "bg-primary/40" : "bg-gray-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
