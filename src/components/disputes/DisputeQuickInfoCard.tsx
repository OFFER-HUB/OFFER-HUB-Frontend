"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { InfoRow } from "@/components/disputes/InfoRow";
import { NEUMORPHIC_CARD, DANGER_BUTTON } from "@/lib/styles";
import { formatDate } from "@/lib/date-formatters";
import { DISPUTE_STATUS_COLORS } from "@/lib/disputes/dispute-status";
import { DISPUTE_STATUS_LABELS } from "@/types/dispute.types";
import type { Dispute } from "@/types/dispute.types";

interface DisputeQuickInfoCardProps {
  dispute: Dispute;
  isCancelling?: boolean;
  onCancelDispute?: () => Promise<void>;
}

/** The "Quick Info" card shared by the client and freelancer detail pages. */
export function DisputeQuickInfoCard({
  dispute,
  isCancelling = false,
  onCancelDispute,
}: DisputeQuickInfoCardProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Info</h2>
      <div className="space-y-3">
        <InfoRow label="Status">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              DISPUTE_STATUS_COLORS[dispute.status]
            )}
          >
            {DISPUTE_STATUS_LABELS[dispute.status]}
          </span>
        </InfoRow>
        <InfoRow label="Created">
          <span className="text-text-primary text-sm">{formatDate(dispute.createdAt)}</span>
        </InfoRow>
        <InfoRow label="Last Updated">
          <span className="text-text-primary text-sm">{formatDate(dispute.updatedAt)}</span>
        </InfoRow>
        <InfoRow label="Evidence Files">
          <span className="text-text-primary text-sm">{dispute.evidence?.length ?? 0}</span>
        </InfoRow>
        <InfoRow label="Comments">
          <span className="text-text-primary text-sm">{dispute.comments.length}</span>
        </InfoRow>

        {dispute.status === "open" && onCancelDispute && (
          <div className="pt-3 border-t border-border-light">
            <button
              type="button"
              onClick={() => void onCancelDispute()}
              disabled={isCancelling}
              className={cn(DANGER_BUTTON, "w-full justify-center")}
            >
              {isCancelling ? (
                <LoadingSpinner size="sm" className="text-error" />
              ) : (
                <Icon path={ICON_PATHS.close} size="sm" />
              )}
              {isCancelling ? "Cancelling..." : "Cancel Dispute"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}