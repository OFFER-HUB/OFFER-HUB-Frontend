"use client";

import { useRouter } from "next/navigation";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAdminDisputes } from "@/hooks/useAdminDisputes";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { DisputesFilters } from "@/components/admin/disputes/DisputesFilters";
import { DisputesTable } from "@/components/admin/disputes/DisputesTable";
import { DisputesSummary } from "@/components/admin/disputes/DisputesSummary";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";

export default function AdminDisputesPage(): React.JSX.Element | null {
  const router = useRouter();
  const isAuthorized = useAdminGuard();
  const list = useAdminDisputes(isAuthorized);

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon path={ICON_PATHS.flag} size="md" className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Disputes</h1>
          <p className="text-sm text-text-secondary">Review and resolve platform disputes</p>
        </div>
      </div>

      <DisputesSummary disputes={list.disputes} />

      <DisputesFilters filters={list.filters} onFiltersChange={list.setFilters} />

      {list.error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 text-error">
          <Icon path={ICON_PATHS.alertCircle} size="md" />
          <span className="text-sm font-medium">{list.error}</span>
          <button type="button" onClick={() => void list.refetch()} className="ml-auto text-sm underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      <DisputesTable
        disputes={list.disputes}
        isLoading={list.isLoading}
        onViewDetail={(d) => router.push(`/admin/disputes/${d.id}`)}
      />

      {!list.isLoading && (list.page > 1 || list.hasMore) && (
        <div className={cn(NEUMORPHIC_CARD, "p-3 flex items-center justify-between")}>
          <button
            type="button"
            onClick={() => list.setPage(list.page - 1)}
            disabled={list.page <= 1}
            className="text-sm font-semibold text-text-secondary hover:text-primary disabled:opacity-40 flex items-center gap-1"
            aria-label="Previous page"
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            Previous
          </button>
          <span className="text-xs text-text-secondary">Page {list.page}</span>
          <button
            type="button"
            onClick={() => list.setPage(list.page + 1)}
            disabled={!list.hasMore}
            className="text-sm font-semibold text-text-secondary hover:text-primary disabled:opacity-40 flex items-center gap-1"
            aria-label="Next page"
          >
            Next
            <Icon path={ICON_PATHS.chevronRight} size="sm" />
          </button>
        </div>
      )}
    </div>
  );
}
