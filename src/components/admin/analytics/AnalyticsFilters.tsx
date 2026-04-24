"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import type { DateRange } from "@/types/admin-analytics.types";

interface AnalyticsFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
}

const PRESET_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 },
] as const;

export function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  onRefresh
}: AnalyticsFiltersProps): React.JSX.Element {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    onDateRangeChange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

  const handleCustomRangeChange = (field: 'start' | 'end', value: string) => {
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
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Preset Ranges */}
          <div className="flex flex-wrap gap-2">
            {PRESET_RANGES.map((preset) => (
              <Button
                key={preset.days}
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(preset.days)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm text-text-secondary">
              From:
            </label>
            <input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => handleCustomRangeChange('start', e.target.value)}
              className="px-3 py-1 text-sm border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="end-date" className="text-sm text-text-secondary">
              To:
            </label>
            <input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => handleCustomRangeChange('end', e.target.value)}
              className="px-3 py-1 text-sm border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <LoadingSpinner size="sm" className="w-4 h-4" />
          ) : (
            <Icon path={ICON_PATHS.refresh} className="w-4 h-4" />
          )}
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </Card>
  );
}