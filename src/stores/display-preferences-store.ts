import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DateFormatPreference = "MDY" | "DMY" | "YMD";
export type TimeFormatPreference = "12h" | "24h";

export interface DisplayPreferences {
  timezone: string;
  dateFormat: DateFormatPreference;
  timeFormat: TimeFormatPreference;
}

interface DisplayPreferencesState extends DisplayPreferences {
  setPreference: <K extends keyof DisplayPreferences>(key: K, value: DisplayPreferences[K]) => void;
  reset: () => void;
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function defaults(): DisplayPreferences {
  return { timezone: detectTimezone(), dateFormat: "MDY", timeFormat: "12h" };
}

/**
 * Per-device display preferences. They are applied by the shared formatters in
 * `lib/date-formatters.ts`, so every date rendered through them follows the choice.
 */
export const useDisplayPreferences = create<DisplayPreferencesState>()(
  persist(
    (set) => ({
      ...defaults(),
      setPreference: (key, value) => set({ [key]: value } as Partial<DisplayPreferences>),
      reset: () => set(defaults()),
    }),
    {
      name: "display-preferences",
      partialize: ({ timezone, dateFormat, timeFormat }) => ({ timezone, dateFormat, timeFormat }),
    }
  )
);
