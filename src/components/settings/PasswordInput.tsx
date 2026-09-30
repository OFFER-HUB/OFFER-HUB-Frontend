"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INPUT } from "@/lib/styles";
import { FormField } from "@/components/ui/FormField";

export type FieldName = "currentPassword" | "newPassword" | "confirmPassword";

const PASSWORD_VISIBILITY_LABELS: Record<FieldName, string> = {
  currentPassword: "Current password",
  newPassword: "New password",
  confirmPassword: "Confirm password",
};

export interface PasswordInputProps {
  label: string;
  name: FieldName;
  value: string;
  onChange: (name: FieldName, value: string) => void;
  error?: string;
}

export function PasswordInput({
  label,
  name,
  value,
  onChange,
  error,
}: PasswordInputProps): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} error={error}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className={cn(NEUMORPHIC_INPUT, "pr-16")}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          aria-label={`${visible ? "Hide" : "Show"} ${PASSWORD_VISIBILITY_LABELS[name]}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </FormField>
  );
}
