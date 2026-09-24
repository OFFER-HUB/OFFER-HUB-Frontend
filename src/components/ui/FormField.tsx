export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  optional,
  children,
}: FormFieldProps): React.JSX.Element {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
        {optional && <span className="text-text-secondary font-normal"> (Optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
