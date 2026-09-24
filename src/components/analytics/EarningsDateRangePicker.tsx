"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { PresetId } from "@/types/earnings.types";

const PRESETS: { id: Exclude<PresetId, "custom">; label: string }[] = [
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "12m", label: "12 months" },
  { id: "ytd", label: "Year to date" },
  { id: "all", label: "All time" },
];

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
    <Card variant="neumorphic" padding="md" className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon path={ICON_PATHS.calendar} size="sm" className="text-primary" />
          <span className="text-sm font-bold text-text-primary">Filter Date Range</span>
        </div>
        {activePreset === "custom" ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            Custom Range
          </span>
        ) : null}
      </div>

      {/* Preset Pill Buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PRESETS.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <Button
              key={p.id}
              type="button"
              variant={isActive ? "primary" : "ghost"}
              size="sm"
              onClick={() => onPresetChange(p.id)}
              className={cn(
                "transition-all duration-200",
                !isActive &&
                  "bg-background text-text-secondary hover:text-text-primary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
            >
              {p.label}
            </Button>
          );
        })}
      </div>

      {/* Inputs in sunken neumorphic wells without ugly borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="border-none shadow-[var(--shadow-neumorphic-inset-light)] focus:ring-2 focus:ring-primary"
        />
        <Input
          type="date"
          label="End Date"
          value={endDate}
          min={startDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="border-none shadow-[var(--shadow-neumorphic-inset-light)] focus:ring-2 focus:ring-primary"
        />
      </div>
    </Card>
  );
}
