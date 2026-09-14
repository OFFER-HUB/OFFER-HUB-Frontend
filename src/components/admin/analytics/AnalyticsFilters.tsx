"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import type { DateRange } from "@/types/admin-analytics.types";

interface AnalyticsFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
}

const PRESET_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last year", days: 365 },
] as const;

export function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  onRefresh,
}: AnalyticsFiltersProps): React.JSX.Element {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(30);

  const handlePresetRange = (days: number) => {
    setActivePreset(days);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    onDateRangeChange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });
  };

  const handleCustomRangeChange = (field: "start" | "end", value: string) => {
    setActivePreset(null);
    onDateRangeChange({
      ...dateRange,
      [field]: value,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-4 sm:p-5")}>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full lg:w-auto">
          {/* Preset Ranges — Sunken capsule segmented control */}
          <div
            className={cn(
              "p-1.5 rounded-2xl bg-background flex flex-wrap items-center gap-1.5",
              NEUMORPHIC_INSET
            )}
          >
            {PRESET_RANGES.map((preset) => {
              const isActive = activePreset === preset.days;
              return (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handlePresetRange(preset.days)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                    "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
                    isActive
                      ? "bg-primary text-white shadow-[2px_2px_6px_#d1d5db] dark:shadow-[2px_2px_6px_#0a0f1a]"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/40"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range — Sunken inputs with zero borders */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="start-date" className="text-xs font-medium text-text-secondary whitespace-nowrap">
                From:
              </label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => handleCustomRangeChange("start", e.target.value)}
                className={cn(
                  "px-3 py-2 text-xs rounded-xl bg-background text-text-primary",
                  NEUMORPHIC_INSET,
                  "outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="end-date" className="text-xs font-medium text-text-secondary whitespace-nowrap">
                To:
              </label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => handleCustomRangeChange("end", e.target.value)}
                className={cn(
                  "px-3 py-2 text-xs rounded-xl bg-background text-text-primary",
                  NEUMORPHIC_INSET,
                  "outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                )}
              />
            </div>
          </div>
        </div>

        {/* Refresh Button — Elevated bilateral soft shadow */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold",
            "bg-white text-primary self-stretch sm:self-auto justify-center",
            "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#0a0f1a,-3px_-3px_6px_#1e2a4a]",
            "hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff] dark:hover:shadow-[1px_1px_3px_#0a0f1a,-1px_-1px_3px_#1e2a4a]",
            "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
            "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
            "transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          )}
        >
          {isRefreshing ? (
            <LoadingSpinner size="sm" className="w-4 h-4 text-primary" />
          ) : (
            <Icon path={ICON_PATHS.refresh} className="w-4 h-4 text-primary" />
          )}
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
}