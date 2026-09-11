import { cn } from "@/lib/cn";
import {
  MILESTONE_STATUS_CONFIG,
  type MilestonePaymentStatus,
} from "@/types/order.types";

export interface MilestoneStatusBadgeProps {
  status: MilestonePaymentStatus;
  className?: string;
}

/**
 * Reusable badge for displaying the granular payment status of a milestone.
 * Follows the existing StatusBadge design system conventions.
 */
export function MilestoneStatusBadge({
  status,
  className,
}: MilestoneStatusBadgeProps): React.JSX.Element {
  const config = MILESTONE_STATUS_CONFIG[status] || MILESTONE_STATUS_CONFIG.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tracking-wide",
        config.color,
        config.bg,
        className
      )}
    >
      {config.label}
    </span>
  );
}
