"use client";

import { cn } from "@/lib/cn";

export interface ServiceFormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  /** Right-aligned helper (e.g. character counter) rendered next to the label. */
  aside?: React.ReactNode;
  /** Trailing helper text rendered below the field error. */
  hint?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared label/error shell for the create/edit service forms.
 * Keeps both pages on one field layout instead of duplicating markup.
 */
export function ServiceFormField({
  label,
  htmlFor,
  required,
  error,
  aside,
  hint,
  children,
}: ServiceFormFieldProps): React.JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-text-primary">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {aside}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-error font-medium">{error}</p>}
      {hint && <p className="mt-1.5 text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}

/** Aside counter shown next to a label, colored by whether the min length is met. */
export function MinLengthCounter({
  length,
  minLength,
}: {
  length: number;
  minLength: number;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        "text-xs font-medium",
        length < minLength ? "text-text-secondary" : "text-success"
      )}
    >
      {length}/{minLength} min chars
    </span>
  );
}
