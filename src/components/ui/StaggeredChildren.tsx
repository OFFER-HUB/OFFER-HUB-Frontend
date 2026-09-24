"use client";

import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/useInView";
import { Children, type ReactNode } from "react";

interface StaggeredChildrenProps {
  children: ReactNode;
  className?: string;
  childClassName?: string;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
}

export function StaggeredChildren({
  children,
  className,
  childClassName,
  staggerDelay = 100,
  duration = 600,
  threshold = 0.1,
}: StaggeredChildrenProps) {
  const { ref, isInView } = useInView({ threshold });

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => (
        <div
          className={cn(
            "transition-all ease-out",
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6",
            childClassName
          )}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: isInView ? `${index * staggerDelay}ms` : "0ms",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
