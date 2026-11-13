"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INPUT } from "@/lib/styles";
import { ICON_PATHS } from "@/components/ui/Icon";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { formatDateTime } from "@/lib/date-formatters";
import {
  useDisplayPreferences,
  type DateFormatPreference,
  type TimeFormatPreference,
} from "@/stores/display-preferences-store";

const DATE_FORMATS: { value: DateFormatPreference; label: string }[] = [
  { value: "MDY", label: "Nov 13, 2026" },
  { value: "DMY", label: "13 Nov 2026" },
  { value: "YMD", label: "2026-11-13" },
];

const TIME_FORMATS: { value: TimeFormatPreference; label: string }[] = [
  { value: "12h", label: "12-hour (3:05 PM)" },
  { value: "24h", label: "24-hour (15:05)" },
];

function listTimezones(current: string): string[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    zones = [];
  }
  const all = new Set(["UTC", ...zones]);
  all.add(current);
  return [...all].sort();
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}): React.JSX.Element {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text-primary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              value === option.value
                ? "bg-primary text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                : "bg-background text-text-secondary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PreferencesForm(): React.JSX.Element {
  const { timezone, dateFormat, timeFormat, setPreference, reset } = useDisplayPreferences();
  const timezones = useMemo(() => listTimezones(timezone), [timezone]);
  const preview = formatDateTime(new Date().toISOString());

  return (
    <div className="space-y-6">
      <SettingsHeader
        icon={ICON_PATHS.settings}
        title="Preferences"
        description="Choose your time zone and how dates and times appear across OFFER-HUB. Saved on this device and applied instantly."
      />

      <section className={cn(NEUMORPHIC_CARD, "space-y-6")}>
        <div>
          <label htmlFor="timezone" className="mb-2 block text-sm font-medium text-text-primary">
            Time zone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(event) => setPreference("timezone", event.target.value)}
            className={cn(NEUMORPHIC_INPUT, "cursor-pointer text-sm")}
          >
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <OptionGroup
            label="Date format"
            value={dateFormat}
            options={DATE_FORMATS}
            onChange={(value) => setPreference("dateFormat", value)}
          />
          <OptionGroup
            label="Time format"
            value={timeFormat}
            options={TIME_FORMATS}
            onChange={(value) => setPreference("timeFormat", value)}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-text-secondary">Preview (now)</p>
            <p
              className="text-sm font-semibold text-text-primary"
              data-testid="preferences-preview"
            >
              {preview}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-primary hover:underline"
          >
            Reset to defaults
          </button>
        </div>
      </section>
    </div>
  );
}
