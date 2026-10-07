import React from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INPUT } from "@/lib/styles";
import { FormField } from "@/components/ui/FormField";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

const SELECT_STYLES = cn(
  NEUMORPHIC_INPUT,
  "appearance-none cursor-pointer pr-10 text-sm sm:text-base"
);

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: SelectFieldProps): React.JSX.Element {
  return (
    <FormField label={label} hint={hint}>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={SELECT_STYLES}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          path={ICON_PATHS.chevronDown}
          size="sm"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </FormField>
  );
}
