"use client";

import { useState, useEffect } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { cn } from "@/lib/cn";

interface ContextualTooltipProps {
  id: string;
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  showOnce?: boolean;
  delay?: number;
  className?: string;
}

export function ContextualTooltip({
  id,
  children,
  content,
  position = "top",
  showOnce = true,
  delay = 500,
  className,
}: ContextualTooltipProps) {
  const { isTooltipDismissed, dismissTooltip } = useOnboardingStore();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    if (showOnce && isTooltipDismissed(id)) return;
    if (hasShown) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasShown(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [id, showOnce, isTooltipDismissed, delay, hasShown]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (showOnce) {
      dismissTooltip(id);
    }
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-white border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-white border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-white border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-white border-y-transparent border-l-transparent",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 w-64 animate-fade-in",
            positionClasses[position]
          )}
        >
          <div className="relative bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-0 h-0 border-8",
                arrowClasses[position]
              )}
            />

            {/* Content */}
            <div className="text-sm text-gray-700">{content}</div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="mt-3 text-xs text-primary hover:text-primary-hover font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
