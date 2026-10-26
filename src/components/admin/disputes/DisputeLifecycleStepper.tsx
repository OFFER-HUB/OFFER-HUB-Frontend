"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import type { AdminDisputeStatus } from "@/types/admin.types";

export interface DisputeLifecycleStepperProps {
  status: AdminDisputeStatus;
  openedBy: "BUYER" | "SELLER";
}

/**
 * Three-step adjudication lifecycle indicator shown at the top of the
 * dispute detail page.  Derives all visual state from `status`.
 */
export function DisputeLifecycleStepper({ status, openedBy }: DisputeLifecycleStepperProps) {
  const isUnderReview = status === "UNDER_REVIEW";
  const isResolved = status === "RESOLVED";

  const stagLabel =
    status === "OPEN"
      ? "Stage 1: Awaiting Review"
      : status === "UNDER_REVIEW"
        ? "Stage 2: Under Investigation"
        : "Stage 3: Adjudication Completed";

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 space-y-4")}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Adjudication Lifecycle
        </p>
        <span className="text-xs font-semibold text-primary">{stagLabel}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Step 1 — always complete */}
        <div
          className={cn(
            "p-3.5 rounded-2xl flex items-center gap-3 transition-all",
            "bg-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]"
          )}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 bg-success text-white shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff]">
            ✓
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">1. Dispute Opened</p>
            <p className="text-[10px] text-text-secondary truncate">
              By {openedBy === "BUYER" ? "Buyer" : "Seller"}
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div
          className={cn(
            "p-3.5 rounded-2xl flex items-center gap-3 transition-all",
            isUnderReview
              ? "bg-primary/5 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              : isResolved
                ? "bg-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]"
                : "opacity-60 bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all",
              isResolved
                ? "bg-success text-white shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff]"
                : isUnderReview
                  ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] animate-pulse"
                  : "bg-background text-text-secondary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
            )}
          >
            {isResolved ? "✓" : "2"}
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "text-xs font-bold truncate",
                isUnderReview
                  ? "text-primary"
                  : isResolved
                    ? "text-text-primary"
                    : "text-text-secondary"
              )}
            >
              2. Under Review
            </p>
            <p className="text-[10px] text-text-secondary truncate">
              Administrator evaluation
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div
          className={cn(
            "p-3.5 rounded-2xl flex items-center gap-3 transition-all",
            isResolved
              ? "bg-primary/5 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              : "opacity-60 bg-background shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all",
              isResolved
                ? "bg-success text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                : "bg-background text-text-secondary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
            )}
          >
            {isResolved ? "✓" : "3"}
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "text-xs font-bold truncate",
                isResolved ? "text-primary" : "text-text-secondary"
              )}
            >
              3. Settled
            </p>
            <p className="text-[10px] text-text-secondary truncate">On-chain distribution</p>
          </div>
        </div>
      </div>
    </div>
  );
}
