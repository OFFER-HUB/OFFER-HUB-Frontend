import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

type BentoSize = "small" | "medium" | "large" | "wide" | "tall";

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  size?: BentoSize;
  variant?: "raised" | "inset";
}

const sizeStyles: Record<BentoSize, string> = {
  small: "",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-2 row-span-2",
  wide: "col-span-1 md:col-span-2 lg:col-span-3",
  tall: "row-span-2",
};

export function BentoCard({
  children,
  title,
  size = "small",
  variant = "raised",
  className,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 bg-white",
        variant === "raised" && "shadow-[var(--shadow-neumorphic-light)]",
        variant === "inset" && "shadow-[var(--shadow-neumorphic-inset-light)]",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-semibold text-text-primary mb-4">{title}</h3>
      )}
      <div className="text-text-secondary">{children}</div>
    </div>
  );
}
