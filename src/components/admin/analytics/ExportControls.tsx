"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { exportAnalyticsData } from "@/lib/api/admin-analytics";
import { Button } from "@/components/ui/Button";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { AdminAnalyticsData, DateRange, ExportFormat } from "@/types/admin-analytics.types";

interface ExportControlsProps {
  data: AdminAnalyticsData;
  dateRange: DateRange;
}

export function ExportControls({ data, dateRange }: ExportControlsProps): React.JSX.Element {
  const { token } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!token) return;

    try {
      setIsExporting(true);

      const blob = await exportAnalyticsData(token, format, dateRange, true);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${dateRange.start}-to-${dateRange.end}.${format}`;
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
        onClick={() => handleExport('csv')}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <Icon path={ICON_PATHS.externalLink} className="w-4 h-4" />
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <Icon path={ICON_PATHS.file} className="w-4 h-4" />
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </Button>
    </div>
  );
}