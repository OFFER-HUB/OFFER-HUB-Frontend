"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INPUT, INPUT_ERROR_STYLES, PRIMARY_BUTTON } from "@/lib/styles";
import { useAvailabilityForm } from "@/hooks/useAvailabilityForm";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { AvailabilityPreviewCard } from "@/components/profile/AvailabilityPreviewCard";
import { TimezoneCombobox } from "@/components/ui/TimezoneCombobox";
import { getBrowserTimezone, listIanaTimezones } from "@/lib/timezone-utils";

const MIN_HOURS = 1;
const MAX_HOURS = 80;

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

function clampHours(n: number): number {
  if (Number.isNaN(n)) return MIN_HOURS;
  return Math.min(MAX_HOURS, Math.max(MIN_HOURS, Math.round(n)));
}

export function AvailabilitySettings(): React.JSX.Element {
  const {
    form,
    patchForm,
    isSaving,
    isLoading,
    saveError,
    loadError,
    dirty,
    saveSucceeded,
    avatarUrl,
    hydrated,
    token,
    user,
    setDirty,
  } = useAvailabilityForm();

  const [hoursInput, setHoursInput] = useState(String(form.hoursPerWeek));
  const [hoursError, setHoursError] = useState<string | undefined>();
  const [prevHoursPerWeek, setPrevHoursPerWeek] = useState(form.hoursPerWeek);
  const [prevDirty, setPrevDirty] = useState(dirty);

  // Sync hoursInput with external changes directly during render (no effect)
  if (form.hoursPerWeek !== prevHoursPerWeek || (!dirty && prevDirty)) {
    setPrevHoursPerWeek(form.hoursPerWeek);
    setPrevDirty(dirty);
    setHoursInput(String(form.hoursPerWeek));
  } else if (dirty !== prevDirty) {
    setPrevDirty(dirty);
  }

  const browserTz = useMemo(() => getBrowserTimezone(), []);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const timezones = useMemo(() => listIanaTimezones(), []);

  const displayName = user?.username?.trim() || "Your name";

  function toggleWeekday(day: number): void {
    const set = new Set(form.preferredWeekdays);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    patchForm({ preferredWeekdays: Array.from(set).sort((a, b) => a - b) });
  }

  function handleHoursChange(raw: string): void {
    setHoursInput(raw);
    setHoursError(undefined);
    const n = Number.parseInt(raw, 10);
    if (raw === "" || Number.isNaN(n)) {
      setDirty(true);
      return;
    }
    if (n < MIN_HOURS || n > MAX_HOURS) {
      setDirty(true);
      setHoursError(`Enter ${MIN_HOURS}–${MAX_HOURS}`);
      return;
    }
    patchForm({ hoursPerWeek: n });
  }

  function handleHoursBlur(): void {
    const n = clampHours(Number.parseInt(hoursInput, 10));
    setHoursInput(String(n));
    setHoursError(undefined);
    patchForm({ hoursPerWeek: n });
  }

  if (!hydrated) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!token) {
    return (
      <div className={NEUMORPHIC_CARD}>
        <p className="text-sm text-text-secondary">Sign in to manage availability.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[280px]">
        <LoadingSpinner />
        <p className="text-sm text-text-secondary">Loading availability…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={NEUMORPHIC_CARD}>
        <div className="flex items-start gap-3">
          <Icon path={ICON_PATHS.alertCircle} className="text-error flex-shrink-0 mt-0.5" size="md" />
          <div>
            <p className="text-sm font-medium text-text-primary">Could not load settings</p>
            <p className="text-sm text-text-secondary mt-1">{loadError}</p>
            <button
              type="button"
              className={cn(PRIMARY_BUTTON, "mt-4 py-2 px-4 text-sm")}
              onClick={() => {
                window.location.reload();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      <div className="lg:col-span-3 space-y-4">
        <div className={NEUMORPHIC_CARD}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icon path={ICON_PATHS.clock} size="md" className="text-primary" />
              Availability
            </h2>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              {isSaving && (
                <span className="flex items-center gap-1">
                  <LoadingSpinner size="sm" />
                  Saving…
                </span>
              )}
              {!isSaving && !saveError && dirty && (
                <span className="text-amber-700">Pending changes…</span>
              )}
              {!isSaving && !dirty && saveSucceeded && (
                <span className="text-success flex items-center gap-1">
                  <Icon path={ICON_PATHS.check} size="sm" />
                  Saved
                </span>
              )}
            </div>
          </div>

          {saveError && (
            <div
              className={cn(
                "mb-4 p-3 rounded-xl flex items-start gap-2",
                "bg-error/10 border border-error/20 text-error text-sm"
              )}
            >
              <Icon path={ICON_PATHS.alertCircle} size="sm" className="flex-shrink-0 mt-0.5" />
              {saveError}
            </div>
          )}

          <div className="rounded-xl p-3 mb-4 bg-primary/5 border border-primary/15">
            <p className="text-xs font-medium text-text-primary">Marketplace visibility</p>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              When you are available for work and not on vacation, you are more likely to appear in relevant
              marketplace results. Unavailable or vacation mode reduces visibility for new opportunities.
            </p>
          </div>

          <div className="divide-y divide-border-light">
            <ToggleSwitch
              enabled={form.availableForWork}
              onChange={() => patchForm({ availableForWork: !form.availableForWork })}
              label="Available for work"
              description="Show that you are open to new projects."
            />
            <ToggleSwitch
              enabled={form.vacationMode}
              onChange={() => patchForm({ vacationMode: !form.vacationMode })}
              label="Vacation mode"
              description="Pause new inbound leads while you are away."
            />
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-text-primary" htmlFor="hours-week">
              Hours per week
            </label>
            <input
              id="hours-week"
              type="number"
              min={MIN_HOURS}
              max={MAX_HOURS}
              inputMode="numeric"
              value={hoursInput}
              onChange={(e) => handleHoursChange(e.target.value)}
              onBlur={handleHoursBlur}
              className={cn(NEUMORPHIC_INPUT, hoursError && INPUT_ERROR_STYLES)}
            />
            {hoursError && <p className="text-sm text-error mt-1">{hoursError}</p>}
            <p className="text-xs text-text-secondary">Between {MIN_HOURS} and {MAX_HOURS} hours.</p>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-text-primary">Your current timezone (browser)</p>
            <p className="text-xs text-text-secondary break-all">{browserTz}</p>
          </div>

          <div className="mt-6">
            <TimezoneCombobox
              value={form.timezone}
              onChange={(tz) => patchForm({ timezone: tz })}
              timezones={timezones}
            />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-text-primary mb-2">Schedule preferences (optional)</p>
            <p className="text-xs text-text-secondary mb-3">Days you prefer to collaborate.</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(({ value, label }) => {
                const on = form.preferredWeekdays.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleWeekday(value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      on
                        ? "bg-primary text-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)]"
                        : "bg-background text-text-secondary shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-text-primary" htmlFor="avail-from">
              Future availability from (optional)
            </label>
            <input
              id="avail-from"
              type="date"
              min={minDate}
              value={form.availableFromDate ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                patchForm({ availableFromDate: v ? v : null });
              }}
              className={NEUMORPHIC_INPUT}
            />
            <p className="text-xs text-text-secondary">
              Use this if you will become available starting on a specific date.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 lg:sticky lg:top-6">
        <AvailabilityPreviewCard availability={form} displayName={displayName} avatarUrl={avatarUrl} />
      </div>
    </div>
  );
}
