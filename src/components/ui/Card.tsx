import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "neumorphic" | "neumorphic-inset" | "flat" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  neumorphic: "bg-white shadow-[var(--shadow-neumorphic-light)]",
  "neumorphic-inset": "bg-background shadow-[var(--shadow-neumorphic-inset-light)]",
  flat: "bg-white",
  outlined: "bg-white border border-border-light",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  variant = "neumorphic",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
