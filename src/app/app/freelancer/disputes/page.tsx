"use client";

import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DisputeCard } from "@/components/disputes/DisputeCard";
import { DisputesListLoadingFallback } from "@/components/disputes/DisputesListLoadingFallback";
import { useDisputeList } from "@/hooks/useDisputeList";
import { DISPUTE_STATUS_FILTERS, getTabLabel } from "@/lib/disputes/dispute-status";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";

function DisputesContent(): React.JSX.Element {
  const {
    disputes,
    isLoading,
    error,
    filter,
    hasMore,
    isLoadingMore,
    showSuccessMessage,
    dismissSuccessMessage,
    handleFilterChange,
    handleLoadMore,
    refetch,
  } = useDisputeList({ mode: "freelancer" });

  return (
    <div className="flex flex-col h-full">
      {showSuccessMessage && (
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl mb-4 flex-shrink-0",
            "bg-success/10 border border-success/20"
          )}
        >
          <Icon path={ICON_PATHS.check} size="md" className="text-success" />
          <p className="text-success font-medium">
            Your dispute has been submitted successfully. We will review it shortly.
          </p>
          <button
            onClick={dismissSuccessMessage}
            className="ml-auto text-success hover:text-success/80 cursor-pointer"
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Disputes</h1>
          <p className="text-text-secondary mt-1">
            View and manage disputes related to your services
          </p>
        </div>
      </div>

      <div className={cn(NEUMORPHIC_CARD, "mb-4 flex-shrink-0")}>
        <div className="flex flex-wrap gap-2">
          {DISPUTE_STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleFilterChange(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "transition-all duration-200 cursor-pointer",
                filter === status
                  ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                  : "bg-background text-text-secondary hover:text-text-primary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
              )}
            >
              {getTabLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 min-h-0 overflow-y-auto rounded-2xl",
          "bg-white p-4",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        {isLoading ? (
          <LoadingState message="Loading disputes..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={refetch}
          />
        ) : disputes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={ICON_PATHS.flag}
              message={
                filter === "all"
                  ? "No disputes found"
                  : `No ${getTabLabel(filter).toLowerCase()} disputes`
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                detailHref={`/app/freelancer/disputes/${dispute.id}`}
              />
            ))}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => void handleLoadMore()}
                  disabled={isLoadingMore}
                  className={cn(PRIMARY_BUTTON, "disabled:opacity-50")}
                >
                  {isLoadingMore && (
                    <LoadingSpinner size="sm" className="text-primary" />
                  )}
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FreelancerDisputesPage(): React.JSX.Element {
  return (
    <Suspense fallback={<DisputesListLoadingFallback />}>
      <DisputesContent />
    </Suspense>
  );
}