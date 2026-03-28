import type {
  DateFormatPreference,
  PreferenceOption,
  ThemePreference,
  TimeFormatPreference,
  UserPreferences,
} from "@/types/preferences.types";

export const LANGUAGE_OPTIONS: PreferenceOption[] = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "fr-FR", label: "French" },
  { value: "es-ES", label: "Spanish" },
  { value: "de-DE", label: "German" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ar-SA", label: "Arabic" },
];

export const CURRENCY_OPTIONS: PreferenceOption[] = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
];

export const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  { value: "light", label: "Light", description: "Bright interface for daytime work" },
  { value: "dark", label: "Dark", description: "Reduced glare for low-light sessions" },
  { value: "system", label: "System", description: "Match your device appearance" },
];

export const DATE_FORMAT_OPTIONS: Array<{
  value: DateFormatPreference;
  label: string;
}> = [
  { value: "MM/DD/YYYY", label: "03/26/2026" },
  { value: "DD/MM/YYYY", label: "26/03/2026" },
  { value: "YYYY-MM-DD", label: "2026-03-26" },
];

export const TIME_FORMAT_OPTIONS: Array<{
  value: TimeFormatPreference;
  label: string;
}> = [
  { value: "12h", label: "12-hour" },
  { value: "24h", label: "24-hour" },
];

const LOCALE_CURRENCY_MAP: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  NG: "NGN",
  CA: "CAD",
  AU: "AUD",
  DE: "EUR",
  ES: "EUR",
  FR: "EUR",
  IT: "EUR",
  PT: "EUR",
  IE: "EUR",
  JP: "JPY",
  SA: "SAR",
  AE: "AED",
  IN: "INR",
  ZA: "ZAR",
};

const FALLBACK_TIMEZONES = [
  "Africa/Lagos",
  "Africa/Cairo",
  "America/Los_Angeles",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: "en-US",
  timezone: "UTC",
  currency: "USD",
  theme: "light",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
};

export function getAvailableTimezones(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }

  return FALLBACK_TIMEZONES;
}

export function normalizeLanguage(language: string | undefined): string {
  if (!language) {
    return DEFAULT_PREFERENCES.language;
  }

  const exactMatch = LANGUAGE_OPTIONS.find((option) => option.value === language);
  if (exactMatch) {
    return exactMatch.value;
  }

  const baseLanguage = language.split("-")[0];
  const closeMatch = LANGUAGE_OPTIONS.find((option) => option.value.startsWith(`${baseLanguage}-`));

  return closeMatch?.value ?? DEFAULT_PREFERENCES.language;
}

export function inferCurrencyFromLocale(language: string): string {
  const region = language.split("-")[1]?.toUpperCase();

  if (!region) {
    return DEFAULT_PREFERENCES.currency;
  }

  return LOCALE_CURRENCY_MAP[region] ?? DEFAULT_PREFERENCES.currency;
}

export function detectBrowserPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  const resolvedOptions = new Intl.DateTimeFormat().resolvedOptions();
  const browserLanguage = normalizeLanguage(navigator.languages?.[0] ?? navigator.language);
  const timezone = resolvedOptions.timeZone ?? DEFAULT_PREFERENCES.timezone;
  const currency = inferCurrencyFromLocale(browserLanguage);
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const dateFormat = browserLanguage === "en-US" ? "MM/DD/YYYY" : "DD/MM/YYYY";
  const timeFormat = new Intl.DateTimeFormat(browserLanguage, { hour: "numeric" }).resolvedOptions()
    .hour12
    ? "12h"
    : "24h";

  return {
    language: browserLanguage,
    timezone,
    currency,
    theme: "light",
    dateFormat,
    timeFormat,
  };
}

export function resolveTheme(theme: ThemePreference): "light" | "dark" {
  if (theme === "dark") {
    return "dark";
  }

  return "light";
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatPreferenceDate(
  value: Date,
  preferences: Pick<UserPreferences, "dateFormat" | "timezone">
): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: preferences.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const month = parts.find((part) => part.type === "month")?.value ?? pad(value.getMonth() + 1);
  const day = parts.find((part) => part.type === "day")?.value ?? pad(value.getDate());
  const year = parts.find((part) => part.type === "year")?.value ?? value.getFullYear().toString();

  switch (preferences.dateFormat) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatPreferenceTime(
  value: Date,
  preferences: Pick<UserPreferences, "language" | "timezone" | "timeFormat">
): string {
  return new Intl.DateTimeFormat(preferences.language, {
    timeZone: preferences.timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: preferences.timeFormat === "12h",
  }).format(value);
}

export function formatPreferenceCurrency(
  amount: number,
  preferences: Pick<UserPreferences, "language" | "currency">
): string {
  return new Intl.NumberFormat(preferences.language, {
    style: "currency",
    currency: preferences.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
