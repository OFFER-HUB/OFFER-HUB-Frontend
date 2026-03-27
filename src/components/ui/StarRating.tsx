"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-9 h-9",
  xl: "w-11 h-11",
} as const;

const STAR_PATH =
  "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z";

const STARS = [1, 2, 3, 4, 5] as const;

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps): React.JSX.Element {
  const [hoverValue, setHoverValue] = useState(0);
  const isInteractive = !readonly && onChange;
  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1">
      {STARS.map((star) => {
        const isFilled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            onClick={isInteractive ? () => onChange(star) : undefined}
            onMouseEnter={isInteractive ? () => setHoverValue(star) : undefined}
            onMouseLeave={isInteractive ? () => setHoverValue(0) : undefined}
            disabled={readonly}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className={cn(
              "rounded-full p-1 transition-transform duration-150",
              isInteractive ? "cursor-pointer hover:scale-110" : "cursor-default"
            )}
          >
            <svg
              className={cn(SIZE_CLASSES[size], isFilled ? "text-warning" : "text-gray-300")}
              fill={isFilled ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isFilled ? 0 : 1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
