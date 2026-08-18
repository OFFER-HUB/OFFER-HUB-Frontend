import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { formatDate, formatResolutionTime } from "@/lib/date-formatters";
import {
  ADMIN_DISPUTE_STATUS_CONFIG,
  ADMIN_DISPUTE_PRIORITY_CONFIG,
  ADMIN_DISPUTE_OUTCOME_CONFIG,
  type AdminDispute,
} from "@/types/admin.types";

const FILLED_PRIMARY_BUTTON = cn(
  "px-5 py-2.5 rounded-xl font-medium cursor-pointer flex items-center gap-2 text-sm",
  "bg-primary text-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:bg-primary-hover",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-200"
);

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-text-secondary text-sm shrink-0">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

export interface DisputeQuickInfoSidebarProps {
  dispute: AdminDispute;
  isResolvable: boolean;
  ageDays: number;
  onChangeStatus: () => void;
  onResolve: () => void;
}

export function DisputeQuickInfoSidebar({
  dispute,
  isResolvable,
  ageDays,
  onChangeStatus,
  onResolve,
}: DisputeQuickInfoSidebarProps): React.JSX.Element {
  const statusCfg = ADMIN_DISPUTE_STATUS_CONFIG[dispute.status];
  const priorityCfg = ADMIN_DISPUTE_PRIORITY_CONFIG[dispute.priority];

  return (
    <div className="space-y-3">
      <InfoRow label="Status">
        <span
          className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusCfg.color, statusCfg.bg)}
        >
          {statusCfg.label}
        </span>
      </InfoRow>
      <InfoRow label="Priority">
        <span
          className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", priorityCfg.color, priorityCfg.bg)}
        >
          {priorityCfg.label}
        </span>
      </InfoRow>
      <InfoRow label="Amount">
        <span className="text-sm font-semibold text-text-primary">
          ${dispute.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </InfoRow>
      <InfoRow label="Opened">
        <span className="text-sm text-text-primary">{formatDate(dispute.createdAt)}</span>
      </InfoRow>
      <InfoRow label="Last Updated">
        <span className="text-sm text-text-primary">{formatDate(dispute.updatedAt)}</span>
      </InfoRow>
      <InfoRow label="Age">
        <span
          className={cn(
            "text-sm font-medium",
            ageDays >= 7 ? "text-error" : ageDays >= 3 ? "text-warning" : "text-text-primary"
          )}
        >
          {ageDays} day{ageDays !== 1 ? "s" : ""}
        </span>
      </InfoRow>
      <InfoRow label="Evidence">
        <span className="text-sm text-text-primary">{dispute.evidence.length} files</span>
      </InfoRow>
      <InfoRow label="Comments">
        <span className="text-sm text-text-primary">{dispute.comments.length}</span>
      </InfoRow>
      {dispute.resolvedAt && (
        <InfoRow label="Resolution Time">
          <span className="text-sm font-medium text-success">
            {formatResolutionTime(dispute.createdAt, dispute.resolvedAt)}
          </span>
        </InfoRow>
      )}
      {dispute.resolutionOutcome && (
        <InfoRow label="Outcome">
          <span
            className={cn("text-xs font-semibold", ADMIN_DISPUTE_OUTCOME_CONFIG[dispute.resolutionOutcome].color)}
          >
            {ADMIN_DISPUTE_OUTCOME_CONFIG[dispute.resolutionOutcome].label}
          </span>
        </InfoRow>
      )}

      {isResolvable && (
        <div className="pt-3 border-t border-border-light space-y-2">
          <button
            type="button"
            onClick={onChangeStatus}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2",
              "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
              "text-primary transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.refresh} size="sm" />
            Change Status
          </button>
          <button
            type="button"
            onClick={onResolve}
            className={cn(FILLED_PRIMARY_BUTTON, "w-full justify-center")}
          >
            <Icon path={ICON_PATHS.check} size="sm" />
            Resolve Dispute
          </button>
        </div>
      )}
    </div>
  );
}
