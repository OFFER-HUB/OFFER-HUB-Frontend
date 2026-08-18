"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { DisputeTimeline } from "@/components/disputes/DisputeTimeline";
import { DisputePartyCard } from "@/components/admin/disputes/DisputePartyCard";
import { DisputeCommentThread } from "@/components/admin/disputes/DisputeCommentThread";
import { InternalNotesPanel } from "@/components/admin/disputes/InternalNotesPanel";
import { DisputeQuickInfoSidebar } from "@/components/admin/disputes/DisputeQuickInfoSidebar";
import {
  DisputeResolutionForm,
  StatusChangeForm,
} from "@/components/admin/disputes/DisputeResolutionForm";
import {
  getAdminDisputeById,
  resolveDispute,
  updateDisputeStatus,
  addInternalNote,
  addAdminComment,
} from "@/lib/api/admin-disputes";
import { formatDate, formatDateTime, formatResolutionTime } from "@/lib/date-formatters";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
  ICON_BUTTON,
} from "@/lib/styles";
import {
  ADMIN_DISPUTE_STATUS_CONFIG,
  ADMIN_DISPUTE_PRIORITY_CONFIG,
  ADMIN_DISPUTE_OUTCOME_CONFIG,
  type AdminDispute,
  type DisputeResolutionOutcome,
} from "@/types/admin.types";
import { DISPUTE_REASON_LABELS } from "@/types/dispute.types";

const FILLED_PRIMARY_BUTTON = cn(
  "px-5 py-2.5 rounded-xl font-medium cursor-pointer flex items-center gap-2 text-sm",
  "bg-primary text-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:bg-primary-hover",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-200"
);

export default function AdminDisputeDetailPage(): React.JSX.Element | null {
  const params = useParams();
  const { token } = useAuthStore();
  const isAuthorized = useAdminGuard();

  const [dispute, setDispute] = useState<AdminDispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Modal states ──
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const disputeId = params.id as string;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthorized || !token) return;

    async function fetchDispute() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminDisputeById(token!, disputeId);
        setDispute(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dispute");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDispute();
  }, [isAuthorized, token, disputeId, refreshKey]);

  // ── Resolve handler ───────────────────────────────────────────────────────
  const handleResolve = useCallback(
    async (outcome: DisputeResolutionOutcome, resolution: string) => {
      if (!token || !dispute) return;
      const updated = await resolveDispute(token, dispute.id, { outcome, resolution });
      setDispute(updated);
      setShowResolveModal(false);
    },
    [token, dispute]
  );

  // ── Status change handler ─────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!token || !dispute) return;
      const updated = await updateDisputeStatus(token, dispute.id, {
        status: newStatus as AdminDispute["status"],
      });
      setDispute(updated);
      setShowStatusModal(false);
    },
    [token, dispute]
  );

  // ── Add admin comment ─────────────────────────────────────────────────────
  const handleSubmitComment = useCallback(
    async (content: string) => {
      if (!token || !dispute) return;
      const updated = await addAdminComment(token, dispute.id, content);
      setDispute(updated);
    },
    [token, dispute]
  );

  // ── Add internal note ─────────────────────────────────────────────────────
  const handleSubmitNote = useCallback(
    async (content: string) => {
      if (!token || !dispute) return;
      const updated = await addInternalNote(token, dispute.id, { content });
      setDispute(updated);
    },
    [token, dispute]
  );

  // ─────────────────────────────────────────────────────────────────────────

  if (!isAuthorized) {
    return <LoadingState variant="fullscreen" message="Checking permissions..." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading dispute..." />;
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
    );
  }

  if (!dispute) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={cn(NEUMORPHIC_CARD, "text-center max-w-md")}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-background shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
            <Icon path={ICON_PATHS.flag} size="xl" className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Dispute not found</h2>
          <p className="text-text-secondary mb-4">
            The dispute you are looking for does not exist or has been removed.
          </p>
          <Link href="/admin/disputes" className={FILLED_PRIMARY_BUTTON + " justify-center"}>
            Back to Disputes
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = ADMIN_DISPUTE_STATUS_CONFIG[dispute.status];
  const priorityCfg = ADMIN_DISPUTE_PRIORITY_CONFIG[dispute.priority];
  const isResolvable = dispute.status === "open" || dispute.status === "under_review";
  const ageMs = Date.now() - new Date(dispute.createdAt).getTime();
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/disputes" className={cn(ICON_BUTTON, "shrink-0 mt-1")}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary truncate">
              {dispute.offerTitle}
            </h1>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-semibold shrink-0",
                statusCfg.color,
                statusCfg.bg
              )}
            >
              {statusCfg.label}
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-semibold shrink-0",
                priorityCfg.color,
                priorityCfg.bg
              )}
            >
              {priorityCfg.label}
            </span>
          </div>
          <p className="text-text-secondary mt-1 text-sm">
            Dispute #{dispute.id} · Opened {formatDate(dispute.createdAt)}
            {ageDays > 0 && (
              <span className={cn("ml-2 font-medium", ageDays >= 7 ? "text-error" : "text-warning")}>
                ({ageDays} days ago)
              </span>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isResolvable && (
            <>
              <button
                type="button"
                onClick={() => setShowStatusModal(true)}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2",
                  "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "text-primary transition-all duration-200"
                )}
              >
                <Icon path={ICON_PATHS.refresh} size="sm" />
                Status
              </button>
              <button
                type="button"
                onClick={() => setShowResolveModal(true)}
                className={FILLED_PRIMARY_BUTTON}
              >
                <Icon path={ICON_PATHS.check} size="sm" />
                Resolve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* ── Left column ── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Dispute details */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Dispute Details</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[140px]">
                  <p className="text-text-secondary text-xs mb-1">Reason</p>
                  <p className="text-text-primary font-medium text-sm">
                    {DISPUTE_REASON_LABELS[dispute.reason]}
                  </p>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <p className="text-text-secondary text-xs mb-1">Disputed Amount</p>
                  <p className="text-text-primary font-semibold text-sm">
                    ${dispute.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <p className="text-text-secondary text-xs mb-1">Related Offer</p>
                  <p className="text-text-primary text-sm font-medium">
                    #{dispute.offerId}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Description</p>
                <p className="text-text-primary text-sm">{dispute.description}</p>
              </div>

              {dispute.resolution && (
                <div className={cn("p-4 rounded-xl", NEUMORPHIC_INSET)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon path={ICON_PATHS.check} size="sm" className="text-success" />
                    <p className="text-sm font-semibold text-success">Resolution</p>
                    {dispute.resolutionOutcome && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          ADMIN_DISPUTE_OUTCOME_CONFIG[dispute.resolutionOutcome].color,
                          "bg-current/10"
                        )}
                      >
                        {ADMIN_DISPUTE_OUTCOME_CONFIG[dispute.resolutionOutcome].label}
                      </span>
                    )}
                  </div>
                  <p className="text-text-primary text-sm">{dispute.resolution}</p>
                  {dispute.resolvedAt && dispute.resolvedBy && (
                    <p className="text-xs text-text-secondary mt-2">
                      Resolved by <span className="font-medium">{dispute.resolvedBy}</span> on{" "}
                      {formatDateTime(dispute.resolvedAt)}
                      {" · "}
                      <span className="font-medium">
                        {formatResolutionTime(dispute.createdAt, dispute.resolvedAt)}
                      </span>{" "}
                      resolution time
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Evidence */}
          {dispute.evidence.length > 0 && (
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Evidence ({dispute.evidence.length} files)
              </h2>
              <div className="space-y-2">
                {dispute.evidence.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        path={
                          file.type.startsWith("image/")
                            ? ICON_PATHS.image
                            : file.type.startsWith("video/")
                            ? ICON_PATHS.video
                            : ICON_PATHS.file
                        }
                        size="md"
                        className="text-text-secondary shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-text-primary text-sm font-medium truncate">{file.name}</p>
                        <p className="text-text-secondary text-xs">
                          {(file.size / 1024).toFixed(0)} KB · Uploaded{" "}
                          {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Discussion ({dispute.comments.length})
            </h2>
            <DisputeCommentThread comments={dispute.comments} onSubmit={handleSubmitComment} />
          </div>

          {/* Internal Notes */}
          <div className={NEUMORPHIC_CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Icon path={ICON_PATHS.lock} size="md" className="text-warning" />
              <h2 className="text-lg font-semibold text-text-primary">
                Internal Notes ({dispute.internalNotes.length})
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">
                Admin only
              </span>
            </div>
            <InternalNotesPanel notes={dispute.internalNotes} onSubmit={handleSubmitNote} />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Quick info */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Info</h2>
            <DisputeQuickInfoSidebar
              dispute={dispute}
              isResolvable={isResolvable}
              ageDays={ageDays}
              onChangeStatus={() => setShowStatusModal(true)}
              onResolve={() => setShowResolveModal(true)}
            />
          </div>

          {/* Parties */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Parties</h2>
            <div className="space-y-3">
              <DisputePartyCard role="Buyer" party={dispute.buyer} />
              <DisputePartyCard role="Seller" party={dispute.seller} />
            </div>
          </div>

          {/* Timeline */}
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Timeline</h2>
            <DisputeTimeline events={dispute.events} />
          </div>
        </div>
      </div>

      {/* Resolve modal */}
      <Modal
        isOpen={showResolveModal}
        title="Resolve Dispute"
        onClose={() => setShowResolveModal(false)}
      >
        <DisputeResolutionForm
          dispute={dispute}
          onSubmit={handleResolve}
          onCancel={() => setShowResolveModal(false)}
        />
      </Modal>

      {/* Status change modal */}
      <Modal
        isOpen={showStatusModal}
        title="Change Dispute Status"
        onClose={() => setShowStatusModal(false)}
      >
        <StatusChangeForm
          dispute={dispute}
          onSubmit={handleStatusChange}
          onCancel={() => setShowStatusModal(false)}
        />
      </Modal>
    </div>
  );
}
