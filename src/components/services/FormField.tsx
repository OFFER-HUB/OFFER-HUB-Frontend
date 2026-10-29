import React from "react";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  characterCount?: {
    current: number;
    min?: number;
    max?: number;
  };
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  required,
  error,
  helperText,
  characterCount,
  children,
  className,
}: FormFieldProps): React.JSX.Element {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-sm font-semibold text-text-primary">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {characterCount && (
          <span
            className={cn(
              "text-xs font-medium",
              characterCount.min && characterCount.current < characterCount.min
                ? "text-text-secondary"
                : characterCount.max && characterCount.current > characterCount.max
                ? "text-error"
                : "text-success"
            )}
          >
            {characterCount.max
              ? characterCount.min
                ? `${characterCount.current} / ${characterCount.min} min (${characterCount.max} max)`
                : `${characterCount.current} / ${characterCount.max} max`
              : `${characterCount.current}/${characterCount.min} min chars`}
          </span>
        )}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-error font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
}
