"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAdminDispute } from "@/hooks/useAdminDispute";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { formatDateTime } from "@/lib/date-formatters";
import { StatusBadge } from "@/components/admin/disputes/DisputesTable";
import { DisputePartyCard } from "@/components/admin/disputes/DisputePartyCard";
import { DisputeMilestones } from "@/components/admin/disputes/DisputeMilestones";
import { DisputeResolutionForm } from "@/components/admin/disputes/DisputeResolutionForm";
import { ORDER_STATUS_CONFIG } from "@/types/order.types";
import {
  ADMIN_DISPUTE_REASON_LABELS,
  DISPUTE_OPENED_BY_LABELS,
  RESOLUTION_DECISION_CONFIG,
} from "@/types/admin.types";

const PRIMARY_BUTTON = cn(
  "w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-hover",
  "shadow-[3px_3px_8px_#cbd5e1] active:scale-[0.99] transition-all flex items-center justify-center gap-2",
  "disabled:opacity-60 disabled:cursor-not-allowed"
);

export default function AdminDisputeDetailPage(): React.JSX.Element | null {
  const params = useParams();
  const disputeId = typeof params.id === "string" ? params.id : null;
  const isAuthorized = useAdminGuard();
  const detail = useAdminDispute(disputeId, isAuthorized);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }
  if (detail.isLoading) {
    return <LoadingState message="Loading dispute..." />;
  }
  if (detail.error || !detail.dispute) {
    return (
      <div className="space-y-4">
        <Link href="/admin/disputes" className="text-sm text-primary hover:underline flex items-center gap-1">
          <Icon path={ICON_PATHS.arrowLeft} size="sm" /> Back to disputes
        </Link>
        <ErrorState title="Dispute not found" message={detail.error ?? "This dispute does not exist."} onRetry={detail.refetch} />
      </div>
    );
  }

  const dispute = detail.dispute;
  const { order } = dispute;
  const orderStatus = ORDER_STATUS_CONFIG[order.status];

  async function handleTakeForReview() {
    setActionError(null);
    try {
      await detail.takeForReview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to take the dispute for review.");
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <Link href="/admin/disputes" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
        <Icon path={ICON_PATHS.arrowLeft} size="sm" /> Back to disputes
      </Link>

      {/* Header */}
      <div className={cn(NEUMORPHIC_CARD, "p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4")}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={dispute.status} />
            <span className="text-xs text-text-secondary">
              {DISPUTE_OPENED_BY_LABELS[dispute.openedBy]} · {ADMIN_DISPUTE_REASON_LABELS[dispute.reason]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary truncate">{order.title}</h1>
          <p className="text-xs text-text-secondary font-mono mt-1">
            {dispute.id} · order {order.id}
          </p>
          <p className="text-xs text-text-secondary mt-1">Opened {formatDateTime(dispute.createdAt)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs uppercase tracking-wider text-text-secondary">In escrow</p>
          <p className="text-2xl font-bold text-primary">
            ${Number(order.amount).toFixed(2)} <span className="text-sm text-text-secondary">{order.currency}</span>
          </p>
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", orderStatus.color, orderStatus.bg)}>
            Order {orderStatus.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <section className={cn(NEUMORPHIC_CARD, "p-6")}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Evidence</h2>
            {dispute.evidence.length === 0 ? (
              <p className="text-sm text-text-secondary">No evidence was attached when the dispute was opened.</p>
            ) : (
              <ul className="space-y-2">
                {dispute.evidence.map((url) => (
                  <li key={url} className={cn(NEUMORPHIC_INSET, "p-3 rounded-xl")}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all flex items-center gap-2"
                    >
                      <Icon path={ICON_PATHS.externalLink} size="sm" />
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={cn(NEUMORPHIC_CARD, "p-6")}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Order milestones</h2>
            <DisputeMilestones milestones={order.milestones} currency={order.currency} />
          </section>

          {order.description && (
            <section className={cn(NEUMORPHIC_CARD, "p-6")}>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Order brief</h2>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{order.description}</p>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className={cn(NEUMORPHIC_CARD, "p-6")}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Resolution</h2>

            {dispute.status === "OPEN" && (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Take this dispute for review to freeze it under your name; you can resolve it once it is under review.
                </p>
                <button type="button" onClick={handleTakeForReview} disabled={detail.isActing} className={PRIMARY_BUTTON}>
                  {detail.isActing ? <LoadingSpinner size="sm" className="text-white" /> : <Icon path={ICON_PATHS.eye} size="sm" />}
                  Take for review
                </button>
              </div>
            )}

            {dispute.status === "UNDER_REVIEW" && (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Decide who the escrow goes to. The decision executes on-chain and cannot be undone.
                </p>
                <button type="button" onClick={() => setIsResolveOpen(true)} disabled={detail.isActing} className={PRIMARY_BUTTON}>
                  <Icon path={ICON_PATHS.check} size="sm" />
                  Resolve dispute
                </button>
              </div>
            )}

            {dispute.status === "RESOLVED" && dispute.resolutionDecision && (
              <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl space-y-2")}>
                <span
                  className={cn(
                    "inline-block text-xs font-semibold px-2 py-1 rounded-full",
                    RESOLUTION_DECISION_CONFIG[dispute.resolutionDecision].color,
                    RESOLUTION_DECISION_CONFIG[dispute.resolutionDecision].bg
                  )}
                >
                  {RESOLUTION_DECISION_CONFIG[dispute.resolutionDecision].label}
                </span>
                <p className="text-sm text-text-primary whitespace-pre-wrap">{dispute.decisionNote ?? "No decision note."}</p>
                <p className="text-xs text-text-secondary">Resolved {formatDateTime(dispute.updatedAt)}</p>
              </div>
            )}

            {actionError && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-error/10 text-error text-sm">
                <Icon path={ICON_PATHS.alertCircle} size="sm" />
                <span>{actionError}</span>
              </div>
            )}
          </section>

          <section className={cn(NEUMORPHIC_CARD, "p-6")}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Parties</h2>
            <div className="space-y-3">
              <DisputePartyCard role="Buyer" party={order.buyer} openedDispute={dispute.openedBy === "BUYER"} />
              <DisputePartyCard role="Seller" party={order.seller} openedDispute={dispute.openedBy === "SELLER"} />
            </div>
          </section>

          <section className={cn(NEUMORPHIC_CARD, "p-6")}>
            <h2 className="text-lg font-semibold text-text-primary mb-3">Escrow</h2>
            {order.escrow ? (
              <p className="text-sm text-text-primary">
                <span className="text-text-secondary">Status </span>
                {order.escrow.status}
                <span className="block text-xs text-text-secondary font-mono mt-1">{order.escrow.id}</span>
              </p>
            ) : (
              <p className="text-sm text-text-secondary">No escrow record on this order.</p>
            )}
          </section>
        </div>
      </div>

      <Modal isOpen={isResolveOpen} title="Resolve dispute" onClose={() => setIsResolveOpen(false)}>
        <DisputeResolutionForm
          dispute={dispute}
          onSubmit={async (payload) => {
            await detail.resolve(payload);
            setIsResolveOpen(false);
          }}
          onCancel={() => setIsResolveOpen(false)}
        />
      </Modal>
    </div>
  );
}
