export type PresetId = "custom" | "30d" | "90d" | "12m" | "ytd" | "all";

export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getRangeForPreset(preset: Exclude<PresetId, "custom">): { start: string; end: string } {
  const end = new Date();
  const endStr = toLocalISODate(end);

  if (preset === "30d") {
    const s = new Date(end);
    s.setDate(s.getDate() - 29);
    return { start: toLocalISODate(s), end: endStr };
  }
  if (preset === "90d") {
    const s = new Date(end);
    s.setDate(s.getDate() - 89);
    return { start: toLocalISODate(s), end: endStr };
  }
  if (preset === "12m") {
    const s = new Date(end.getFullYear(), end.getMonth() - 11, 1);
    return { start: toLocalISODate(s), end: endStr };
  }
  if (preset === "ytd") {
    const s = new Date(end.getFullYear(), 0, 1);
    return { start: toLocalISODate(s), end: endStr };
  }
  const s = new Date(end.getFullYear() - 3, 0, 1);
  return { start: toLocalISODate(s), end: endStr };
}

export function parseMoney(s: string): number {
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

export function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

export function formatPct(p: number): string {
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(1)}%`;
}
