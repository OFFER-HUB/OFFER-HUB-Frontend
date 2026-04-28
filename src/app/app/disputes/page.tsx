"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DisputeCard } from "@/components/disputes/DisputeCard";
import { listDisputes } from "@/lib/api/disputes";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";
import type { Dispute, DisputeStatus } from "@/types/dispute.types";

const STATUS_FILTERS = ["all", "open", "under_review", "resolved", "closed"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function getTabLabel(status: StatusFilter): string {
  if (status === "all") return "All";
  if (status === "under_review") return "Under Review";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DisputesContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);

  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (searchParams.get("created") === "true") {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    setMode("client");
  }, [setMode]);

  useEffect(() => {
    if (!mounted) return;

    async function fetchDisputes(): Promise<void> {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setDisputes([]);
      try {
        const result = await listDisputes(token, {
          status: filter === "all" ? undefined : filter,
          page: 1,
          limit: 10,
        });
        setDisputes(result.data);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load disputes");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDisputes();
  }, [mounted, token, filter, refreshKey]);

  async function handleLoadMore(): Promise<void> {
    if (isLoadingMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const result = await listDisputes(token, {
        status: filter === "all" ? undefined : filter,
        page: nextPage,
        limit: 10,
      });
      setDisputes((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more disputes");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handleFilterChange(status: StatusFilter): void {
    if (status !== filter) {
      setFilter(status as DisputeStatus | "all");
    }
  }

  return (
    <div className="space-y-6">
      {showSuccessMessage && (
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl",
            "bg-success/10 border border-success/20"
          )}
        >
          <Icon path={ICON_PATHS.check} size="md" className="text-success" />
          <p className="text-success font-medium">
            Your dispute has been submitted successfully. We will review it shortly.
          </p>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="ml-auto text-success hover:text-success/80 cursor-pointer"
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Disputes</h1>
          <p className="text-text-secondary mt-1">
            Manage and track your dispute cases
          </p>
        </div>
        <Link
          href="/app/disputes/new"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl",
            "bg-primary text-white font-semibold",
            "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
            "transition-all duration-200"
          )}
        >
          <Icon path={ICON_PATHS.plus} size="md" />
          Open Dispute
        </Link>
      </div>

      <div className={NEUMORPHIC_CARD}>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
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
          "rounded-2xl p-4",
          "bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        {isLoading ? (
          <LoadingState message="Loading disputes..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => setRefreshKey((k) => k + 1)}
          />
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={ICON_PATHS.flag}
            message={
              filter === "all"
                ? "No disputes found"
                : `No ${getTabLabel(filter).toLowerCase()} disputes`
            }
            linkHref="/app/disputes/new"
            linkText="Open a dispute"
          />
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadMore}
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

function LoadingFallback(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-background rounded animate-pulse" />
          <div className="h-5 w-48 bg-background rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-background rounded-xl animate-pulse" />
      </div>
      <div className={cn(NEUMORPHIC_CARD, "h-14 animate-pulse")} />
      <div className={cn(NEUMORPHIC_CARD, "h-32 animate-pulse")} />
      <div className={cn(NEUMORPHIC_CARD, "h-32 animate-pulse")} />
    </div>
  );
}

export default function DisputesPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DisputesContent />
    </Suspense>
  );
}
