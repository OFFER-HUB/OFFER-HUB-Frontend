"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  formatPreferenceCurrency,
  formatPreferenceDate,
  formatPreferenceTime,
  getAvailableTimezones,
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from "@/lib/preferences";
import { NEUMORPHIC_CARD, NEUMORPHIC_INPUT } from "@/lib/styles";
import { useAuthStore } from "@/stores/auth-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import type { UserPreferences } from "@/types/preferences.types";
import { FormField } from "@/components/ui/FormField";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SELECT_STYLES = cn(
  NEUMORPHIC_INPUT,
  "appearance-none cursor-pointer pr-10 text-sm sm:text-base"
);

const SECTION_HEADER_ICON =
  "w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center";

const SAVE_MESSAGES: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "Saving changes...",
  saved: "All changes saved",
  error: "We kept your local changes, but remote sync failed",
};

function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}): React.JSX.Element {
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

function ThemeToggle({
  value,
  onChange,
}: {
  value: UserPreferences["theme"];
  onChange: (value: UserPreferences["theme"]) => void;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {THEME_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all duration-200",
              isActive
                ? "border-primary bg-primary/10 shadow-[inset_2px_2px_4px_rgba(20,154,155,0.12)]"
                : "border-border-light bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:border-primary/30"
            )}
          >
            <p className="font-semibold text-text-primary">{option.label}</p>
            <p className="mt-1 text-sm text-text-secondary">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}

export function PreferencesForm(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const preferences = usePreferencesStore((state) => state.preferences);
  const setPreference = usePreferencesStore((state) => state.setPreference);
  const savePreferences = usePreferencesStore((state) => state.savePreferences);
  const hasInitialized = usePreferencesStore((state) => state.hasInitialized);

  const [timezoneQuery, setTimezoneQuery] = useState("");
  const deferredTimezoneQuery = useDeferredValue(timezoneQuery);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const hasUserChanged = useRef(false);

  const timezoneOptions = useMemo(() => getAvailableTimezones(), []);
  const filteredTimezones = useMemo(() => {
    const query = deferredTimezoneQuery.trim().toLowerCase();

    if (!query) {
      return timezoneOptions;
    }

    return timezoneOptions.filter((timezone) => timezone.toLowerCase().includes(query));
  }, [deferredTimezoneQuery, timezoneOptions]);

  useEffect(() => {
    if (!hasInitialized || !hasUserChanged.current) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await savePreferences(token);
        setSaveStatus("saved");
        setSaveMessage(result.message);
      } catch {
        setSaveStatus("error");
        setSaveMessage(SAVE_MESSAGES.error);
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [hasInitialized, preferences, savePreferences, token]);

  function handlePreferenceChange<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    hasUserChanged.current = true;
    setSaveStatus("saving");
    setSaveMessage(SAVE_MESSAGES.saving);
    setPreference(key, value);
  }

  const previewDate = new Date("2026-03-26T14:45:00.000Z");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-secondary to-primary p-6 text-white shadow-lg shadow-primary/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Preferences</h1>
          <p className="mt-1 text-sm text-white/80">
            Personalize how OFFER-HUB looks and formats information across your workspace.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && <LoadingSpinner size="sm" className="text-white" />}
            {saveStatus === "saved" && (
              <Icon path={ICON_PATHS.check} size="sm" className="text-white" />
            )}
            {saveStatus === "error" && (
              <Icon path={ICON_PATHS.alertCircle} size="sm" className="text-white" />
            )}
            <span className="text-sm font-medium">
              {saveStatus === "idle" ? "Defaults auto-detected from your browser" : saveMessage}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className={NEUMORPHIC_CARD}>
            <div className="mb-6 flex items-start gap-4">
              <div className={SECTION_HEADER_ICON}>
                <Icon path={ICON_PATHS.settings} size="md" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Regional settings</h2>
                <p className="text-sm text-text-secondary">
                  Control language, timezone, and currency for dates, times, and pricing.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Language"
                value={preferences.language}
                onChange={(value) => handlePreferenceChange("language", value)}
                options={LANGUAGE_OPTIONS}
              />

              <SelectField
                label="Currency"
                value={preferences.currency}
                onChange={(value) => handlePreferenceChange("currency", value)}
                options={CURRENCY_OPTIONS}
              />
            </div>

            <div className="mt-5 grid gap-4">
              <FormField
                label="Timezone"
                hint="Search to quickly find your city or region, then select the exact timezone."
              >
                <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                  <input
                    type="search"
                    value={timezoneQuery}
                    onChange={(event) => setTimezoneQuery(event.target.value)}
                    placeholder="Search timezone"
                    className={NEUMORPHIC_INPUT}
                  />
                  <div className="relative">
                    <select
                      value={preferences.timezone}
                      onChange={(event) => handlePreferenceChange("timezone", event.target.value)}
                      className={SELECT_STYLES}
                    >
                      {filteredTimezones.map((timezone) => (
                        <option key={timezone} value={timezone}>
                          {timezone}
                        </option>
                      ))}
                    </select>
                    <Icon
                      path={ICON_PATHS.chevronDown}
                      size="sm"
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                    />
                  </div>
                </div>
              </FormField>
            </div>
          </section>

          <section className={NEUMORPHIC_CARD}>
            <div className="mb-6 flex items-start gap-4">
              <div className={SECTION_HEADER_ICON}>
                <Icon path={ICON_PATHS.eye} size="md" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Display & formatting</h2>
                <p className="text-sm text-text-secondary">
                  Tune how the interface appears and how your timeline data is presented.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <FormField
                label="Theme"
                hint="Your choice is applied immediately without reloading the app."
              >
                <ThemeToggle
                  value={preferences.theme}
                  onChange={(value) => handlePreferenceChange("theme", value)}
                />
              </FormField>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Date format"
                  value={preferences.dateFormat}
                  onChange={(value) =>
                    handlePreferenceChange("dateFormat", value as UserPreferences["dateFormat"])
                  }
                  options={DATE_FORMAT_OPTIONS}
                />

                <SelectField
                  label="Time format"
                  value={preferences.timeFormat}
                  onChange={(value) =>
                    handlePreferenceChange("timeFormat", value as UserPreferences["timeFormat"])
                  }
                  options={TIME_FORMAT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary">Live preview</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Review how your preferences affect common values around the product.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-background p-4 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">Date</p>
                <p className="mt-2 text-xl font-semibold text-text-primary">
                  {formatPreferenceDate(previewDate, preferences)}
                </p>
              </div>
              <div className="rounded-2xl bg-background p-4 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">Time</p>
                <p className="mt-2 text-xl font-semibold text-text-primary">
                  {formatPreferenceTime(previewDate, preferences)}
                </p>
              </div>
              <div className="rounded-2xl bg-background p-4 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">Currency</p>
                <p className="mt-2 text-xl font-semibold text-text-primary">
                  {formatPreferenceCurrency(12450.75, preferences)}
                </p>
              </div>
            </div>
          </section>

          <section className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary">How it works</h2>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <p>
                Browser defaults seed the first experience so users land on sensible settings
                immediately.
              </p>
              <p>
                Each change updates the app state instantly through Zustand, then auto-saves after a
                short pause.
              </p>
              <p>
                If the preferences API is unavailable, local changes are preserved so nothing feels
                lost.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
