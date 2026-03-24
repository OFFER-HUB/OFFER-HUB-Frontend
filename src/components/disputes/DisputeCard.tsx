import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { DISPUTE_REASON_LABELS, DISPUTE_STATUS_LABELS } from "@/types/dispute.types";
import type { Dispute, DisputeStatus } from "@/types/dispute.types";

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface DisputeCardProps {
  dispute: Dispute;
}

export function DisputeCard({ dispute }: DisputeCardProps): React.JSX.Element {
  const counterparty = dispute.freelancerName ?? dispute.clientName;

  return (
    <Link
      href={`/app/disputes/${dispute.id}`}
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
          {counterparty && (
            <p className="text-text-secondary text-sm mb-1">{counterparty}</p>
          )}
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
