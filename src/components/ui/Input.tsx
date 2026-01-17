import { useId } from "react";
import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Input({
  label,
  error,
  icon,
  iconPosition = "left",
  className,
  id,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : ariaDescribedBy}
          className={cn(
            "w-full rounded-xl bg-background px-4 py-3 text-text-primary",
            "shadow-[var(--shadow-neumorphic-inset-light)]",
            "placeholder:text-text-secondary",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "transition-all duration-200",
            icon && iconPosition === "left" && "pl-12",
            icon && iconPosition === "right" && "pr-12",
            error && "ring-2 ring-error",
            className
          )}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <span id={errorId} className="text-sm text-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
