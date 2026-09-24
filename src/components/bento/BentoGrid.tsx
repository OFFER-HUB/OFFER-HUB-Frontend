import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

const columnStyles = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export function BentoGrid({
  children,
  columns = 4,
  className,
  ...props
}: BentoGridProps) {
  return (
    <div
      className={cn("grid gap-6", columnStyles[columns], className)}
      {...props}
    >
      {children}
    </div>
  );
}
