import { useDisplayPreferences } from "@/stores/display-preferences-store";

function parts(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions): Record<string, string> {
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, ...options });
  } catch {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });
  }
  return Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
}

function renderDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return "Invalid Date";
  const { timezone, dateFormat } = useDisplayPreferences.getState();
  if (dateFormat === "YMD") {
    const p = parts(date, timezone, { year: "numeric", month: "2-digit", day: "2-digit" });
    return `${p.year}-${p.month}-${p.day}`;
  }
  const p = parts(date, timezone, { year: "numeric", month: "short", day: "numeric" });
  return dateFormat === "DMY" ? `${p.day} ${p.month} ${p.year}` : `${p.month} ${p.day}, ${p.year}`;
}

function renderTime(date: Date): string {
  if (Number.isNaN(date.getTime())) return "Invalid Date";
  const { timezone, timeFormat } = useDisplayPreferences.getState();
  const p = parts(date, timezone, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: timeFormat === "24h" ? "h23" : "h12",
  });
  return timeFormat === "24h" ? `${p.hour}:${p.minute}` : `${p.hour}:${p.minute} ${p.dayPeriod}`;
}

export function formatDate(iso: string): string {
  return renderDate(new Date(iso));
}

export function formatTime(iso: string): string {
  return renderTime(new Date(iso));
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Invalid Date";
  return `${renderDate(date)}, ${renderTime(date)}`;
}

export function formatResolutionTime(createdAt: string, resolvedAt: string): string {
  const ms = new Date(resolvedAt).getTime() - new Date(createdAt).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}
