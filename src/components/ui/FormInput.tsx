"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_INPUT, INPUT_ERROR_STYLES } from "@/lib/styles";

export interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function FormInput({
  label,
  name,
  type = "text",
  value,
  placeholder,
  error,
  onChange,
  className,
}: FormInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={cn(NEUMORPHIC_INPUT, error && INPUT_ERROR_STYLES)}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
