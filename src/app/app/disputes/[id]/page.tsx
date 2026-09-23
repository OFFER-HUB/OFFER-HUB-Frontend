"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DisputeTimeline } from "@/components/disputes/DisputeTimeline";
import { EvidenceList } from "@/components/disputes/EvidenceList";
import { DisputeComments } from "@/components/disputes/DisputeComments";
import { DisputeDetailsCard } from "@/components/disputes/DisputeDetailsCard";
import { DisputeQuickInfoCard } from "@/components/disputes/DisputeQuickInfoCard";
import { DisputeNotFound } from "@/components/disputes/DisputeNotFound";
import { useDisputeDetail } from "@/hooks/useDisputeDetail";
import { formatDate } from "@/lib/date-formatters";
import { toEvidenceUploadItems } from "@/lib/disputes/to-evidence-upload-items";
import { DISPUTE_STATUS_COLORS } from "@/lib/disputes/dispute-status";
import { NEUMORPHIC_CARD, ICON_BUTTON } from "@/lib/styles";
import { DISPUTE_STATUS_LABELS } from "@/types/dispute.types";

export default function DisputeDetailPage(): React.JSX.Element {
  const params = useParams();
  const disputeId = params.id as string;

  const {
    dispute,
    isLoading,
    error,
    newComment,
    setNewComment,
    commentError,
    isSubmitting,
    isCancelling,
    refetch,
    handleSubmitComment,
    handleCancelDispute,
  } = useDisputeDetail({ disputeId, mode: "client" });

  if (isLoading) {
    return <LoadingState message="Loading dispute..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!dispute) {
    return <DisputeNotFound backHref="/app/disputes" />;
  }

  const participant =
    dispute.freelancerName || dispute.clientName
      ? {
          label: dispute.freelancerName ? "Freelancer" : "Client",
          value: dispute.freelancerName ?? dispute.clientName ?? "",
        }
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/app/disputes" className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary truncate">
              {dispute.offerTitle}
            </h1>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium shrink-0",
                DISPUTE_STATUS_COLORS[dispute.status]
              )}
            >
              {DISPUTE_STATUS_LABELS[dispute.status]}
            </span>
          </div>
          <p className="text-text-secondary mt-1">
            Dispute #{dispute.id} • Opened {formatDate(dispute.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <DisputeDetailsCard
            dispute={dispute}
            relatedLabel="Related Offer"
            relatedLinkLabel="View Offer Details"
            relatedHref={`/app/client/offers/${dispute.offerId}`}
            participant={participant}
          />

          {(dispute.evidence?.length ?? 0) > 0 && (
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Evidence ({dispute.evidence?.length ?? 0})
              </h2>
              <EvidenceList items={toEvidenceUploadItems(dispute)} />
            </div>
          )}

          <DisputeComments
            comments={dispute.comments}
            status={dispute.status}
            newComment={newComment}
            onNewCommentChange={setNewComment}
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
            commentError={commentError}
          />
        </div>

        <div className="space-y-4">
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Timeline</h2>
            <DisputeTimeline events={dispute.events} />
          </div>

          <DisputeQuickInfoCard
            dispute={dispute}
            isCancelling={isCancelling}
            onCancelDispute={handleCancelDispute}
          />
        </div>
      </div>
    </div>
  );
}