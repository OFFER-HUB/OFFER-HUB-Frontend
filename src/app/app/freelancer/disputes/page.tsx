"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
} from "@/lib/styles";
import { getFreelancerDisputes } from "@/data/dispute.data";
import { DISPUTE_REASON_LABELS, DISPUTE_STATUS_LABELS } from "@/types/dispute.types";
import type { Dispute, DisputeStatus } from "@/types/dispute.types";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusColor(status: DisputeStatus): string {
  switch (status) {
    case "open":
      return "bg-warning/20 text-warning";
    case "under_review":
      return "bg-primary/20 text-primary";
    case "resolved":
      return "bg-success/20 text-success";
    case "closed":
      return "bg-text-secondary/20 text-text-secondary";
    default:
      return "bg-background text-text-secondary";
  }
}

interface DisputeCardProps {
  dispute: Dispute;
}

function DisputeCard({ dispute }: DisputeCardProps): React.JSX.Element {
  return (
    <Link
      href={`/app/freelancer/disputes/${dispute.id}`}
      className={cn(
        NEUMORPHIC_CARD,
        "block hover:shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]",
        "transition-all duration-200"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium",
                getStatusColor(dispute.status)
              )}
            >
              {DISPUTE_STATUS_LABELS[dispute.status]}
            </span>
            <span className="text-text-secondary text-sm">
              {formatDate(dispute.createdAt)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1 truncate">
            {dispute.offerTitle}
          </h3>
          <p className="text-text-secondary text-sm mb-1">
            Client: {dispute.clientName}
          </p>
          <p className="text-text-secondary text-sm mb-2">
            Reason: {DISPUTE_REASON_LABELS[dispute.reason]}
          </p>
          <p className="text-text-secondary text-sm line-clamp-2">
            {dispute.description}
          </p>
        </div>
        <Icon
          path={ICON_PATHS.chevronRight}
          size="md"
          className="text-text-secondary flex-shrink-0"
        />
      </div>

      {dispute.evidence.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Icon path={ICON_PATHS.file} size="sm" />
            <span>{dispute.evidence.length} file(s) attached</span>
          </div>
        </div>
      )}

      {dispute.resolution && (
        <div className={cn("mt-4 p-3 rounded-lg", NEUMORPHIC_INSET)}>
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-success">Resolution:</span>{" "}
            {dispute.resolution}
          </p>
        </div>
      )}
    </Link>
  );
}

function DisputesContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const { setMode } = useModeStore();
  const [filter, setFilter] = useState<DisputeStatus | "all">("all");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    setMode("freelancer");
    if (searchParams.get("created") === "true") {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [setMode, searchParams]);

  const allDisputes = getFreelancerDisputes();
  const filteredDisputes =
    filter === "all"
      ? allDisputes
      : allDisputes.filter((dispute) => dispute.status === filter);

  const statusCounts = {
    all: allDisputes.length,
    open: allDisputes.filter((d) => d.status === "open").length,
    under_review: allDisputes.filter((d) => d.status === "under_review").length,
    resolved: allDisputes.filter((d) => d.status === "resolved").length,
    closed: allDisputes.filter((d) => d.status === "closed").length,
  };

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
            onClick={() => setShowSuccessMessage(false)}
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
          {(["all", "open", "under_review", "resolved", "closed"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize",
                "transition-all duration-200 cursor-pointer",
                filter === status
                  ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                  : "bg-background text-text-secondary hover:text-text-primary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
              )}
            >
              {status === "under_review" ? "Under Review" : status} ({statusCounts[status]})
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
        {filteredDisputes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={ICON_PATHS.flag}
              message={
                filter === "all"
                  ? "No disputes found"
                  : `No ${filter.replace("_", " ")} disputes`
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
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
      </div>
      <div className={cn(NEUMORPHIC_CARD, "h-14 animate-pulse")} />
      <div className={cn(NEUMORPHIC_CARD, "h-32 animate-pulse")} />
      <div className={cn(NEUMORPHIC_CARD, "h-32 animate-pulse")} />
    </div>
  );
}

export default function FreelancerDisputesPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DisputesContent />
    </Suspense>
  );
}
