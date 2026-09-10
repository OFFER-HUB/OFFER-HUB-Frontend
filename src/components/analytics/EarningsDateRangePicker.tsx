"use client";

import { cn } from "@/lib/cn";
import type { PresetId } from "@/lib/earnings-utils";

const PRESETS: { id: Exclude<PresetId, "custom">; label: string }[] = [
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "12m", label: "12 months" },
  { id: "ytd", label: "Year to date" },
  { id: "all", label: "All time" },
];

const CARD = cn(
  "p-5 rounded-3xl bg-white",
  "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
);

interface EarningsDateRangePickerProps {
  startDate: string;
  endDate: string;
  activePreset: PresetId;
  onPresetChange: (preset: Exclude<PresetId, "custom">) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

export function EarningsDateRangePicker({
  startDate,
  endDate,
  activePreset,
  onPresetChange,
  onStartChange,
  onEndChange,
}: EarningsDateRangePickerProps): React.JSX.Element {
  return (
    <div className={cn(CARD, "p-5 sm:p-6 mb-6")}>
      <p className="text-sm font-semibold text-text-primary mb-3">Date range</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPresetChange(p.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              activePreset === p.id
                ? "bg-primary text-white border-primary"
                : "border-border-light bg-white text-text-secondary hover:text-text-primary"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-text-secondary">Start</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className={cn(
              "rounded-xl border border-border-light px-3 py-2.5",
              "text-text-primary bg-white",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            )}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-text-secondary">End</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => onEndChange(e.target.value)}
            className={cn(
              "rounded-xl border border-border-light px-3 py-2.5",
              "text-text-primary bg-white",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            )}
          />
        </label>
      </div>
    </div>
  );
}
