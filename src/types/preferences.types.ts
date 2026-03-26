export type ThemePreference = "light" | "dark" | "system";

export type DateFormatPreference = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

export type TimeFormatPreference = "12h" | "24h";

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  theme: ThemePreference;
  dateFormat: DateFormatPreference;
  timeFormat: TimeFormatPreference;
}

export interface PreferenceOption {
  value: string;
  label: string;
  description?: string;
}

export interface SavePreferencesResult {
  savedRemotely: boolean;
  message: string;
}
