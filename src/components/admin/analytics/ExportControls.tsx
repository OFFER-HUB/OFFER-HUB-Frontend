"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { exportAnalyticsCsv } from "@/lib/api/admin-analytics";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { DateRange } from "@/types/admin-analytics.types";

interface ExportControlsProps {
  dateRange: DateRange;
}

/** CSV is the only export the backend produces (`GET /admin/analytics/export`). */
export function ExportControls({ dateRange }: ExportControlsProps): React.JSX.Element {
  const { token } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!token) return;

    try {
      setIsExporting(true);

      const blob = await exportAnalyticsCsv(token, dateRange);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${dateRange.start}-to-${dateRange.end}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold",
          "bg-white text-primary",
          "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0a0f1a,-4px_-4px_8px_#1e2a4a]",
          "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:hover:shadow-[2px_2px_4px_#0a0f1a,-2px_-2px_4px_#1e2a4a]",
          "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          "transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        )}
      >
        {isExporting ? (
          <LoadingSpinner size="sm" className="w-4 h-4 text-primary" />
        ) : (
          <Icon path={ICON_PATHS.file} className="w-4 h-4 text-primary" />
        )}
        <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
      </button>
    </div>
  );
}