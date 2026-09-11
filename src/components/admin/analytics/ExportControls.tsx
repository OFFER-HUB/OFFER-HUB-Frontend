"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { exportAnalyticsCsv } from "@/lib/api/admin-analytics";
import { Button } from "@/components/ui/Button";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
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
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${dateRange.start}-to-${dateRange.end}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      // In a real app, you'd show a toast notification here
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <Icon path={ICON_PATHS.file} className="w-4 h-4" />
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </Button>
    </div>
  );
}