"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface EarningsZeroStateProps {
  startDate: string;
  endDate: string;
}

export function EarningsZeroState({ startDate, endDate }: EarningsZeroStateProps): React.JSX.Element {
  return (
    <Card variant="neumorphic" padding="lg" className="mb-6 text-center">
      <EmptyState
        variant="default"
        icon={ICON_PATHS.briefcase}
        title="No earnings recorded yet"
        message={`You don't have any completed or settled orders between ${startDate} and ${endDate}.`}
      />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/app/freelancer/services/new"
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer",
            "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:bg-primary-hover hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
          )}
        >
          <Icon path={ICON_PATHS.plus} size="sm" />
          Create a New Service
        </Link>
        <Link
          href="/app/freelancer/services"
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer",
            "bg-background text-text-primary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            "hover:text-primary active:scale-95"
          )}
        >
          <Icon path={ICON_PATHS.briefcase} size="sm" className="text-primary" />
          Manage My Services
        </Link>
      </div>
    </Card>
  );
}
