"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INPUT, INPUT_ERROR_STYLES, PRIMARY_BUTTON } from "@/lib/styles";
import { useAuthStore } from "@/stores/auth-store";
import { getProfile } from "@/lib/api/profile";
import {
  DEFAULT_FREELANCER_AVAILABILITY,
  getFreelancerAvailability,
  listIanaTimezones,
  updateFreelancerAvailability,
  type FreelancerAvailability,
} from "@/lib/api/availability";

const MIN_HOURS = 1;
const MAX_HOURS = 80;
const AUTOSAVE_MS = 500;

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function clampHours(n: number): number {
  if (Number.isNaN(n)) return MIN_HOURS;
  return Math.min(MAX_HOURS, Math.max(MIN_HOURS, Math.round(n)));
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

const TOGGLE_STYLES = cn(
  "relative w-12 h-6 rounded-full transition-all duration-200 cursor-pointer",
  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
);

const TOGGLE_THUMB = cn(
  "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200",
  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "bg-white"
);

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn(TOGGLE_STYLES, "flex-shrink-0", enabled ? "bg-primary" : "bg-background")}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
      >
        <span className={cn(TOGGLE_THUMB, enabled ? "left-6" : "left-0.5")} />
      </button>
    </div>
  );
}

function availabilityBadgeLabel(a: FreelancerAvailability): { text: string; className: string } {
  if (a.vacationMode) {
    return { text: "Vacation", className: "bg-amber-500/15 text-amber-800 border border-amber-500/30" };
  }
  if (a.availableForWork) {
    return { text: "Available", className: "bg-success/10 text-success border border-success/25" };
  }
  return { text: "Unavailable", className: "bg-gray-200/80 text-text-secondary border border-gray-300" };
}

interface ProfileAvailabilityPreviewProps {
  availability: FreelancerAvailability;
  displayName: string;
  avatarUrl?: string | null;
}

function ProfileAvailabilityPreview({
  availability,
  displayName,
  avatarUrl,
}: ProfileAvailabilityPreviewProps): React.JSX.Element {
  const badge = availabilityBadgeLabel(availability);
  const initials = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-white",
        "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
      )}
    >
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">Profile preview</p>
      <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:text-left sm:items-start">
        <div className="relative flex-shrink-0">
          {avatarUrl && !avatarUrl.startsWith("blob:") ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                "bg-primary/10 text-primary text-xl font-bold border-2 border-white shadow-md"
              )}
            >
              {initials}
            </div>
          )}
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white",
              availability.availableForWork && !availability.vacationMode ? "bg-green-500" : "bg-gray-400"
            )}
            title={badge.text}
          />
        </div>
        <div className="min-w-0 flex-1 w-full">
          <h3 className="font-bold text-text-primary truncate">{displayName}</h3>
          <span
            className={cn(
              "inline-flex mt-2 px-2.5 py-0.5 rounded-lg text-xs font-semibold",
              badge.className
            )}
          >
            {badge.text}
          </span>
          <dl className="mt-3 space-y-1.5 text-xs text-text-secondary">
            <div className="flex justify-between gap-2">
              <dt>Hours / week</dt>
              <dd className="font-medium text-text-primary">{availability.hoursPerWeek}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Timezone</dt>
              <dd className="font-medium text-text-primary truncate max-w-[60%]" title={availability.timezone}>
                {availability.timezone}
              </dd>
            </div>
            {availability.availableFromDate && (
              <div className="flex justify-between gap-2">
                <dt>Available from</dt>
                <dd className="font-medium text-text-primary">{availability.availableFromDate}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

export function AvailabilitySettings(): React.JSX.Element {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [form, setForm] = useState<FreelancerAvailability>(DEFAULT_FREELANCER_AVAILABILITY);
  const [hoursInput, setHoursInput] = useState(String(DEFAULT_FREELANCER_AVAILABILITY.hoursPerWeek));
  const [hoursError, setHoursError] = useState<string | undefined>();

  const [timezoneQuery, setTimezoneQuery] = useState("");
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const tzWrapRef = useRef<HTMLDivElement>(null);

  const browserTz = useMemo(() => getBrowserTimezone(), []);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const timezones = useMemo(() => listIanaTimezones(), []);
  const filteredTz = useMemo(() => {
    const q = timezoneQuery.trim().toLowerCase();
    if (!q) return timezones;
    return timezones.filter((z) => z.toLowerCase().includes(q));
  }, [timezones, timezoneQuery]);

  const displayName = user?.username?.trim() || "Your name";

  useEffect(() => {
    const u = user?.avatarUrl;
    if (u && !u.startsWith("blob:")) setAvatarUrl(u);
  }, [user?.avatarUrl]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent): void {
      if (!tzWrapRef.current?.contains(e.target as Node)) setTimezoneOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!hydrated || !token) {
      if (hydrated) setIsLoading(false);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [data, profile] = await Promise.all([
          getFreelancerAvailability(authToken),
          getProfile(authToken).catch(() => null),
        ]);

        if (cancelled) return;

        setForm(data);
        setHoursInput(String(data.hoursPerWeek));
        setDirty(false);
        setSaveSucceeded(false);
        setLoaded(true);

        if (profile?.avatarUrl && !profile.avatarUrl.startsWith("blob:")) {
          setAvatarUrl(profile.avatarUrl);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load availability");
          setLoaded(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [hydrated, token]);

  const persist = useCallback(
    async (next: FreelancerAvailability): Promise<void> => {
      if (!token) return;
      setIsSaving(true);
      setSaveError(null);
      try {
        const saved = await updateFreelancerAvailability(token, next);
        setForm(saved);
        setHoursInput(String(saved.hoursPerWeek));
        setDirty(false);
        setSaveSucceeded(true);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setIsSaving(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!loaded || !dirty || !token) return;

    const t = window.setTimeout(() => {
      void persist(form);
    }, AUTOSAVE_MS);

    return () => window.clearTimeout(t);
  }, [form, dirty, loaded, token, persist]);

  function patchForm(partial: Partial<FreelancerAvailability>): void {
    setForm((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }

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
      return;
    }
    if (n < MIN_HOURS || n > MAX_HOURS) {
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
                setLoaded(false);
                setIsLoading(true);
                setLoadError(null);
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
              {!isSaving && !dirty && loaded && saveSucceeded && (
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

          <div className="mt-6 space-y-2 relative" ref={tzWrapRef}>
            <label className="block text-sm font-medium text-text-primary" htmlFor="tz-search">
              Work timezone
            </label>
            <input
              id="tz-search"
              type="text"
              role="combobox"
              aria-expanded={timezoneOpen}
              autoComplete="off"
              value={timezoneOpen ? timezoneQuery : form.timezone}
              onChange={(e) => {
                setTimezoneQuery(e.target.value);
                setTimezoneOpen(true);
              }}
              onFocus={() => {
                setTimezoneQuery(form.timezone);
                setTimezoneOpen(true);
              }}
              placeholder="Search timezone…"
              className={NEUMORPHIC_INPUT}
            />
            {timezoneOpen && (
              <ul
                className={cn(
                  "absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl py-1",
                  "bg-white border border-gray-200 shadow-lg"
                )}
                role="listbox"
              >
                {filteredTz.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-text-secondary">No matches</li>
                ) : (
                  filteredTz.map((z) => (
                    <li key={z}>
                      <button
                        type="button"
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-background",
                          z === form.timezone && "bg-primary/10 font-medium"
                        )}
                        onClick={() => {
                          patchForm({ timezone: z });
                          setTimezoneQuery("");
                          setTimezoneOpen(false);
                        }}
                      >
                        {z}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
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
        <ProfileAvailabilityPreview availability={form} displayName={displayName} avatarUrl={avatarUrl} />
      </div>
    </div>
  );
}
